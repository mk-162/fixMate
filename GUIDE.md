# FixMate - AI-Powered Property Maintenance Platform

## What It Does

**FixMate** is an intelligent property maintenance management system powered by the **Claude Agent SDK**. The platform uses advanced AI to help tenants resolve maintenance issues, saving property managers time and money.

### Key Capabilities

- **Smart Issue Triage** - AI agent asks clarifying questions and guides troubleshooting
- **Emergency Detection** - Automatically detects gas leaks, flooding, fires and escalates immediately
- **Cost Estimation** - Provides repair cost ranges when escalating to professionals
- **Sentiment Tracking** - Monitors tenant satisfaction throughout conversations
- **Resolution Analytics** - Tracks savings from issues resolved without callouts
- **WhatsApp Integration** - Tenants can report issues via WhatsApp

### Business Impact

| Metric | Value |
|--------|-------|
| Average callout cost | £150 |
| AI resolution target | 40%+ of issues |
| Response time | < 30 seconds |
| 24/7 availability | Yes |

---

## Architecture Overview

FixMate uses a **hybrid architecture** with two backends:

```
+-------------------------------------------------------------------------+
|                              FRONTEND                                    |
|                         Vercel (Next.js)                                 |
|  +-------------------------------------------------------------------+  |
|  |  Dashboard UI  |  Properties  |  Tenants  |  Issues View          |  |
|  |  (React)       |  (Server     |  (API     |  (API calls)          |  |
|  |                |   Actions)   |   calls)  |                        |  |
|  +-------+--------+------+-------+-----+-----+----------+-------------+  |
|          |               |             |                |                |
+----------+---------------+-------------+----------------+----------------+
           |               |             |                |
           v               |             v                v
+-------------------+      |    +-------------------------------------+
|   Neon PostgreSQL |<-----+    |        Railway (Python FastAPI)     |
|   (Database)      |<----------|  +-----------------------------+    |
|                   |           |  |  AI Triage Agent (Claude)   |    |
|  - properties     |           |  |  WhatsApp Webhooks          |    |
|  - tenants        |           |  |  Issues API                 |    |
|  - issues         |           |  |  Tenants API (for WhatsApp) |    |
|  - messages       |           |  +-----------------------------+    |
|  - organizations  |           |                 |                    |
+-------------------+           |                 v                    |
                                |  +-----------------------------+    |
                                |  |  Twilio / Respond.io        |    |
                                |  |  (WhatsApp Integration)     |    |
                                |  +-----------------------------+    |
                                +-------------------------------------+
```

### What Lives Where

| Feature | Location | Technology | Why |
|---------|----------|------------|-----|
| **Dashboard UI** | Vercel | Next.js | Fast, serverless, easy deployment |
| **Properties CRUD** | Vercel | Server Actions + Drizzle | Direct DB access, no CORS issues |
| **Tenants CRUD** | Railway | FastAPI API | WhatsApp integration needs phone lookup |
| **Issues/Messages** | Railway | FastAPI API | AI agent needs access |
| **AI Triage Agent** | Railway | Claude Agent SDK | Long-running Python process |
| **WhatsApp Webhooks** | Railway | FastAPI | Webhook endpoints for Twilio/Respond.io |
| **Auth** | Vercel | Clerk | Session management |

### Tech Stack

| Layer | Technology | Hosted On |
|-------|------------|-----------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS, Shadcn UI | Vercel |
| Backend (AI/WhatsApp) | Python FastAPI, Uvicorn, Claude Agent SDK | Railway |
| Database | PostgreSQL, Drizzle ORM (Next.js), asyncpg (Python) | Neon |
| Auth | Clerk | Vercel |
| WhatsApp | Twilio Sandbox / Respond.io | External |

---

## Why Two Backends?

### Railway (Python) is needed for:

1. **AI Triage Agent** - Uses Claude Agent SDK which is Python-only
2. **WhatsApp Webhooks** - Long-running webhook handlers that process messages
3. **Tenants API** - WhatsApp integration looks up tenants by phone number

### Vercel (Next.js) is better for:

1. **Dashboard UI** - Server-side rendering, fast page loads
2. **Properties CRUD** - Server Actions = no CORS, no API layer needed
3. **Auth** - Clerk integrates natively with Next.js

---

## Core Components

### 1. Backend (`/backend`) - Railway

```
backend/
├── app/
│   ├── main.py              # FastAPI app setup, CORS
│   ├── config.py            # Environment configuration
│   ├── agents/
│   │   └── triage_agent.py  # AI agent logic (Claude)
│   ├── api/
│   │   ├── routes.py        # Issues REST endpoints
│   │   ├── webhooks.py      # WhatsApp webhook handlers
│   │   ├── properties.py    # Properties API (legacy)
│   │   ├── tenants.py       # Tenants API
│   │   └── organizations.py # Org management
│   ├── db/
│   │   ├── database.py      # Connection pooling (asyncpg)
│   │   ├── issues.py        # Issue CRUD
│   │   ├── messages.py      # Conversation storage
│   │   ├── tenants.py       # Tenant CRUD
│   │   ├── properties.py    # Properties CRUD
│   │   ├── organizations.py # Org CRUD
│   │   ├── whatsapp.py      # WhatsApp conversation tracking
│   │   └── activity.py      # Audit logging
│   ├── integrations/
│   │   ├── twilio_whatsapp.py   # Twilio WhatsApp client
│   │   └── respondio.py         # Respond.io client
│   └── tools/
│       └── issue_tools.py   # Claude Agent tools (MCP)
├── migrate.py               # Initial migration
├── migrate_mvp.py           # MVP tables migration
└── migrate_add_org_id.py    # Add org_id columns
```

### 2. Frontend (`/src`) - Vercel

```
src/
├── app/[locale]/(auth)/dashboard/
│   ├── page.tsx             # Enhanced dashboard with portfolio stats
│   ├── properties/
│   │   └── [id]/page.tsx    # Property detail with tenants & issues
│   ├── tenants/
│   │   └── [id]/page.tsx    # Tenant detail with issue history
│   ├── issues/
│   │   └── [id]/page.tsx    # Issue detail with PM notes
│   ├── pm-dashboard/        # Issue queue with quick status updates
│   └── demo/                # Investor demo page
├── features/
│   ├── dashboard/
│   │   └── actions/         # getDashboardStats, getPropertiesWithStats
│   ├── properties/
│   │   ├── actions/         # Server Actions (createProperty, getPropertyWithDetails)
│   │   ├── components/      # PropertyForm, PropertyTable
│   │   └── schemas/         # Zod validation
│   ├── tenants/
│   │   └── actions/         # getTenantWithDetails
│   ├── pm-dashboard/
│   │   ├── components/      # PMIssueCard, PMIssueQueue, CategoryBadge
│   │   └── constants.ts     # statusConfig, categoryConfig
│   └── ...
├── libs/
│   ├── DB.ts                # Drizzle database client
│   └── FixmateAPI.ts        # Railway API client (issues, tenants, analytics)
└── models/
    └── Schema.ts            # Drizzle schema definitions
```

---

## Database Schema

Both backends share the same Neon PostgreSQL database but use different ORMs:

- **Next.js**: Drizzle ORM
- **Python**: Raw asyncpg queries

### Tables

| Table | Created By | Used By |
|-------|------------|---------|
| `properties` | Drizzle | Next.js (Server Actions) |
| `tenants` | Drizzle + Python migrations | Railway (WhatsApp), Next.js (UI) |
| `issues` | Python migrations | Railway (Agent) |
| `issue_messages` | Python migrations | Railway (Agent) |
| `agent_activity` | Python migrations | Railway (Agent) |
| `organizations` | Python migrations | Railway (multi-tenancy) |
| `whatsapp_conversations` | Python migrations | Railway (WhatsApp) |

### Schema Notes

The `tenants` table has columns from both systems:
- Drizzle adds: `clerk_user_id`, `room_number`, `move_in_date`
- Python adds: `org_id`, `is_active`

This works because both migrations use `IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS`.

---

## API Endpoints

### Railway Backend (https://fixmate-production-XXXX.up.railway.app)

#### Issues (AI Agent)
```
POST   /api/issues                 # Create issue (triggers agent)
GET    /api/issues                 # List issues
GET    /api/issues/{id}            # Get issue details
POST   /api/issues/{id}/messages   # Tenant sends message
GET    /api/issues/{id}/messages   # Get conversation
GET    /api/issues/{id}/activity   # Get activity log
POST   /api/issues/{id}/assign     # Assign tradesperson
POST   /api/issues/{id}/close      # Close issue
PUT    /api/issues/{id}/status     # Update issue status
PUT    /api/issues/{id}/notes      # Update PM internal notes
```

#### Tenants (for WhatsApp)
```
GET    /api/tenants                # List tenants (by org)
POST   /api/tenants                # Create tenant
PUT    /api/tenants/{id}           # Update tenant
DELETE /api/tenants/{id}           # Soft delete tenant
```

#### WhatsApp Webhooks
```
POST   /webhooks/twilio            # Twilio WhatsApp messages
POST   /webhooks/respondio         # Respond.io messages
```

### Next.js Server Actions (no HTTP endpoints)

```typescript
// Properties (src/features/properties/actions/propertyActions.ts)
createProperty(data);
getProperties(options);
getProperty(id);
updateProperty(id, data);
deleteProperty(id);
```

---

## Environment Variables

### Vercel (.env.local)
```bash
DATABASE_URL=postgresql://...      # Neon connection string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_FIXMATE_API_URL=https://fixmate-production-XXXX.up.railway.app
```

### Railway
```bash
DATABASE_URL=postgresql://...      # Same Neon connection
ANTHROPIC_API_KEY=sk-ant-...       # For Claude Agent
TWILIO_ACCOUNT_SID=AC...           # Twilio WhatsApp
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

---

## Current Status & Known Issues

| Component | Status | Notes |
|-----------|--------|-------|
| Properties (Dashboard) | ✅ Working | Uses Server Actions |
| Tenants (Dashboard) | ⚠️ Uses Railway | Should migrate to Server Actions |
| AI Triage Agent | ✅ Working | Railway + Claude |
| WhatsApp Integration | ✅ Working | Twilio sandbox |
| Issues View | ⚠️ Uses Railway | Intentional - needs agent access |

### Known Schema Conflicts

The `tenants` and `properties` tables have columns from both Drizzle and Python migrations. This works but is messy. Future consolidation recommended.

---

## Development Workflow

### Run Locally

```bash
# Frontend (Next.js)
npm run dev

# Backend (Python) - in backend/ directory
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
uvicorn app.main:app --reload --port 8000
```

### Deploy

```bash
# Frontend - auto-deploys on git push to Vercel
git push origin main

# Backend - auto-deploys on git push to Railway
# (Railway watches the /backend directory)
```

### Run Migrations

```bash
# Drizzle (Next.js schema)
npm run db:generate
npm run db:push

# Python (Railway schema)
cd backend
python migrate_add_org_id.py
```

---

## Future Improvements

1. **Consolidate Tenants** - Create Server Actions for tenants, keep Railway API only for WhatsApp webhook lookups
2. **Unify Schema** - Pick one migration system (recommend Drizzle)
3. **Add Tenant Server Actions** - Mirror the properties pattern
4. **Remove FixmateAPI.ts** - Once all dashboard features use Server Actions

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `backend/app/agents/triage_agent.py` | Core AI agent logic (Claude Agent SDK) |
| `backend/app/api/routes.py` | Issues API + Analytics + Status/Notes endpoints |
| `backend/app/api/webhooks.py` | WhatsApp webhook handlers |
| `backend/app/db/*.py` | Database operations |
| `backend/migrate_add_pm_notes.py` | Migration for PM notes column |
| `src/app/[locale]/(auth)/dashboard/page.tsx` | Enhanced dashboard with portfolio stats |
| `src/features/dashboard/actions/dashboardActions.ts` | Dashboard statistics Server Actions |
| `src/features/properties/actions/propertyActions.ts` | Property Server Actions |
| `src/features/tenants/actions/tenantActions.ts` | Tenant detail Server Actions |
| `src/features/pm-dashboard/components/CategoryBadge.tsx` | Issue category icons component |
| `src/features/pm-dashboard/constants.ts` | Status and category configurations |
| `src/libs/FixmateAPI.ts` | Railway API client (issues, analytics) |
| `src/models/Schema.ts` | Drizzle schema definitions |

---

## Claude Agent SDK Integration

FixMate uses the official **Claude Agent SDK** for its AI capabilities. This provides:

### Agent Architecture

```python
# The TriageAgent class uses ClaudeSDKClient for conversations
class TriageAgent:
    def __init__(self):
        self.mcp_server = create_fixmate_mcp_server()

    async def handle_new_issue(self, issue_id: int) -> str:
        # Agent automatically:
        # 1. Detects emergencies
        # 2. Logs reasoning
        # 3. Sends helpful messages
        # 4. Tracks sentiment
        # 5. Resolves or escalates
```

### MCP Tools Available

| Tool | Purpose |
|------|---------|
| `send_message_to_tenant` | Communicate with tenant (with message type tracking) |
| `log_reasoning` | Document AI decision-making process |
| `detect_emergency` | Scan for emergency keywords (gas, fire, flood) |
| `estimate_repair_cost` | Provide cost ranges by category/severity |
| `assess_sentiment` | Track tenant satisfaction (-1 to +1 score) |
| `escalate_to_property_manager` | Escalate with priority and cost estimate |
| `resolve_with_troubleshooting` | Mark resolved with savings tracking |
| `schedule_followup` | Schedule follow-up checks |
| `get_issue_context` | Retrieve full issue history |

### Analytics Endpoints (Investor Demo)

```
GET /api/analytics/overview      # Full dashboard data
GET /api/analytics/resolution    # Resolution stats & savings
GET /api/analytics/categories    # Issue breakdown by type
GET /api/analytics/response-times # Agent response metrics
GET /api/demo/simulate-issue     # Create demo scenarios
```

### Demo Scenarios

Use `/api/demo/simulate-issue?scenario=X` to create test issues:

| Scenario | Description | Expected Outcome |
|----------|-------------|------------------|
| `washing_machine` | Appliance won't start | Troubleshooting → Resolution |
| `emergency` | Gas smell detected | Immediate escalation (urgent) |
| `heating` | Boiler error code | Troubleshooting → Varies |
| `plumbing` | Slow drain | Simple fix guidance |

---

## Investor Demo Guide

### Quick Start

1. **Create a demo issue:**
   ```bash
   curl -X GET "https://your-api.railway.app/api/demo/simulate-issue?scenario=washing_machine"
   ```

2. **View the conversation:**
   ```bash
   curl "https://your-api.railway.app/api/issues/{id}/messages"
   ```

3. **See agent activity:**
   ```bash
   curl "https://your-api.railway.app/api/issues/{id}/activity"
   ```

4. **Get analytics:**
   ```bash
   curl "https://your-api.railway.app/api/analytics/overview"
   ```

### Key Metrics to Highlight

- **Resolution Rate**: % of issues resolved without callouts
- **Total Savings**: £150 × resolved issues
- **Response Time**: Typically < 30 seconds
- **Emergency Detection**: Instant escalation for safety issues

---

## Dashboard Features

### Portfolio Overview (Dashboard Home)

The main dashboard displays key portfolio metrics at a glance:

| Metric | Description |
|--------|-------------|
| **Properties** | Total properties in portfolio |
| **Tenants** | Total active tenants |
| **Occupancy Rate** | % of rooms occupied |
| **Monthly Rent** | Total expected monthly income |
| **Active Issues** | Open maintenance issues |
| **AI Resolution Rate** | % of issues resolved by AI |

### Property Management

**Property List** (`/dashboard/properties`)
- View all properties with tenant count and active issues
- Quick stats: rooms, rent, occupancy status

**Property Detail** (`/dashboard/properties/[id]`)
- Property stats row: rooms, tenants, monthly rent, active issues
- Tenants section: list of all tenants with contact info
- Issues section: all maintenance issues for this property
- Quick navigation to tenant and issue detail pages

### Tenant Management

**Tenant List** (`/dashboard/tenants`)
- View all tenants with property assignment
- Contact information and status

**Tenant Detail** (`/dashboard/tenants/[id]`)
- Contact information (email, phone)
- Property assignment with link
- Stats: total issues, active issues, resolved issues
- Complete issue history

### Issue Management

**PM Dashboard** (`/dashboard/pm-dashboard`)
- Issue queue with filtering by status
- Category badges with visual icons:
  - 🔧 Plumbing (blue)
  - 💡 Electrical (yellow)
  - 🧊 Appliance (purple)
  - 🔥 Heating (orange)
  - ❄️ HVAC (cyan)
  - 🔨 Structural (gray)
  - 🐛 Pest (red)
  - ✨ Cleaning (green)
  - 🔒 Security (slate)
  - 🌳 Exterior (emerald)
- **Quick Status Updates**: Dropdown to change issue status directly from cards
- Priority and assigned tradesperson display

**Issue Detail** (`/dashboard/issues/[id]`)
- Full conversation thread with tenant
- Issue status card with:
  - Current status badge
  - Priority level
  - Category
  - Assigned tradesperson
  - Resolution message (if resolved)
- **Internal Notes**: Private notes field for property managers (not visible to tenants)
- Agent Activity log (collapsible)
- Reply form for ongoing conversations

### Issue Statuses

| Status | Color | Description |
|--------|-------|-------------|
| `new` | Blue | Just created |
| `triaging` | Yellow | AI agent is helping |
| `resolved_by_agent` | Green | AI resolved without callout |
| `escalated` | Orange | Needs human attention |
| `assigned` | Purple | Tradesperson assigned |
| `in_progress` | Indigo | Work underway |
| `awaiting_confirmation` | Pink | Waiting for tenant confirmation |
| `closed` | Gray | Issue completed |

### Issue Categories

| Category | Icon | Common Issues |
|----------|------|---------------|
| `plumbing` | Pipette | Leaks, drains, toilets |
| `electrical` | Lightbulb | Outlets, switches, wiring |
| `appliance` | Refrigerator | Washing machine, fridge, oven |
| `heating` | Flame | Boiler, radiators, gas |
| `hvac` | Thermometer | AC, ventilation |
| `structural` | Hammer | Walls, floors, doors |
| `pest` | Bug | Insects, rodents |
| `cleaning` | Sparkles | Deep clean, mold |
| `security` | Lock | Locks, alarms, access |
| `exterior` | Tree | Garden, roof, gutters |
| `general` | Wrench | Other/uncategorized |
