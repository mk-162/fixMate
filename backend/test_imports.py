"""Quick test to verify all modules import correctly."""
import sys
sys.path.insert(0, '.')

print("Testing imports...")

# Test main app
from app.main import app
print("  app.main OK")

# Test API routes
from app.api.routes import router
print("  app.api.routes OK")

# Test database modules
from app.db.database import get_db
from app.db.issues import create_issue, get_issue
from app.db.messages import add_message, get_messages
from app.db.activity import log_activity
print("  app.db.* OK")

# Test agent tools
from app.tools.issue_tools import (
    update_status,
    send_message,
    log_agent_action,
    schedule_followup,
    escalate_issue,
    resolve_with_help,
    create_fixmate_mcp_server,
)
print("  app.tools.issue_tools OK")

# Test agent
from app.agents.triage_agent import TriageAgent
print("  app.agents.triage_agent OK")

# Test MCP server creation
mcp_server = create_fixmate_mcp_server()
print(f"  MCP server created: {mcp_server['name']}")

print("\nAll imports successful!")
