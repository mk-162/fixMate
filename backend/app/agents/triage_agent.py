"""FixMate Triage Agent - Powered by Claude Agent SDK.

This agent helps tenants troubleshoot maintenance issues before escalating to professionals.
Features:
- Emergency detection (gas leaks, flooding, fires)
- Smart categorization and priority assessment
- Cost estimation for repairs
- Multi-turn conversational troubleshooting
- Sentiment tracking for tenant satisfaction
- Photo analysis readiness (when images provided)
"""

import os
import asyncio
from datetime import datetime
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from enum import Enum

from claude_agent_sdk import (
    ClaudeSDKClient,
    ClaudeAgentOptions,
    tool,
    create_sdk_mcp_server,
    AssistantMessage,
    TextBlock,
    ToolUseBlock,
    ResultMessage,
)

from app.db import issues, messages, activity


class UrgencyLevel(Enum):
    """Issue urgency levels for smart prioritization."""
    EMERGENCY = "emergency"  # Gas leak, fire, flooding - immediate action
    HIGH = "high"           # No heating in winter, broken lock, water damage
    MEDIUM = "medium"       # Appliance not working, minor leak
    LOW = "low"             # Cosmetic issues, minor inconveniences


@dataclass
class TenantSentiment:
    """Track tenant sentiment during conversation."""
    score: float  # -1.0 to 1.0
    indicators: List[str]


# Emergency keywords that trigger immediate escalation
EMERGENCY_KEYWORDS = [
    "gas leak", "smell gas", "gas smell", "burning smell", "smoke", "fire",
    "flooding", "burst pipe", "water everywhere", "electrical fire",
    "sparks", "exposed wire", "no heating", "freezing", "carbon monoxide",
    "break-in", "broken lock", "intruder", "emergency"
]

# Cost estimation database (for demo purposes)
REPAIR_COST_ESTIMATES = {
    "plumbing": {"minor": (50, 150), "moderate": (150, 400), "major": (400, 1500)},
    "electrical": {"minor": (75, 200), "moderate": (200, 500), "major": (500, 2000)},
    "appliance": {"minor": (0, 100), "moderate": (100, 300), "major": (300, 800)},
    "heating": {"minor": (75, 200), "moderate": (200, 600), "major": (600, 2500)},
    "structural": {"minor": (100, 300), "moderate": (300, 1000), "major": (1000, 5000)},
}

ENHANCED_SYSTEM_PROMPT = """You are FixMate, an expert AI property maintenance assistant powered by advanced intelligence. Your mission is to help tenants resolve issues quickly and efficiently while saving property managers unnecessary callouts.

## Your Core Capabilities

🚨 **Emergency Detection**: You IMMEDIATELY recognize emergencies (gas leaks, fires, flooding, electrical hazards) and escalate them instantly with URGENT priority.

🔧 **Expert Troubleshooting**: You have deep knowledge of:
- Washing machines, dishwashers, dryers (error codes, common fixes)
- Boilers, heating systems, thermostats
- Plumbing (leaks, blockages, water pressure)
- Electrical basics (breakers, outlets, lighting)
- Locks, doors, windows

💰 **Cost Awareness**: You understand repair costs and help set expectations. When escalating, you provide estimated cost ranges to help with budgeting.

😊 **Tenant Satisfaction**: You're friendly, patient, and reassuring. You celebrate wins when issues are resolved without a callout!

## Troubleshooting Protocol

1. **Assess Urgency First**: Check for any emergency indicators
2. **Gather Information**: Ask targeted questions to understand the issue
3. **Guide Step-by-Step**: Provide clear, numbered instructions
4. **Verify Each Step**: Confirm the tenant completed each action before moving on
5. **Know When to Stop**: If troubleshooting isn't working after 2-3 attempts, escalate

## Common Quick Fixes (Try These First!)

### Washing Machine
- Won't start → Check door is fully closed, power outlet, cycle dial position
- Not draining → Check drain hose isn't kinked, clean filter (usually front bottom)
- Error codes → Unplug for 60 seconds, then restart
- Leaking → Check door seal, reduce load size, correct detergent amount

### Boiler/Heating
- No hot water → Check timer settings, thermostat above 20°C, pressure gauge (should be 1-1.5 bar)
- Radiators cold → Bleed radiators, check TRV valves aren't at 0
- Boiler showing error → Note the error code, try resetting (usually a button on front)

### Dishwasher
- Not cleaning → Check spray arms aren't blocked, clean filter, use rinse aid
- Won't start → Ensure door clicks shut, check water supply valve is open

### Plumbing
- Slow drain → Try plunger, baking soda + vinegar, avoid chemical cleaners
- Toilet running → Check flapper valve, adjust float

## Escalation Triggers (Always Escalate These)

🚨 EMERGENCY (escalate with 'urgent' priority):
- Gas smell or suspected leak
- Electrical sparks, burning smell, or smoke
- Major water leak/flooding
- No heating when outside temp is below 5°C
- Security issues (broken locks, break-in damage)

⚠️ HIGH Priority:
- Complete loss of hot water
- Boiler not working in cold weather
- Toilet completely blocked (only toilet in property)
- Fridge/freezer not cooling (food safety)

## Communication Style

- Be warm and reassuring: "Don't worry, we'll figure this out together!"
- Explain the WHY: "I'm asking about the error code because it tells us exactly what's wrong"
- Celebrate successes: "Brilliant! You've just saved a £100+ callout! 🎉"
- Be honest about limitations: "This sounds like it needs a professional - let me get that arranged"

## Tool Usage

ALWAYS use your tools:
- `send_message_to_tenant` - To communicate with the tenant
- `log_reasoning` - To document your thought process and analysis
- `detect_emergency` - To check for emergency keywords in issue descriptions
- `estimate_repair_cost` - To provide cost estimates when escalating
- `assess_sentiment` - To track tenant satisfaction
- `escalate_to_property_manager` - When professional help is needed
- `resolve_with_troubleshooting` - When you successfully help fix the issue
- `schedule_followup` - To check back on resolved issues

IMPORTANT: Start every interaction by logging your initial assessment using log_reasoning."""


# ============================================================================
# Enhanced MCP Tools
# ============================================================================

@tool(
    "send_message_to_tenant",
    "Send a message to the tenant. Use this for all communication - questions, instructions, or updates.",
    {
        "issue_id": int,
        "message": str,
        "message_type": str,  # greeting, question, instruction, celebration, escalation_notice
    }
)
async def send_message(args: Dict[str, Any]) -> Dict[str, Any]:
    """Send a message to the tenant with type tracking."""
    await messages.add_message(
        args["issue_id"],
        "agent",
        args["message"],
        metadata={"message_type": args.get("message_type", "general")}
    )
    await activity.log_activity(
        args["issue_id"],
        "sent_message",
        {
            "message_preview": args["message"][:100],
            "message_type": args.get("message_type", "general")
        },
        would_notify="tenant"
    )
    return {"content": [{"type": "text", "text": f"Message sent to tenant"}]}


@tool(
    "log_reasoning",
    "Log your analysis, reasoning, or observations. Use this to document your thought process.",
    {
        "issue_id": int,
        "reasoning": str,
        "category": str,  # initial_assessment, troubleshooting, decision, escalation_reason
    }
)
async def log_reasoning(args: Dict[str, Any]) -> Dict[str, Any]:
    """Log agent reasoning with category."""
    await activity.log_activity(
        args["issue_id"],
        "reasoning",
        {
            "reasoning": args["reasoning"],
            "category": args.get("category", "general")
        }
    )
    return {"content": [{"type": "text", "text": "Reasoning logged"}]}


@tool(
    "detect_emergency",
    "Analyze text for emergency indicators. Returns whether this is an emergency and why.",
    {
        "issue_id": int,
        "text": str,
    }
)
async def detect_emergency(args: Dict[str, Any]) -> Dict[str, Any]:
    """Detect emergency keywords in issue description."""
    text_lower = args["text"].lower()
    detected = []

    for keyword in EMERGENCY_KEYWORDS:
        if keyword in text_lower:
            detected.append(keyword)

    is_emergency = len(detected) > 0

    if is_emergency:
        await activity.log_activity(
            args["issue_id"],
            "emergency_detected",
            {"keywords": detected, "text_analyzed": args["text"][:200]},
            would_notify="property_manager,landlord"
        )

    return {
        "content": [{
            "type": "text",
            "text": f"Emergency detected: {is_emergency}. Keywords found: {detected}" if detected else "No emergency indicators found."
        }]
    }


@tool(
    "estimate_repair_cost",
    "Estimate the repair cost for an issue. Returns a cost range based on category and severity.",
    {
        "issue_id": int,
        "category": str,  # plumbing, electrical, appliance, heating, structural
        "severity": str,  # minor, moderate, major
    }
)
async def estimate_repair_cost(args: Dict[str, Any]) -> Dict[str, Any]:
    """Estimate repair costs based on category and severity."""
    category = args.get("category", "appliance").lower()
    severity = args.get("severity", "moderate").lower()

    if category not in REPAIR_COST_ESTIMATES:
        category = "appliance"  # default
    if severity not in ["minor", "moderate", "major"]:
        severity = "moderate"

    cost_range = REPAIR_COST_ESTIMATES[category][severity]

    await activity.log_activity(
        args["issue_id"],
        "cost_estimated",
        {
            "category": category,
            "severity": severity,
            "cost_range_low": cost_range[0],
            "cost_range_high": cost_range[1]
        }
    )

    return {
        "content": [{
            "type": "text",
            "text": f"Estimated cost for {severity} {category} issue: £{cost_range[0]} - £{cost_range[1]}"
        }]
    }


@tool(
    "assess_sentiment",
    "Analyze the tenant's sentiment based on their messages. Helps track satisfaction.",
    {
        "issue_id": int,
        "latest_message": str,
    }
)
async def assess_sentiment(args: Dict[str, Any]) -> Dict[str, Any]:
    """Assess tenant sentiment from their message."""
    text = args["latest_message"].lower()

    # Simple sentiment indicators
    positive_words = ["thanks", "thank you", "great", "perfect", "amazing", "worked", "fixed", "brilliant", "helpful"]
    negative_words = ["frustrated", "angry", "annoyed", "terrible", "useless", "waste", "still not", "doesn't work", "broken"]
    urgent_words = ["urgent", "emergency", "asap", "immediately", "help", "please help"]

    positive_count = sum(1 for word in positive_words if word in text)
    negative_count = sum(1 for word in negative_words if word in text)
    urgent_count = sum(1 for word in urgent_words if word in text)

    # Calculate sentiment score (-1 to 1)
    if positive_count + negative_count == 0:
        score = 0.0
    else:
        score = (positive_count - negative_count) / (positive_count + negative_count + 1)

    sentiment = "neutral"
    if score > 0.3:
        sentiment = "positive"
    elif score < -0.3:
        sentiment = "negative"

    if urgent_count > 0:
        sentiment = f"{sentiment}_urgent"

    await activity.log_activity(
        args["issue_id"],
        "sentiment_assessed",
        {
            "sentiment": sentiment,
            "score": score,
            "positive_indicators": positive_count,
            "negative_indicators": negative_count
        }
    )

    return {
        "content": [{
            "type": "text",
            "text": f"Tenant sentiment: {sentiment} (score: {score:.2f})"
        }]
    }


@tool(
    "escalate_to_property_manager",
    "Escalate the issue to the property manager when professional help is needed.",
    {
        "issue_id": int,
        "reason": str,
        "priority": str,  # low, medium, high, urgent
        "category": str,  # plumbing, electrical, appliance, heating, structural, security
        "estimated_cost_low": int,
        "estimated_cost_high": int,
    }
)
async def escalate_issue(args: Dict[str, Any]) -> Dict[str, Any]:
    """Escalate to property manager with full context."""
    await issues.update_issue_status(args["issue_id"], "escalated")

    escalation_message = f"""Issue escalated to property manager.

📋 **Reason**: {args['reason']}
⚡ **Priority**: {args['priority'].upper()}
🏷️ **Category**: {args['category']}
💰 **Estimated Cost**: £{args['estimated_cost_low']} - £{args['estimated_cost_high']}

The AI assistant has completed initial troubleshooting and determined professional help is required."""

    await messages.add_message(
        args["issue_id"],
        "system",
        escalation_message
    )

    await activity.log_activity(
        args["issue_id"],
        "escalated",
        {
            "reason": args["reason"],
            "priority": args["priority"],
            "category": args["category"],
            "estimated_cost_low": args["estimated_cost_low"],
            "estimated_cost_high": args["estimated_cost_high"]
        },
        would_notify="property_manager,landlord"
    )

    return {
        "content": [{
            "type": "text",
            "text": f"Issue escalated with {args['priority']} priority. Estimated cost: £{args['estimated_cost_low']}-£{args['estimated_cost_high']}"
        }]
    }


@tool(
    "resolve_with_troubleshooting",
    "Mark the issue as resolved when you successfully helped the tenant fix it themselves.",
    {
        "issue_id": int,
        "solution": str,
        "steps_taken": str,
        "estimated_savings": int,  # Money saved by not calling a professional
    }
)
async def resolve_issue(args: Dict[str, Any]) -> Dict[str, Any]:
    """Resolve issue with comprehensive tracking."""
    from datetime import timedelta

    await issues.update_issue_status(
        args["issue_id"],
        "resolved_by_agent",
        resolved_by_agent=args["solution"]
    )

    resolution_message = f"""🎉 Issue Resolved!

✅ **Solution**: {args['solution']}
📝 **Steps Taken**: {args['steps_taken']}
💰 **Estimated Savings**: £{args['estimated_savings']}

Great job troubleshooting this yourself! A follow-up check has been scheduled for 3 days from now."""

    await messages.add_message(
        args["issue_id"],
        "system",
        resolution_message
    )

    await activity.log_activity(
        args["issue_id"],
        "resolved_by_agent",
        {
            "solution": args["solution"],
            "steps_taken": args["steps_taken"],
            "estimated_savings": args["estimated_savings"]
        },
        would_notify="property_manager"
    )

    # Schedule follow-up
    follow_up_date = datetime.now() + timedelta(days=3)
    await issues.set_follow_up_date(args["issue_id"], follow_up_date)

    return {
        "content": [{
            "type": "text",
            "text": f"Issue resolved! Estimated savings: £{args['estimated_savings']}. Follow-up scheduled."
        }]
    }


@tool(
    "schedule_followup",
    "Schedule a follow-up check on the issue.",
    {
        "issue_id": int,
        "days": int,
        "reason": str,
    }
)
async def schedule_followup(args: Dict[str, Any]) -> Dict[str, Any]:
    """Schedule a follow-up check."""
    from datetime import timedelta

    follow_up_date = datetime.now() + timedelta(days=args["days"])
    await issues.set_follow_up_date(args["issue_id"], follow_up_date)

    await activity.log_activity(
        args["issue_id"],
        "scheduled_followup",
        {
            "days": args["days"],
            "date": follow_up_date.isoformat(),
            "reason": args["reason"]
        },
        would_notify="tenant"
    )

    return {
        "content": [{
            "type": "text",
            "text": f"Follow-up scheduled for {follow_up_date.strftime('%Y-%m-%d')} ({args['days']} days)"
        }]
    }


@tool(
    "get_issue_context",
    "Get the full context of an issue including all messages and history.",
    {
        "issue_id": int,
    }
)
async def get_issue_context(args: Dict[str, Any]) -> Dict[str, Any]:
    """Get full issue context for the agent."""
    issue = await issues.get_issue(args["issue_id"])
    conversation = await messages.get_conversation_context(args["issue_id"])

    if not issue:
        return {"content": [{"type": "text", "text": "Issue not found"}], "is_error": True}

    context = f"""## Issue Details
- **ID**: {issue['id']}
- **Title**: {issue['title']}
- **Description**: {issue['description']}
- **Category**: {issue.get('category', 'Not specified')}
- **Status**: {issue['status']}
- **Priority**: {issue.get('priority', 'medium')}
- **Created**: {issue.get('created_at', 'Unknown')}

## Conversation History
{conversation if conversation else '(No previous messages)'}"""

    return {"content": [{"type": "text", "text": context}]}


def get_all_tools():
    """Get all tools for the MCP server."""
    return [
        send_message,
        log_reasoning,
        detect_emergency,
        estimate_repair_cost,
        assess_sentiment,
        escalate_issue,
        resolve_issue,
        schedule_followup,
        get_issue_context,
    ]


def create_fixmate_mcp_server():
    """Create the FixMate MCP server with all tools."""
    return create_sdk_mcp_server(
        name="fixmate",
        version="2.0.0",
        tools=get_all_tools()
    )


# ============================================================================
# Triage Agent Class
# ============================================================================

class TriageAgent:
    """Enhanced Triage Agent using Claude Agent SDK.

    Features:
    - Uses ClaudeSDKClient for multi-turn conversations
    - Emergency detection and auto-escalation
    - Cost estimation for repairs
    - Sentiment tracking
    - Comprehensive activity logging
    """

    def __init__(self):
        self.mcp_server = create_fixmate_mcp_server()

    def _get_options(self) -> ClaudeAgentOptions:
        """Get agent options with MCP server configured."""
        return ClaudeAgentOptions(
            system_prompt=ENHANCED_SYSTEM_PROMPT,
            mcp_servers={"fixmate": self.mcp_server},
            allowed_tools=[
                "mcp__fixmate__send_message_to_tenant",
                "mcp__fixmate__log_reasoning",
                "mcp__fixmate__detect_emergency",
                "mcp__fixmate__estimate_repair_cost",
                "mcp__fixmate__assess_sentiment",
                "mcp__fixmate__escalate_to_property_manager",
                "mcp__fixmate__resolve_with_troubleshooting",
                "mcp__fixmate__schedule_followup",
                "mcp__fixmate__get_issue_context",
            ],
            max_turns=10,
        )

    async def handle_new_issue(self, issue_id: int) -> str:
        """Handle a new issue submission with enhanced processing."""
        # Get issue details
        issue = await issues.get_issue(issue_id)
        if not issue:
            return "Issue not found"

        # Update status to triaging
        await issues.update_issue_status(issue_id, "triaging")

        # Build the prompt
        prompt = f"""A tenant has reported a new maintenance issue. Please help them.

## Issue Details
- **Issue ID**: {issue_id}
- **Title**: {issue['title']}
- **Description**: {issue['description']}
- **Category**: {issue.get('category', 'Not specified')}

## Your Task
1. First, use `detect_emergency` to check if this is an emergency
2. Use `log_reasoning` to document your initial assessment (category: initial_assessment)
3. If it's an emergency, immediately escalate with 'urgent' priority
4. Otherwise, use `send_message_to_tenant` to greet them and ask clarifying questions or provide troubleshooting steps
5. Use `assess_sentiment` to track how the tenant is feeling

Remember: Your goal is to help resolve this without a callout if possible, but NEVER compromise on safety."""

        return await self._run_agent(prompt)

    async def handle_tenant_response(self, issue_id: int, tenant_message: str) -> str:
        """Handle a tenant's response with sentiment tracking."""
        # Record the tenant message
        await messages.add_message(issue_id, "tenant", tenant_message)

        # Get issue details
        issue = await issues.get_issue(issue_id)
        if not issue:
            return "Issue not found"

        # Get conversation history
        conversation = await messages.get_conversation_context(issue_id)

        prompt = f"""The tenant has responded to your previous message. Continue helping them.

## Issue Details
- **Issue ID**: {issue_id}
- **Title**: {issue['title']}
- **Status**: {issue['status']}
- **Category**: {issue.get('category', 'Not specified')}

## Conversation So Far
{conversation}

## Latest Tenant Message
"{tenant_message}"

## Your Task
1. Use `assess_sentiment` to understand how the tenant is feeling
2. Use `log_reasoning` to document your analysis of their response
3. Based on their response:
   - If they confirmed a fix worked → use `resolve_with_troubleshooting` to celebrate!
   - If troubleshooting failed after 2-3 attempts → use `escalate_to_property_manager`
   - If they need more help → use `send_message_to_tenant` with next steps
4. If escalating, use `estimate_repair_cost` first to include cost estimates"""

        return await self._run_agent(prompt)

    async def _run_agent(self, prompt: str) -> str:
        """Run the agent with the Claude SDK."""
        options = self._get_options()

        try:
            async with ClaudeSDKClient(options=options) as client:
                await client.query(prompt)

                result_text = ""
                async for message in client.receive_response():
                    if isinstance(message, AssistantMessage):
                        for block in message.content:
                            if isinstance(block, TextBlock):
                                result_text = block.text
                    elif isinstance(message, ResultMessage):
                        # Agent completed
                        if message.is_error:
                            return f"Agent error: {message.result}"
                        return result_text or "Agent completed"

                return result_text or "Agent completed"

        except Exception as e:
            # Log the error and return gracefully
            await activity.log_activity(
                None,
                "agent_error",
                {"error": str(e), "prompt_preview": prompt[:200]}
            )
            raise


# ============================================================================
# Analytics & Reporting (Bonus Feature for Investors)
# ============================================================================

class AgentAnalytics:
    """Analytics for agent performance - great for investor demos!"""

    @staticmethod
    async def get_resolution_stats() -> Dict[str, Any]:
        """Get statistics on agent resolution performance."""
        from app.db.database import fetch_one, fetch_all

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
    async def get_category_breakdown() -> List[Dict[str, Any]]:
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
    async def get_response_time_stats() -> Dict[str, Any]:
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
