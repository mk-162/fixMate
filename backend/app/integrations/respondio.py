"""Respond.io API client for WhatsApp messaging."""
import os
import httpx
from typing import Optional
from datetime import datetime


class RespondIOClient:
    """Client for Respond.io API to send/receive WhatsApp messages."""

    def __init__(self):
        self.api_key = os.getenv("RESPONDIO_API_KEY", "")
        self.workspace_id = os.getenv("RESPONDIO_WORKSPACE_ID", "")
        self.base_url = "https://api.respond.io/v2"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def is_configured(self) -> bool:
        """Check if Respond.io is properly configured."""
        return bool(self.api_key and self.workspace_id)

    async def send_message(
        self,
        contact_id: str,
        message: str,
        channel_id: Optional[str] = None,
    ) -> dict:
        """
        Send a message to a contact via Respond.io.

        Args:
            contact_id: The Respond.io contact ID
            message: The message text to send
            channel_id: Optional specific channel (defaults to WhatsApp)

        Returns:
            API response dict
        """
        if not self.is_configured():
            return {"error": "Respond.io not configured", "sent": False}

        url = f"{self.base_url}/contact/{contact_id}/message"

        payload = {
            "message": {
                "type": "text",
                "text": message,
            }
        }

        if channel_id:
            payload["channelId"] = channel_id

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    url,
                    headers=self.headers,
                    json=payload,
                    timeout=10.0,
                )
                response.raise_for_status()
                return {"sent": True, "response": response.json()}
            except httpx.HTTPError as e:
                return {"sent": False, "error": str(e)}

    async def get_contact(self, contact_id: str) -> Optional[dict]:
        """Get contact details from Respond.io."""
        if not self.is_configured():
            return None

        url = f"{self.base_url}/contact/{contact_id}"

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    url,
                    headers=self.headers,
                    timeout=10.0,
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError:
                return None

    async def get_contact_by_phone(self, phone: str) -> Optional[dict]:
        """
        Search for a contact by phone number.

        Args:
            phone: Phone number in international format (e.g., +447123456789)
        """
        if not self.is_configured():
            return None

        url = f"{self.base_url}/contact/phone:{phone}"

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    url,
                    headers=self.headers,
                    timeout=10.0,
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError:
                return None

    async def add_contact_tag(self, contact_id: str, tag: str) -> bool:
        """Add a tag to a contact for organization."""
        if not self.is_configured():
            return False

        url = f"{self.base_url}/contact/{contact_id}/tag"
        payload = {"tag": tag}

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    url,
                    headers=self.headers,
                    json=payload,
                    timeout=10.0,
                )
                response.raise_for_status()
                return True
            except httpx.HTTPError:
                return False

    async def update_contact_custom_field(
        self,
        contact_id: str,
        field_name: str,
        value: str,
    ) -> bool:
        """
        Update a custom field on a contact.
        Useful for storing issue_id or tenant_id.
        """
        if not self.is_configured():
            return False

        url = f"{self.base_url}/contact/{contact_id}"
        payload = {
            "customFields": {
                field_name: value,
            }
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.put(
                    url,
                    headers=self.headers,
                    json=payload,
                    timeout=10.0,
                )
                response.raise_for_status()
                return True
            except httpx.HTTPError:
                return False


# Singleton instance
respondio_client = RespondIOClient()
