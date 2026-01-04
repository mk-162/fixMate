# FixMate AI Agent - Demo Manual

## What is FixMate?

FixMate is an **AI-powered property maintenance platform** that automatically triages tenant issues, guides troubleshooting, and reduces unnecessary tradesperson callouts by **40% or more**.

When a tenant reports a problem like "my washing machine won't start", the AI agent:
1. Instantly assesses if it's an emergency
2. Asks smart clarifying questions
3. Guides the tenant through troubleshooting steps
4. Either resolves the issue OR escalates with full context and cost estimates

---

## Why This Matters (Business Value)

| Problem | FixMate Solution |
|---------|------------------|
| Tradespeople charge £100-200 per callout | AI resolves simple issues for £0 |
| Property managers waste time on calls | AI handles first contact 24/7 |
| Tenants wait days for simple fixes | AI responds in < 30 seconds |
| No visibility into what was tried | Full conversation + reasoning logs |
| Emergencies get lost in the queue | Auto-detection of gas leaks, fires, flooding |

### ROI Example

| Metric | Before FixMate | With FixMate |
|--------|----------------|--------------|
| Monthly callouts | 100 | 60 |
| Cost per callout | £150 | £150 |
| Monthly spend | £15,000 | £9,000 |
| **Monthly savings** | - | **£6,000** |
| Annual savings | - | **£72,000** |

---

## Core Capabilities

### 1. Emergency Detection
The AI instantly recognizes dangerous situations and escalates immediately:

- **Gas leaks** - "I can smell gas" → URGENT escalation
- **Flooding** - "Water everywhere" → URGENT escalation
- **Fire/smoke** - "Burning smell" → URGENT escalation
- **Electrical hazards** - "Sparks from outlet" → URGENT escalation
- **Security** - "Broken lock", "break-in" → URGENT escalation
- **No heating in winter** - Temperature-aware escalation

### 2. Smart Troubleshooting
The AI has deep knowledge of common household issues:

**Appliances:**
- Washing machines (error codes, door sensors, filters, drains)
- Dishwashers (spray arms, filters, door latches)
- Boilers (pressure, timer, error codes, bleeding radiators)
- Fridges/freezers (temperature settings, seals, defrost)

**Plumbing:**
- Blocked drains (plunger techniques, baking soda method)
- Running toilets (flapper valve, float adjustment)
- Low water pressure (isolation valves, aerators)

**Electrical basics:**
- Tripped breakers (RCD resets)
- Dead outlets (testing, GFCI resets)

### 3. Cost Estimation
When escalating, the AI provides cost estimates to help with budgeting:

| Category | Minor | Moderate | Major |
|----------|-------|----------|-------|
| Plumbing | £50-150 | £150-400 | £400-1,500 |
| Electrical | £75-200 | £200-500 | £500-2,000 |
| Appliance | £0-100 | £100-300 | £300-800 |
| Heating | £75-200 | £200-600 | £600-2,500 |

### 4. Sentiment Tracking
The AI monitors tenant satisfaction throughout the conversation:
- Detects frustration ("this is useless", "still broken")
- Recognizes urgency ("please help", "emergency")
- Celebrates success ("that worked!", "thank you")

This helps property managers identify unhappy tenants before they escalate.

### 5. Automatic Follow-ups
When an issue is resolved, the AI automatically schedules a 3-day follow-up to confirm the fix is still working. This catches issues that seemed fixed but recur.

---

## How It Works (Technical)

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                   Next.js on Vercel                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Dashboard  │  │  AI Demo    │  │  Issues/Messages    │  │
│  │   (React)   │  │   Page      │  │     Viewer          │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼────────────────────┼─────────────┘
          │                │                    │
          ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (Railway)                        │
│                   Python FastAPI                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              CLAUDE AGENT SDK                        │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │    │
│  │  │   Triage    │  │    MCP      │  │  Analytics  │  │    │
│  │  │   Agent     │──│   Tools     │  │   Engine    │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│  ┌─────────────────────────┼───────────────────────────┐    │
│  │              MCP TOOLS  │                            │    │
│  │  • send_message_to_tenant    • detect_emergency     │    │
│  │  • log_reasoning             • estimate_repair_cost │    │
│  │  • assess_sentiment          • schedule_followup    │    │
│  │  • escalate_to_property_manager                     │    │
│  │  • resolve_with_troubleshooting                     │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (Neon PostgreSQL)                │
│  ┌─────────┐  ┌─────────────┐  ┌────────────────────────┐   │
│  │ issues  │  │  messages   │  │    agent_activity      │   │
│  │         │  │             │  │   (reasoning logs)     │   │
│  └─────────┘  └─────────────┘  └────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Agent Flow

```
1. TENANT REPORTS ISSUE
   "My washing machine won't start"
                │
                ▼
2. AGENT RECEIVES & ANALYZES
   ┌────────────────────────────┐
   │ detect_emergency()         │ ← Check for gas/fire/flood
   │ log_reasoning()            │ ← Document initial assessment
   │ assess_sentiment()         │ ← Track tenant mood
   └────────────────────────────┘
                │
        ┌───────┴───────┐
        ▼               ▼
   EMERGENCY?      NOT EMERGENCY
        │               │
        ▼               ▼
3a. ESCALATE       3b. TROUBLESHOOT
   IMMEDIATELY      ┌────────────────────────────┐
   (URGENT)         │ send_message_to_tenant()   │
                    │ "Let's check a few things" │
                    └────────────────────────────┘
                                │
                                ▼
                    4. TENANT RESPONDS
                       "I tried that, still broken"
                                │
                                ▼
                    5. AGENT CONTINUES
                       ┌───────────────────────┐
                       │ assess_sentiment()    │
                       │ log_reasoning()       │
                       │ Try next solution...  │
                       └───────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
              STILL FAILING            IT WORKED!
                    │                       │
                    ▼                       ▼
6a. ESCALATE                   6b. RESOLVE
┌─────────────────────┐        ┌─────────────────────┐
│ estimate_repair_cost│        │ resolve_with_       │
│ escalate_to_pm()    │        │   troubleshooting() │
│ Priority: HIGH      │        │ Savings: £150       │
│ Est: £150-400       │        │ schedule_followup() │
└─────────────────────┘        └─────────────────────┘
```

### The Claude Agent SDK

FixMate uses the **official Claude Agent SDK** from Anthropic. This provides:

| Feature | Benefit |
|---------|---------|
| `ClaudeSDKClient` | Manages multi-turn conversations automatically |
| `@tool` decorator | Define custom actions the AI can take |
| MCP Server | Secure tool execution with permissions |
| Streaming | Real-time response display |
| Built-in retry logic | Handles API failures gracefully |

---

## Demo Guide

### Accessing the Demo

1. **Start Backend:**
   ```bash
   cd backend
   ../.venv/Scripts/uvicorn.exe app.main:app --reload --port 8000
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   ```

3. **Open Demo Page:**
   - Go to `http://localhost:3000/en/dashboard/demo`
   - Or click **"AI Demo"** in the navigation

### Demo Scenarios

| Scenario | What Happens | Demo Value |
|----------|--------------|------------|
| **Washing Machine** | AI guides through troubleshooting (check door, power, filter) | Shows helpful guidance |
| **Gas Emergency** | Instant URGENT escalation with emergency detection | Shows safety-first approach |
| **Boiler Issue** | Error code troubleshooting, pressure check | Shows technical knowledge |
| **Slow Drain** | Simple fix guidance (plunger, baking soda) | Shows cost savings |

### Demo Script for Investors

**Scene 1: The Emergency (30 seconds)**
> "Watch what happens when a tenant reports a gas leak..."
1. Click "Gas Emergency" scenario
2. Point to the instant URGENT escalation
3. Show "Emergency Detected" in activity log with keywords highlighted
4. **Key message:** "Safety first. No delays. Immediate escalation."

**Scene 2: The Resolution (60 seconds)**
> "Now let's see a typical troubleshooting flow..."
1. Click "Washing Machine" scenario
2. Watch the AI send a friendly greeting and ask questions
3. Click "It worked!" quick response
4. Show the resolution message with **savings calculated**
5. **Key message:** "That's £150 saved. In 2 minutes. At 3am if needed."

**Scene 3: The Analytics (30 seconds)**
> "Property managers see exactly what's happening..."
1. Point to the analytics cards at the top
2. Show resolution rate, total savings, response time
3. Scroll through the agent activity log
4. **Key message:** "Full transparency. Every decision documented."

### API Endpoints for Technical Demos

```bash
# Create a demo issue
curl "http://localhost:8000/api/demo/simulate-issue?scenario=emergency"

# Get analytics
curl "http://localhost:8000/api/analytics/overview"

# View conversation
curl "http://localhost:8000/api/issues/{id}/messages"

# View agent reasoning
curl "http://localhost:8000/api/issues/{id}/activity"
```

---

## What Makes This Good?

### 1. It Actually Works
This isn't a chatbot that says "I understand your frustration." The AI has real domain knowledge about appliances, plumbing, and heating. It knows that a boiler pressure gauge should read 1-1.5 bar and that you can reset most error codes by power cycling.

### 2. Safety First
Emergency detection is built into the core. The AI will NEVER try to troubleshoot a gas leak. It immediately escalates with URGENT priority and logs exactly why.

### 3. Full Transparency
Every decision is logged:
- **Reasoning:** Why the agent chose this action
- **Sentiment:** How the tenant is feeling
- **Cost estimates:** What professional help might cost
- **Notifications:** Who would be notified in production

Property managers can audit every interaction.

### 4. Cost Savings Are Tracked
When the AI resolves an issue, it calculates estimated savings based on typical callout costs. This makes ROI measurable and demonstrable.

### 5. Built on Production Technology
- **Claude Agent SDK** - Official Anthropic SDK, actively maintained
- **FastAPI** - High-performance Python backend
- **Next.js** - Modern React framework
- **PostgreSQL** - Enterprise-grade database
- **WhatsApp Integration** - Tenants can text their issues

### 6. Scales Infinitely
The AI can handle 100 simultaneous conversations as easily as 1. No hiring, no training, no sick days.

---

## Files Reference

| File | Purpose |
|------|---------|
| `backend/app/agents/triage_agent.py` | Core AI agent with all tools |
| `backend/app/api/routes.py` | REST API + analytics endpoints |
| `src/app/[locale]/(auth)/dashboard/demo/page.tsx` | Demo UI |
| `src/libs/FixmateAPI.ts` | Frontend API client |
| `GUIDE.md` | Technical architecture docs |

---

## Next Steps

1. **Try the demo** - Run through all 4 scenarios
2. **Test edge cases** - Try unusual tenant responses
3. **Review analytics** - See how metrics accumulate
4. **Customize** - Modify the system prompt for your domain

---

*Built with the Claude Agent SDK by Anthropic*
