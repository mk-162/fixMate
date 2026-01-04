"""WhatsApp conversation database operations."""
from datetime import datetime
from typing import Optional, Dict, Any, List
from app.db.database import fetch_one, fetch_all, execute_returning, execute


class WhatsAppConversations:
    """Database operations for WhatsApp conversation tracking."""

    async def create_conversation(
        self,
        contact_id: str,
        phone: Optional[str],
        tenant_id: int,
        issue_id: int,
    ) -> Dict[str, Any]:
        """
        Create a new WhatsApp conversation record.

        Links a Respond.io contact to a tenant and issue.
        """
        query = """
            INSERT INTO whatsapp_conversations
            (contact_id, phone, tenant_id, issue_id, status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, 'active', NOW(), NOW())
            RETURNING *
        """
        row = await execute_returning(query, contact_id, phone, tenant_id, issue_id)
        return dict(row)

    async def get_active_conversation(self, contact_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the active conversation for a contact.

        A contact can only have one active conversation at a time.
        """
        query = """
            SELECT wc.*, i.status as issue_status
            FROM whatsapp_conversations wc
            JOIN issues i ON i.id = wc.issue_id
            WHERE wc.contact_id = $1
            AND wc.status = 'active'
            AND i.status NOT IN ('closed', 'resolved_by_agent', 'escalated', 'resolved')
            ORDER BY wc.created_at DESC
            LIMIT 1
        """
        row = await fetch_one(query, contact_id)
        return dict(row) if row else None

    async def get_conversation_by_issue(self, issue_id: int) -> Optional[Dict[str, Any]]:
        """Get the WhatsApp conversation for an issue."""
        query = """
            SELECT * FROM whatsapp_conversations
            WHERE issue_id = $1
            ORDER BY created_at DESC
            LIMIT 1
        """
        row = await fetch_one(query, issue_id)
        return dict(row) if row else None

    async def close_conversation(self, conversation_id: int) -> Optional[Dict[str, Any]]:
        """Mark a conversation as closed."""
        query = """
            UPDATE whatsapp_conversations
            SET status = 'closed', updated_at = NOW()
            WHERE id = $1
            RETURNING *
        """
        row = await execute_returning(query, conversation_id)
        return dict(row) if row else None

    async def close_conversation_by_issue(self, issue_id: int) -> bool:
        """Close all conversations for an issue."""
        query = """
            UPDATE whatsapp_conversations
            SET status = 'closed', updated_at = NOW()
            WHERE issue_id = $1
        """
        await execute(query, issue_id)
        return True

    async def get_tenant_by_phone(self, phone: Optional[str]) -> Optional[Dict[str, Any]]:
        """
        Find a tenant by their phone number.

        Returns tenant with their property_id for issue creation.
        """
        if not phone:
            return None

        # Normalize phone number (remove spaces, ensure + prefix)
        normalized = phone.replace(" ", "").replace("-", "")
        if not normalized.startswith("+"):
            normalized = "+" + normalized

        query = """
            SELECT t.*, p.name as property_name
            FROM tenants t
            LEFT JOIN properties p ON p.id = t.property_id
            WHERE t.phone = $1
            OR t.phone = $2
            LIMIT 1
        """
        row = await fetch_one(query, phone, normalized)
        return dict(row) if row else None

    async def create_pending_registration(
        self,
        contact_id: str,
        phone: Optional[str],
        initial_message: str,
    ) -> Dict[str, Any]:
        """
        Create a pending registration for an unknown contact.

        Used when someone messages from an unrecognized number.
        """
        query = """
            INSERT INTO whatsapp_pending_registrations
            (contact_id, phone, initial_message, status, created_at)
            VALUES ($1, $2, $3, 'pending', NOW())
            ON CONFLICT (contact_id) DO UPDATE
            SET initial_message = $3, updated_at = NOW()
            RETURNING *
        """
        row = await execute_returning(query, contact_id, phone, initial_message)
        return dict(row)

    async def get_pending_registration(self, contact_id: str) -> Optional[Dict[str, Any]]:
        """Get a pending registration by contact ID."""
        query = """
            SELECT * FROM whatsapp_pending_registrations
            WHERE contact_id = $1 AND status = 'pending'
        """
        row = await fetch_one(query, contact_id)
        return dict(row) if row else None

    async def complete_registration(
        self,
        contact_id: str,
        tenant_id: int,
    ) -> bool:
        """Mark a pending registration as complete."""
        query = """
            UPDATE whatsapp_pending_registrations
            SET status = 'completed', tenant_id = $2, updated_at = NOW()
            WHERE contact_id = $1
        """
        await execute(query, contact_id, tenant_id)
        return True

    async def update_contact_phone(
        self,
        contact_id: str,
        phone: str,
    ) -> bool:
        """Update the phone number for a contact's conversations."""
        query = """
            UPDATE whatsapp_conversations
            SET phone = $2, updated_at = NOW()
            WHERE contact_id = $1
        """
        await execute(query, contact_id, phone)
        return True

    async def get_conversations_for_tenant(
        self,
        tenant_id: int,
        include_closed: bool = False,
    ) -> List[Dict[str, Any]]:
        """Get all WhatsApp conversations for a tenant."""
        if include_closed:
            query = """
                SELECT wc.*, i.title as issue_title, i.status as issue_status
                FROM whatsapp_conversations wc
                JOIN issues i ON i.id = wc.issue_id
                WHERE wc.tenant_id = $1
                ORDER BY wc.created_at DESC
            """
        else:
            query = """
                SELECT wc.*, i.title as issue_title, i.status as issue_status
                FROM whatsapp_conversations wc
                JOIN issues i ON i.id = wc.issue_id
                WHERE wc.tenant_id = $1 AND wc.status = 'active'
                ORDER BY wc.created_at DESC
            """
        rows = await fetch_all(query, tenant_id)
        return [dict(row) for row in rows]


# Singleton instance
whatsapp_conversations = WhatsAppConversations()
