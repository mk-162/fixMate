# FixMate - AI-Powered Property Maintenance Platform

## What It Does

**FixMate** is an intelligent property maintenance management system that uses Claude AI to help tenants resolve maintenance issues. The platform:

- **Reduces unnecessary tradesperson callouts** by guiding tenants through troubleshooting steps
- **Automates issue triage** using an AI agent that asks clarifying questions and makes smart decisions
- **Manages multi-stage workflows** from initial report through resolution and follow-up verification
- **Tracks all conversations and decisions** for property managers

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
│   ├── properties/          # Uses Server Actions (fixed!)
│   ├── tenants/             # Uses Railway API (for WhatsApp)
│   └── ...
├── features/
│   ├── properties/
│   │   ├── actions/         # Server Actions (createProperty, etc.)
│   │   ├── components/      # PropertyForm, PropertyTable
│   │   └── schemas/         # Zod validation
│   └── ...
├── libs/
│   ├── DB.ts                # Drizzle database client
│   └── FixmateAPI.ts        # Railway API client
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
| `backend/app/agents/triage_agent.py` | Core AI agent logic |
| `backend/app/api/webhooks.py` | WhatsApp webhook handlers |
| `backend/app/db/*.py` | Database operations |
| `src/features/properties/actions/propertyActions.ts` | Property Server Actions |
| `src/libs/FixmateAPI.ts` | Railway API client (for tenants/issues) |
| `src/models/Schema.ts` | Drizzle schema definitions |
