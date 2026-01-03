# FixMate - AI-Powered Property Maintenance Platform

## What It Does

**FixMate** is an intelligent property maintenance management system that uses Claude AI to help tenants resolve maintenance issues. The platform:

- **Reduces unnecessary tradesperson callouts** by guiding tenants through troubleshooting steps
- **Automates issue triage** using an AI agent that asks clarifying questions and makes smart decisions
- **Manages multi-stage workflows** from initial report through resolution and follow-up verification
- **Tracks all conversations and decisions** for property managers

---

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   FastAPI       │────▶│   PostgreSQL    │
│   (Next.js)     │     │   Backend       │     │   (Neon)        │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Claude Agent   │
                        │  SDK (Triage)   │
                        └─────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS, Shadcn UI |
| Backend | Python FastAPI, Uvicorn |
| Database | PostgreSQL (Neon), asyncpg |
| AI | Claude Agent SDK (Anthropic) |
| Auth | Clerk (planned) |

---

## Core Components

### 1. Backend (`/backend`)

```
backend/
├── app/
│   ├── main.py           # FastAPI app setup, CORS
│   ├── config.py         # Environment configuration
│   ├── agents/
│   │   └── triage_agent.py   # AI agent logic
│   ├── api/
│   │   └── routes.py     # REST endpoints
│   ├── db/
│   │   ├── database.py   # Connection pooling
│   │   ├── issues.py     # Issue CRUD
│   │   ├── messages.py   # Conversation storage
│   │   └── activity.py   # Audit logging
│   └── tools/
│       └── issue_tools.py    # Claude Agent tools (MCP)
```

### 2. Frontend (`/temp`)

Next.js boilerplate with:
- Shadcn UI components
- Drizzle ORM for database
- React Hook Form + Zod validation
- i18n support
- E2E testing (Playwright)

---

## How It Works

### Issue Lifecycle

```
1. TENANT SUBMITS ISSUE
   └─▶ Issue created in database
   └─▶ TriageAgent triggered

2. AI TRIAGE
   └─▶ Agent analyzes issue
   └─▶ Asks clarifying questions
   └─▶ Provides troubleshooting steps
   └─▶ Decides: resolve OR escalate

3. RESOLUTION PATHS
   ├─▶ Self-Resolved: Agent guides fix, schedules follow-up
   ├─▶ Escalated: Sent to property manager
   └─▶ Assigned: Tradesperson scheduled

4. FOLLOW-UP
   └─▶ Automated checks (Day 3, 7, 14, 30)
   └─▶ Issue closed when confirmed resolved
```

### Issue Statuses

| Status | Description |
|--------|-------------|
| `new` | Just created |
| `triaging` | Agent is analyzing |
| `resolved_by_agent` | Tenant fixed with agent help |
| `escalated` | Sent to property manager |
| `assigned` | Tradesperson scheduled |
| `in_progress` | Work underway |
| `awaiting_confirmation` | Waiting for tenant confirmation |
| `closed` | Fully resolved |

---

## The Triage Agent

The AI agent (`TriageAgent`) uses Claude to:

1. **Understand the issue** - Asks clarifying questions about symptoms
2. **Troubleshoot** - Provides step-by-step guidance for 100+ common issues
3. **Make decisions** - Escalates when safety/complexity requires it

### Agent Tools (MCP)

| Tool | Purpose |
|------|---------|
| `send_message_to_tenant` | Ask questions or provide guidance |
| `log_reasoning` | Document decision-making |
| `resolve_with_troubleshooting` | Mark issue as self-resolved |
| `escalate_to_property_manager` | Escalate with priority |
| `schedule_followup` | Schedule verification checks |
| `update_issue_status` | Change issue status |

### Troubleshooting Knowledge

The agent knows how to handle:
- **Appliances**: Washing machines, dishwashers, dryers
- **HVAC**: Heating, hot water, thermostats
- **Plumbing**: Drains, leaks, toilets
- **Electrical**: Outlets, breakers (with safety escalation)

---

## API Endpoints

### Issue Management

```
POST   /api/issues                 # Create issue (triggers agent)
GET    /api/issues                 # List issues
GET    /api/issues/{id}            # Get issue details
POST   /api/issues/{id}/messages   # Tenant sends message
GET    /api/issues/{id}/messages   # Get conversation
GET    /api/issues/{id}/activity   # Get activity log
```

### Property Manager Actions

```
POST   /api/issues/{id}/assign     # Assign tradesperson
POST   /api/issues/{id}/close      # Close issue
GET    /api/activity               # Global activity feed
```

---

## Database Schema

```sql
issues
├── id, tenant_id, property_id
├── title, description, category
├── status, priority
├── resolved_by_agent, assigned_to
├── follow_up_date
└── created_at, updated_at, closed_at

issue_messages
├── id, issue_id
├── role (tenant/agent/system)
├── content, metadata
└── created_at

agent_activity
├── id, issue_id
├── action, details
├── would_notify
└── created_at
```

---

## Data Flow Example

**Tenant reports: "Washing machine not starting"**

1. `POST /api/issues` → Creates issue, triggers agent
2. Agent analyzes → Asks "Do you see any lights on the display?"
3. Tenant responds via `POST /api/issues/{id}/messages`
4. Agent suggests: "Check the door is fully closed and power outlet works"
5. If fixed → `resolve_with_troubleshooting()` + schedule 3-day follow-up
6. If not → `escalate_to_property_manager()` with priority

---

## Environment Setup

Required `.env` variables:

```bash
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
ANTHROPIC_API_KEY=sk-ant-...
NOTIFICATIONS_ENABLED=False
```

---

## Current Status

| Component | Status |
|-----------|--------|
| Backend API | Complete |
| Claude Agent Integration | Complete |
| Database Layer | Complete |
| Frontend UI | Boilerplate exists |
| Authentication | Planned (Clerk) |
| Notifications | Logged, not sent |

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `backend/app/agents/triage_agent.py` | Core AI agent logic |
| `backend/app/tools/issue_tools.py` | MCP tools for Claude |
| `backend/app/api/routes.py` | All REST endpoints |
| `backend/app/db/*.py` | Database operations |
| `backend/app/main.py` | FastAPI app entry point |
