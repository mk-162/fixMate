"""Webhook handlers for external integrations."""
import os
import hmac
import hashlib
from fastapi import APIRouter, HTTPException, Request, BackgroundTasks, Form
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

from app.db import issues, messages, activity
from app.db.whatsapp import whatsapp_conversations
from app.agents import TriageAgent
from app.integrations import respondio_client, twilio_client

router = APIRouter()
triage_agent = TriageAgent()


class RespondIOWebhookPayload(BaseModel):
    """Respond.io webhook payload structure."""
    event: str  # e.g., "message:received", "message:sent"
    timestamp: str
    data: dict


class IncomingMessage(BaseModel):
    """Structure for incoming message data."""
    contact_id: str
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    message_id: str
    message_type: str  # text, image, document, etc.
    text: Optional[str] = None
    channel: Optional[str] = None
    metadata: Optional[dict] = None


def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    """
    Verify Respond.io webhook signature.

    Respond.io signs webhooks with HMAC-SHA256.
    """
    secret = os.getenv("RESPONDIO_WEBHOOK_SECRET", "")
    if not secret:
        # If no secret configured, skip verification (dev mode)
        return True

    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(expected, signature)


async def process_whatsapp_message(message: IncomingMessage):
    """
    Process an incoming WhatsApp message.

    Routes to existing conversation or creates new issue.
    """
    # Skip non-text messages for now (could handle images later)
    if message.message_type != "text" or not message.text:
        return

    # Check if we have an active conversation for this contact
    conversation = await whatsapp_conversations.get_active_conversation(
        message.contact_id
    )

    if conversation:
        # Continue existing conversation
        issue_id = conversation["issue_id"]

        # Record the message
        await messages.add_message(issue_id, "tenant", message.text)

        # Log activity
        await activity.log_activity(
            issue_id,
            "whatsapp_message_received",
            {
                "contact_id": message.contact_id,
                "message_preview": message.text[:100],
            }
        )

        # Trigger agent response
        try:
            await triage_agent.handle_tenant_response(issue_id, message.text)

            # Send agent's response back via WhatsApp
            await send_agent_response_to_whatsapp(issue_id, message.contact_id)

        except Exception as e:
            await activity.log_activity(
                issue_id,
                "agent_error",
                {"error": str(e), "source": "whatsapp"}
            )
            # Send error message to user
            await respondio_client.send_message(
                message.contact_id,
                "Sorry, I'm having trouble processing your message. "
                "Please try again or contact your property manager directly."
            )
    else:
        # New conversation - create an issue
        await handle_new_whatsapp_issue(message)


async def handle_new_whatsapp_issue(message: IncomingMessage):
    """Handle a new issue reported via WhatsApp."""

    # Try to find tenant by phone number
    tenant = await whatsapp_conversations.get_tenant_by_phone(message.phone)

    if not tenant:
        # Unknown number - ask them to register or provide details
        await respondio_client.send_message(
            message.contact_id,
            "Hi! I'm FixMate, your property maintenance assistant. "
            "I don't have your phone number on file yet.\n\n"
            "Please reply with your name and the property address you're renting, "
            "and I'll get you set up!"
        )

        # Create a pending registration conversation
        await whatsapp_conversations.create_pending_registration(
            contact_id=message.contact_id,
            phone=message.phone,
            initial_message=message.text,
        )
        return

    # Create new issue from the message
    issue = await issues.create_issue(
        tenant_id=tenant["id"],
        property_id=tenant["property_id"],
        title=f"WhatsApp: {message.text[:50]}...",
        description=message.text,
        category=None,  # Agent will categorize
    )

    # Create the WhatsApp conversation record
    await whatsapp_conversations.create_conversation(
        contact_id=message.contact_id,
        phone=message.phone,
        tenant_id=tenant["id"],
        issue_id=issue["id"],
    )

    # Record the initial message
    await messages.add_message(
        issue["id"],
        "tenant",
        f"[Via WhatsApp] {message.text}"
    )

    # Log activity
    await activity.log_activity(
        issue["id"],
        "issue_created_via_whatsapp",
        {
            "contact_id": message.contact_id,
            "phone": message.phone,
        }
    )

    # Trigger the triage agent
    try:
        await triage_agent.handle_new_issue(issue["id"])

        # Send agent's response back via WhatsApp
        await send_agent_response_to_whatsapp(issue["id"], message.contact_id)

    except Exception as e:
        await activity.log_activity(
            issue["id"],
            "agent_error",
            {"error": str(e), "source": "whatsapp"}
        )
        await respondio_client.send_message(
            message.contact_id,
            "Thanks for reporting this issue! I'll look into it and get back to you shortly."
        )


async def send_agent_response_to_whatsapp(issue_id: int, contact_id: str):
    """
    Get the latest agent message and send it to WhatsApp.
    """
    # Get recent messages
    recent_messages = await messages.get_messages(issue_id, limit=5)

    # Find the most recent agent message
    for msg in reversed(recent_messages):
        if msg["role"] == "agent":
            result = await respondio_client.send_message(
                contact_id,
                msg["content"]
            )

            if result.get("sent"):
                await activity.log_activity(
                    issue_id,
                    "whatsapp_message_sent",
                    {"contact_id": contact_id, "message_preview": msg["content"][:100]}
                )
            break


# Webhook endpoint
@router.post("/webhooks/respondio")
async def respondio_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
):
    """
    Handle incoming webhooks from Respond.io.

    Must respond within 5 seconds to avoid timeout.
    Heavy processing is done in background tasks.
    """
    # Get raw body for signature verification
    body = await request.body()

    # Verify signature
    signature = request.headers.get("X-Respond-Signature", "")
    if not verify_webhook_signature(body, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    # Parse payload
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    event_type = payload.get("event", "")
    data = payload.get("data", {})

    # Only process incoming messages
    if event_type == "message:received":
        # Extract message details
        message = IncomingMessage(
            contact_id=data.get("contact", {}).get("id", ""),
            contact_name=data.get("contact", {}).get("name"),
            phone=data.get("contact", {}).get("phone"),
            message_id=data.get("message", {}).get("id", ""),
            message_type=data.get("message", {}).get("type", "text"),
            text=data.get("message", {}).get("text"),
            channel=data.get("channel", {}).get("type"),
            metadata=data,
        )

        # Process in background to respond quickly
        background_tasks.add_task(process_whatsapp_message, message)

    # Always respond quickly with 200 OK
    return {"status": "ok", "event": event_type}


@router.get("/webhooks/respondio")
async def respondio_webhook_verify(request: Request):
    """
    Verification endpoint for Respond.io webhook setup.

    Some webhook providers send a GET request to verify the endpoint.
    """
    return {"status": "ok", "service": "FixMate WhatsApp Integration"}


# =============================================================================
# TWILIO WHATSAPP SANDBOX WEBHOOK
# =============================================================================

def parse_twilio_phone(twilio_from: str) -> str:
    """
    Parse phone number from Twilio format.

    Twilio sends: 'whatsapp:+447123456789'
    We want: '+447123456789'
    """
    if twilio_from.startswith("whatsapp:"):
        return twilio_from[9:]  # Remove 'whatsapp:' prefix
    return twilio_from


async def process_twilio_message(
    from_number: str,
    body: str,
    message_sid: str,
):
    """
    Process an incoming WhatsApp message from Twilio.

    Similar to process_whatsapp_message but uses phone as contact_id.
    """
    phone = parse_twilio_phone(from_number)
    contact_id = phone

    # Check if we have an active conversation for this phone
    conversation = await whatsapp_conversations.get_active_conversation(contact_id)

    if conversation:
        # Continue existing conversation
        issue_id = conversation["issue_id"]

        # QUICK WIN: Send instant acknowledgment
        await twilio_client.send_message(phone, "Got it, let me check on that...")

        # Record the message
        await messages.add_message(issue_id, "tenant", body)

        # Log activity
        await activity.log_activity(
            issue_id,
            "whatsapp_message_received",
            {
                "phone": phone,
                "message_sid": message_sid,
                "message_preview": body[:100],
            }
        )

        # Trigger agent response
        try:
            await triage_agent.handle_tenant_response(issue_id, body)
            await send_twilio_agent_response(issue_id, phone)

        except Exception as e:
            print(f"ERROR in process_twilio_message: {e}")
            await activity.log_activity(
                issue_id,
                "agent_error",
                {"error": str(e), "source": "twilio_whatsapp"}
            )
            await twilio_client.send_message(
                phone,
                "Sorry, I'm having trouble right now. Your property manager has been notified and will get back to you soon."
            )
    else:
        # Check if this is a pending registration (user responding with their details)
        pending = await whatsapp_conversations.get_pending_registration(contact_id)
        if pending:
            await handle_registration_response(phone, body, pending)
        else:
            # New conversation - create an issue or start registration
            await handle_new_twilio_issue(phone, body, message_sid)


async def handle_registration_response(phone: str, body: str, pending: dict):
    """
    Handle a user responding to the registration prompt.

    Try to match them to a property and create their tenant record.
    """
    from app.db.database import fetch_all, fetch_one

    # Get all properties to try to match
    properties = await fetch_all("""
        SELECT id, name, address FROM properties ORDER BY name
    """)

    if not properties:
        await twilio_client.send_message(
            phone,
            "Sorry, no properties are set up yet. Please contact your property manager directly."
        )
        return

    # Try to match the property from their message
    body_lower = body.lower()
    matched_property = None

    for prop in properties:
        prop_name = (prop["name"] or "").lower()
        prop_address = (prop["address"] or "").lower()
        if prop_name in body_lower or prop_address in body_lower:
            matched_property = prop
            break

    if matched_property:
        # Great! We found a match - create the tenant
        await complete_registration(phone, body, matched_property, pending)
    else:
        # Couldn't match - show them the options
        property_list = "\n".join([
            f"- {p['name']}" + (f" ({p['address']})" if p['address'] else "")
            for p in properties[:5]  # Limit to 5
        ])

        await twilio_client.send_message(
            phone,
            f"I couldn't find that property. Here are the properties I manage:\n\n"
            f"{property_list}\n\n"
            f"Please reply with your name and one of these property names."
        )


async def complete_registration(phone: str, body: str, property: dict, pending: dict):
    """Complete the registration and create the tenant record."""
    from app.db.database import execute_returning

    # Extract name from the message (simple: take text before property name)
    name = body.strip()
    prop_name_lower = property["name"].lower()
    if prop_name_lower in body.lower():
        name_part = body.lower().split(prop_name_lower)[0].strip()
        if name_part:
            # Clean up common prefixes
            for prefix in ["my name is ", "i'm ", "i am ", "this is ", "hi i'm ", "hi, i'm "]:
                if name_part.startswith(prefix):
                    name_part = name_part[len(prefix):]
            name = name_part.strip().title() or "Tenant"

    # Create the tenant
    tenant = await execute_returning("""
        INSERT INTO tenants (name, phone, property_id, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, TRUE, NOW(), NOW())
        RETURNING *
    """, name, phone, property["id"])

    # Complete the registration
    await whatsapp_conversations.complete_registration(phone, tenant["id"])

    # Welcome message
    await twilio_client.send_message(
        phone,
        f"Perfect! I've linked your number to {property['name']}.\n\n"
        f"You can now message me anytime about maintenance issues. "
        f"What can I help you with today?\n\n"
        f"(Your original message: \"{pending['initial_message'][:100]}...\")"
        if len(pending['initial_message']) > 100
        else f"Perfect! I've linked your number to {property['name']}.\n\n"
        f"You can now message me anytime about maintenance issues. "
        f"What can I help you with today?\n\n"
        f"(Your original message: \"{pending['initial_message']}\")"
    )

    # Now create an issue from their original message
    from app.db import issues as issues_db

    issue = await issues_db.create_issue(
        tenant_id=tenant["id"],
        property_id=property["id"],
        title=f"WhatsApp: {pending['initial_message'][:50]}",
        description=pending['initial_message'],
        category=None,
    )

    # Create conversation record
    await whatsapp_conversations.create_conversation(
        contact_id=phone,
        phone=phone,
        tenant_id=tenant["id"],
        issue_id=issue["id"],
    )

    # Trigger the agent to respond to their original issue
    try:
        await triage_agent.handle_new_issue(issue["id"])
        await send_twilio_agent_response(issue["id"], phone)
    except Exception as e:
        print(f"Error triggering agent after registration: {e}")


async def handle_new_twilio_issue(phone: str, body: str, message_sid: str):
    """Handle a new issue reported via Twilio WhatsApp."""
    from app.db.database import fetch_all
    print(f"Handling new Twilio issue from {phone}")

    # Try to find tenant by phone number
    try:
        tenant = await whatsapp_conversations.get_tenant_by_phone(phone)
    except Exception as e:
        print(f"DB Error looking up tenant: {e}")
        await twilio_client.send_message(
            phone,
            "Sorry, I'm having technical difficulties. Please try again in a few minutes."
        )
        return

    if not tenant:
        print(f"Tenant not found for {phone}. Sending registration prompt.")

        # Get available properties to show the user
        try:
            properties = await fetch_all("""
                SELECT name, address FROM properties ORDER BY name LIMIT 5
            """)
            if properties:
                property_list = "\n".join([
                    f"- {p['name']}" + (f" ({p['address']})" if p['address'] else "")
                    for p in properties
                ])
                message = (
                    f"Hi! I'm FixMate, your property maintenance assistant.\n\n"
                    f"I don't have your phone number on file yet. "
                    f"Here are the properties I manage:\n\n"
                    f"{property_list}\n\n"
                    f"Please reply with your name and which property you live at, "
                    f"and I'll get you set up!"
                )
            else:
                message = (
                    "Hi! I'm FixMate, your property maintenance assistant.\n\n"
                    "I don't have your phone number on file yet, and no properties "
                    "are set up. Please contact your property manager directly."
                )
        except Exception:
            message = (
                "Hi! I'm FixMate, your property maintenance assistant.\n\n"
                "I don't have your phone number on file yet. "
                "Please reply with your name and property address, "
                "and I'll get you set up!"
            )

        result = await twilio_client.send_message(phone, message)
        print(f"Registration prompt result: {result}")

        # Create a pending registration conversation
        await whatsapp_conversations.create_pending_registration(
            contact_id=phone,
            phone=phone,
            initial_message=body,
        )
        return

    print(f"Found tenant {tenant['id']}. Creating issue.")

    # QUICK WIN: Instant acknowledgment for known users
    property_name = tenant.get("property_name", "your property")
    await twilio_client.send_message(
        phone,
        f"Hi {tenant['name'].split()[0]}! Got your message. Let me look into this for {property_name}..."
    )

    # Create new issue from the message
    issue = await issues.create_issue(
        tenant_id=tenant["id"],
        property_id=tenant["property_id"],
        title=f"WhatsApp: {body[:50]}..." if len(body) > 50 else f"WhatsApp: {body}",
        description=body,
        category=None,  # Agent will categorize
    )

    # Create the WhatsApp conversation record
    await whatsapp_conversations.create_conversation(
        contact_id=phone,  # Use phone as contact_id for Twilio
        phone=phone,
        tenant_id=tenant["id"],
        issue_id=issue["id"],
    )

    # Record the initial message
    await messages.add_message(
        issue["id"],
        "tenant",
        f"[Via WhatsApp] {body}"
    )

    # Log activity
    await activity.log_activity(
        issue["id"],
        "issue_created_via_whatsapp",
        {
            "phone": phone,
            "message_sid": message_sid,
        }
    )

    # Trigger the triage agent
    try:
        await triage_agent.handle_new_issue(issue["id"])

        # Send agent's response back via WhatsApp
        await send_twilio_agent_response(issue["id"], phone)

    except Exception as e:
        print(f"Agent error for issue {issue['id']}: {e}")
        await activity.log_activity(
            issue["id"],
            "agent_error",
            {"error": str(e), "source": "twilio_whatsapp"}
        )
        await twilio_client.send_message(
            phone,
            "I've logged your issue and your property manager will be in touch soon. "
            "Is there anything else you'd like to add?"
        )


async def send_twilio_agent_response(issue_id: int, phone: str):
    """
    Get the latest agent message and send it via Twilio WhatsApp.
    """
    # Get recent messages
    recent_messages = await messages.get_messages(issue_id, limit=5)

    # Find the most recent agent message
    for msg in reversed(recent_messages):
        if msg["role"] == "agent":
            result = await twilio_client.send_message(
                phone,
                msg["content"]
            )

            if result.get("sent"):
                await activity.log_activity(
                    issue_id,
                    "whatsapp_message_sent",
                    {
                        "phone": phone,
                        "message_sid": result.get("message_sid"),
                        "message_preview": msg["content"][:100],
                    }
                )
            else:
                await activity.log_activity(
                    issue_id,
                    "whatsapp_send_failed",
                    {
                        "phone": phone,
                        "error": result.get("error"),
                    }
                )
            break


@router.post("/webhooks/twilio", response_class=PlainTextResponse)
async def twilio_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
):
    """
    Handle incoming webhooks from Twilio WhatsApp Sandbox.

    Twilio sends form-encoded data, not JSON.
    Must respond with TwiML or empty 200 to acknowledge.
    """
    # Get form data
    form_data = await request.form()

    # Validate the request is from Twilio (optional but recommended)
    signature = request.headers.get("X-Twilio-Signature", "")
    if twilio_client.is_configured():
        # Build URL for validation
        url = str(request.url)
        params = {key: form_data[key] for key in form_data}

        if not twilio_client.validate_request(url, params, signature):
            # Log but don't reject in sandbox mode
            print(f"Warning: Twilio signature validation failed for {url}")

    # Extract message details
    from_number = form_data.get("From", "")
    body = form_data.get("Body", "")
    message_sid = form_data.get("MessageSid", "")

    print(f"[TWILIO WEBHOOK] Received message from {from_number}: {body[:50]}...")
    print(f"[TWILIO WEBHOOK] Twilio configured: {twilio_client.is_configured()}")

    # Only process if we have a message
    if from_number and body:
        # Process in background to respond quickly
        background_tasks.add_task(
            process_twilio_message_with_logging,
            from_number,
            body,
            message_sid,
        )
    else:
        print(f"[TWILIO WEBHOOK] No message to process (from={from_number}, body={body})")

    # Return empty TwiML response (acknowledges receipt, no auto-reply)
    return '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'


async def process_twilio_message_with_logging(from_number: str, body: str, message_sid: str):
    """Wrapper to catch and log all errors in background task."""
    try:
        print(f"[BACKGROUND] Starting to process message from {from_number}")
        await process_twilio_message(from_number, body, message_sid)
        print(f"[BACKGROUND] Finished processing message from {from_number}")
    except Exception as e:
        print(f"[BACKGROUND ERROR] Failed to process message: {e}")
        import traceback
        traceback.print_exc()
        # Try to send error message to user
        try:
            phone = parse_twilio_phone(from_number)
            await twilio_client.send_message(
                phone,
                "Sorry, something went wrong. Please try again or contact your property manager."
            )
        except Exception as send_error:
            print(f"[BACKGROUND ERROR] Also failed to send error message: {send_error}")


@router.get("/webhooks/twilio")
async def twilio_webhook_verify():
    """
    Health check endpoint for Twilio webhook.
    """
    return {
        "status": "ok",
        "service": "FixMate Twilio WhatsApp Integration",
        "configured": twilio_client.is_configured(),
    }
