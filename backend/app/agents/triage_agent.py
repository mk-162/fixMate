"""Issue Triage Agent - helps tenants troubleshoot before escalating."""
import os
import anthropic
from datetime import datetime, timedelta
from app.db import issues, messages, activity

TRIAGE_SYSTEM_PROMPT = """You are FixMate, a helpful property maintenance assistant. Your goal is to help tenants resolve issues themselves when possible, avoiding unnecessary tradesperson callouts.

## Your Approach

1. **Understand the problem**: Ask clarifying questions to understand exactly what's happening.
2. **Identify simple fixes**: Many issues have simple solutions (check the manual, ensure it's plugged in, reset the breaker, etc.)
3. **Guide troubleshooting**: Walk the tenant through basic troubleshooting steps.
4. **Know when to escalate**: If the issue genuinely requires professional attention, escalate promptly.

## Common Appliance Issues (often user error)

### Washing Machine
- Not starting: Check door is fully closed, check power outlet, check if cycle selector is set
- Not draining: Check drain hose isn't kinked, check filter for blockages (usually at front bottom)
- Leaking: Check door seal, don't overload, use correct detergent amount
- Error codes: Most can be fixed by unplugging for 1 minute and restarting

### Dishwasher
- Not cleaning well: Check spray arms aren't blocked, use correct detergent
- Not draining: Clean the filter, check drain hose
- Won't start: Check door latch, ensure water supply is on

### Heating/Hot Water
- No hot water: Check timer settings, check thermostat, check pilot light (for gas)
- Radiators cold: Bleed the radiators, check TRV settings

## When to Escalate
- Electrical issues with sparks, burning smell, or exposed wires
- Water leaks that can't be stopped
- Gas-related concerns (always escalate)
- Structural issues
- Issues that persist after basic troubleshooting
- Tenant is uncomfortable doing troubleshooting

## Communication Style
- Be friendly and reassuring
- Explain WHY you're asking questions
- Give clear, step-by-step instructions
- Celebrate when issues are resolved without a callout!

IMPORTANT: Always use your tools to interact with the system. Use send_message to communicate with the tenant."""

# Define tools for the agent
TOOLS = [
    {
        "name": "send_message",
        "description": "Send a message to the tenant about their issue. Use this to ask clarifying questions or provide troubleshooting help.",
        "input_schema": {
            "type": "object",
            "properties": {
                "message": {
                    "type": "string",
                    "description": "The message to send to the tenant"
                }
            },
            "required": ["message"]
        }
    },
    {
        "name": "log_reasoning",
        "description": "Log your reasoning or observations about the issue. This helps track decision-making.",
        "input_schema": {
            "type": "object",
            "properties": {
                "reasoning": {
                    "type": "string",
                    "description": "Your reasoning or observations"
                }
            },
            "required": ["reasoning"]
        }
    },
    {
        "name": "escalate_to_property_manager",
        "description": "Escalate the issue to the property manager because it requires professional attention.",
        "input_schema": {
            "type": "object",
            "properties": {
                "reason": {
                    "type": "string",
                    "description": "Why this needs to be escalated"
                },
                "priority": {
                    "type": "string",
                    "enum": ["low", "medium", "high", "urgent"],
                    "description": "Priority level for the escalation"
                }
            },
            "required": ["reason", "priority"]
        }
    },
    {
        "name": "resolve_with_troubleshooting",
        "description": "Mark the issue as resolved because you helped the tenant fix it themselves with troubleshooting advice.",
        "input_schema": {
            "type": "object",
            "properties": {
                "solution": {
                    "type": "string",
                    "description": "What solved the problem"
                }
            },
            "required": ["solution"]
        }
    }
]


class TriageAgent:
    """Agent that triages maintenance issues."""

    def __init__(self):
        self.client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    async def _execute_tool(self, issue_id: int, tool_name: str, tool_input: dict) -> str:
        """Execute a tool and return the result."""
        if tool_name == "send_message":
            await messages.add_message(issue_id, "agent", tool_input["message"])
            await activity.log_activity(
                issue_id,
                "sent_message",
                {"message_preview": tool_input["message"][:100]},
                would_notify="tenant"
            )
            return f"Message sent to tenant: {tool_input['message'][:100]}..."

        elif tool_name == "log_reasoning":
            await activity.log_activity(
                issue_id,
                "reasoning",
                {"reasoning": tool_input["reasoning"]}
            )
            return "Reasoning logged"

        elif tool_name == "escalate_to_property_manager":
            await issues.update_issue_status(issue_id, "escalated")
            await messages.add_message(
                issue_id,
                "system",
                f"Issue escalated to property manager. Reason: {tool_input['reason']}. Priority: {tool_input['priority']}"
            )
            await activity.log_activity(
                issue_id,
                "escalated",
                {"reason": tool_input["reason"], "priority": tool_input["priority"]},
                would_notify="property_manager,landlord"
            )
            return f"Issue escalated with {tool_input['priority']} priority: {tool_input['reason']}"

        elif tool_name == "resolve_with_troubleshooting":
            await issues.update_issue_status(
                issue_id,
                "resolved_by_agent",
                resolved_by_agent=tool_input["solution"]
            )
            # Send confirmation message to tenant
            confirmation = f"Great news - we've resolved this! {tool_input['solution']} If you have any other issues, just message me anytime."
            await messages.add_message(issue_id, "agent", confirmation)
            await messages.add_message(
                issue_id,
                "system",
                f"Issue resolved with agent assistance: {tool_input['solution']}"
            )
            await activity.log_activity(
                issue_id,
                "resolved_by_agent",
                {"solution": tool_input["solution"]},
                would_notify="property_manager"
            )
            return f"Issue resolved! Solution: {tool_input['solution']}"

        return "Unknown tool"

    async def handle_new_issue(self, issue_id: int) -> str:
        """Handle a new issue submission."""
        # Get the issue details
        issue = await issues.get_issue(issue_id)
        if not issue:
            return "Issue not found"

        # Check if agent is muted for this issue
        if await issues.is_agent_muted(issue_id):
            await activity.log_activity(
                issue_id,
                "agent_skipped",
                {"reason": "Agent is muted for this issue"},
                would_notify=None
            )
            return "Agent is muted for this issue - skipping response"

        # Update status to triaging
        await issues.update_issue_status(issue_id, "triaging")

        # Get conversation history
        conversation = await messages.get_conversation_context(issue_id)

        # Build the prompt
        prompt = f"""A tenant has reported a maintenance issue. Please analyze it and help them.

## Issue Details
- **Title**: {issue['title']}
- **Description**: {issue['description']}
- **Category**: {issue.get('category', 'Not specified')}
- **Issue ID**: {issue_id}

## Previous Conversation
{conversation if conversation else "(No previous messages)"}

## Your Task
1. First, log your initial assessment using log_reasoning
2. Then send a helpful message to the tenant asking clarifying questions or providing troubleshooting steps
3. Focus on the most likely simple fix based on the description

Remember: Your goal is to help resolve issues without unnecessary callouts when possible. Start by analyzing what's described and suggest the most likely troubleshooting steps."""

        return await self._run_agent(issue_id, prompt)

    async def handle_tenant_response(self, issue_id: int, tenant_message: str) -> str:
        """Handle a tenant's response in an ongoing conversation."""
        # Record the tenant message
        await messages.add_message(issue_id, "tenant", tenant_message)

        # Get the issue and full conversation
        issue = await issues.get_issue(issue_id)
        if not issue:
            return "Issue not found"

        # Check if agent is muted for this issue
        if await issues.is_agent_muted(issue_id):
            await activity.log_activity(
                issue_id,
                "agent_skipped",
                {"reason": "Agent is muted - message recorded but not responded to"},
                would_notify=None
            )
            return "Agent is muted for this issue - message recorded but not responded to"

        conversation = await messages.get_conversation_context(issue_id)

        tenant_name = issue.get('tenant_name', 'the tenant')
        first_name = tenant_name.split()[0] if tenant_name else 'there'
        property_name = issue.get('property_name', 'their property')

        prompt = f"""The tenant has responded to your previous message. Continue helping them.

## Tenant & Property
- **Tenant**: {tenant_name}
- **Property**: {property_name} ({issue.get('property_address', 'address not specified')})

## Issue Details
- **Title**: {issue['title']}
- **Description**: {issue['description']}
- **Status**: {issue['status']}

## Conversation So Far
{conversation}

## Your Task
Address {first_name} by name. Based on their response:
1. If they confirmed something works, move to the next step or mark as resolved
2. If troubleshooting failed, try alternative approaches or escalate
3. If they provided new information, incorporate it into your assessment"""

        return await self._run_agent(issue_id, prompt)

    async def _run_agent(self, issue_id: int, prompt: str) -> str:
        """Run the agent with tool use loop."""
        messages_list = [{"role": "user", "content": prompt}]

        # Agent loop - max 5 turns
        for _ in range(5):
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                system=TRIAGE_SYSTEM_PROMPT,
                tools=TOOLS,
                messages=messages_list
            )

            # Check if we're done (no more tool use)
            if response.stop_reason == "end_turn":
                # Extract any final text
                for block in response.content:
                    if hasattr(block, "text"):
                        return block.text
                return "Agent completed"

            # Process tool calls
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    result = await self._execute_tool(issue_id, block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result
                    })

            if not tool_results:
                break

            # Add assistant message and tool results
            messages_list.append({"role": "assistant", "content": response.content})
            messages_list.append({"role": "user", "content": tool_results})

        return "Agent loop completed"


# ============================================================================
# Analytics & Reporting (for investor demos)
# ============================================================================

class AgentAnalytics:
    """Analytics for agent performance - great for investor demos!"""

    @staticmethod
    async def get_resolution_stats():
        """Get statistics on agent resolution performance."""
        from app.db.database import fetch_one

        # Total issues
        total = await fetch_one("SELECT COUNT(*) as count FROM issues")

        # Resolved by agent
        resolved_by_agent = await fetch_one(
            "SELECT COUNT(*) as count FROM issues WHERE status = 'resolved_by_agent'"
        )

        # Escalated
        escalated = await fetch_one(
            "SELECT COUNT(*) as count FROM issues WHERE status = 'escalated'"
        )

        # Calculate savings (assuming £150 average callout cost)
        callout_cost = 150
        savings = (resolved_by_agent['count'] if resolved_by_agent else 0) * callout_cost

        return {
            "total_issues": total['count'] if total else 0,
            "resolved_by_agent": resolved_by_agent['count'] if resolved_by_agent else 0,
            "escalated": escalated['count'] if escalated else 0,
            "resolution_rate": (
                (resolved_by_agent['count'] / total['count'] * 100)
                if total and total['count'] > 0 else 0
            ),
            "estimated_savings": savings,
            "avg_callout_cost": callout_cost,
        }

    @staticmethod
    async def get_category_breakdown():
        """Get issue breakdown by category."""
        from app.db.database import fetch_all

        rows = await fetch_all("""
            SELECT
                COALESCE(category, 'uncategorized') as category,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'resolved_by_agent' THEN 1 ELSE 0 END) as resolved,
                SUM(CASE WHEN status = 'escalated' THEN 1 ELSE 0 END) as escalated
            FROM issues
            GROUP BY category
            ORDER BY total DESC
        """)

        return [dict(row) for row in rows] if rows else []

    @staticmethod
    async def get_response_time_stats():
        """Get agent response time statistics."""
        from app.db.database import fetch_one

        # Average time between issue creation and first agent message
        stats = await fetch_one("""
            SELECT
                AVG(EXTRACT(EPOCH FROM (m.created_at - i.created_at))) as avg_response_seconds
            FROM issues i
            JOIN issue_messages m ON i.id = m.issue_id
            WHERE m.role = 'agent'
            AND m.id = (
                SELECT MIN(id) FROM issue_messages
                WHERE issue_id = i.id AND role = 'agent'
            )
        """)

        avg_seconds = stats['avg_response_seconds'] if stats and stats['avg_response_seconds'] else 0

        return {
            "avg_response_seconds": round(avg_seconds, 2),
            "avg_response_formatted": f"{int(avg_seconds // 60)}m {int(avg_seconds % 60)}s" if avg_seconds else "N/A"
        }
