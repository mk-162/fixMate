"""Twilio WhatsApp client for sandbox testing."""
import os
from twilio.rest import Client
from twilio.request_validator import RequestValidator
from typing import Optional


class TwilioWhatsAppClient:
    """Client for sending WhatsApp messages via Twilio Sandbox."""

    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
        self.whatsapp_number = os.getenv("TWILIO_WHATSAPP_NUMBER", "")  # e.g., +14155238886

        if self.is_configured():
            self.client = Client(self.account_sid, self.auth_token)
            self.validator = RequestValidator(self.auth_token)
        else:
            self.client = None
            self.validator = None

    def is_configured(self) -> bool:
        """Check if Twilio is properly configured."""
        return bool(self.account_sid and self.auth_token and self.whatsapp_number)

    def validate_request(self, url: str, params: dict, signature: str) -> bool:
        """
        Validate that a request came from Twilio.

        Args:
            url: The full URL of the request
            params: The POST parameters
            signature: The X-Twilio-Signature header
        """
        if not self.validator:
            return True  # Skip validation if not configured (dev mode)
        return self.validator.validate(url, params, signature)

    async def send_message(
        self,
        to_number: str,
        message: str,
    ) -> dict:
        """
        Send a WhatsApp message via Twilio.

        Args:
            to_number: Recipient's phone number in E.164 format (e.g., +447123456789)
            message: The message text to send

        Returns:
            Dict with send status and message SID
        """
        if not self.is_configured():
            return {"error": "Twilio not configured", "sent": False}

        try:
            # Twilio WhatsApp requires 'whatsapp:' prefix
            from_whatsapp = f"whatsapp:{self.whatsapp_number}"
            to_whatsapp = f"whatsapp:{to_number}"

            msg = self.client.messages.create(
                body=message,
                from_=from_whatsapp,
                to=to_whatsapp,
            )

            return {
                "sent": True,
                "message_sid": msg.sid,
                "status": msg.status,
            }
        except Exception as e:
            return {"sent": False, "error": str(e)}

    async def send_template_message(
        self,
        to_number: str,
        template_sid: str,
        variables: Optional[dict] = None,
    ) -> dict:
        """
        Send a template message (for messages outside 24h window).

        Note: Sandbox doesn't require templates, but production does.
        """
        if not self.is_configured():
            return {"error": "Twilio not configured", "sent": False}

        try:
            from_whatsapp = f"whatsapp:{self.whatsapp_number}"
            to_whatsapp = f"whatsapp:{to_number}"

            msg = self.client.messages.create(
                content_sid=template_sid,
                content_variables=variables or {},
                from_=from_whatsapp,
                to=to_whatsapp,
            )

            return {
                "sent": True,
                "message_sid": msg.sid,
                "status": msg.status,
            }
        except Exception as e:
            return {"sent": False, "error": str(e)}


# Singleton instance
twilio_client = TwilioWhatsAppClient()
