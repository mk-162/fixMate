'use client';

import {
  BookOpen,
  Code2,
  Database,
  ExternalLink,
  FileCode,
  GitBranch,
  Layers,
  MessageSquare,
  Server,
  Smartphone,
  Wrench,
  Zap,
} from 'lucide-react';

import { CTABanner, PublicPageLayout } from '@/components/public/PublicLayout';

const ArchitectureSection = () => (
  <section className="py-16">
    <div className="mx-auto max-w-6xl px-6">
      <div className="mb-12 text-center">
        <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
          Architecture
        </span>
        <h2 className="text-3xl font-bold tracking-tight">How FixMate Works</h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          FixMate uses a hybrid architecture with Next.js on Vercel for the dashboard and Python FastAPI on Railway for AI capabilities.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-blue-500/10">
            <Layers className="size-6 text-blue-500" />
          </div>
          <h3 className="mb-2 text-lg font-bold">Frontend (Vercel)</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Next.js dashboard with React, TypeScript, and Tailwind CSS. Handles UI, authentication, and property management.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              Dashboard & Analytics
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              Property Management
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              Clerk Authentication
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-green-500/10">
            <Server className="size-6 text-green-500" />
          </div>
          <h3 className="mb-2 text-lg font-bold">Backend (Railway)</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Python FastAPI with Claude Agent SDK. Powers AI triage, WhatsApp integration, and issue management.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-green-500" />
              AI Triage Agent
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-green-500" />
              WhatsApp Webhooks
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-green-500" />
              Issues & Messages API
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-purple-500/10">
            <Database className="size-6 text-purple-500" />
          </div>
          <h3 className="mb-2 text-lg font-bold">Database (Neon)</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Shared PostgreSQL database accessed by both frontends using Drizzle ORM (Next.js) and asyncpg (Python).
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-purple-500" />
              Properties & Tenants
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-purple-500" />
              Issues & Messages
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-purple-500" />
              Activity Logging
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
);

const AIAgentSection = () => (
  <section className="bg-secondary/50 py-16">
    <div className="mx-auto max-w-6xl px-6">
      <div className="mb-12 text-center">
        <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
          AI Agent
        </span>
        <h2 className="text-3xl font-bold tracking-tight">Claude Agent SDK Integration</h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          The AI triage agent is powered by Anthropic's Claude Agent SDK with custom MCP tools for property maintenance.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-bold">Agent Capabilities</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                <Zap className="size-5 text-red-500" />
              </div>
              <div>
                <h4 className="font-semibold">Emergency Detection</h4>
                <p className="text-sm text-muted-foreground">Instantly identifies gas leaks, flooding, fires and escalates immediately</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                <MessageSquare className="size-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-semibold">Smart Triage</h4>
                <p className="text-sm text-muted-foreground">Asks clarifying questions and guides troubleshooting for simple fixes</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                <Wrench className="size-5 text-green-500" />
              </div>
              <div>
                <h4 className="font-semibold">Cost Estimation</h4>
                <p className="text-sm text-muted-foreground">Provides repair cost ranges when escalating to professionals</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-bold">MCP Tools Available</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <code className="text-sm font-medium">send_message_to_tenant</code>
              <span className="text-xs text-muted-foreground">Communication</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <code className="text-sm font-medium">detect_emergency</code>
              <span className="text-xs text-muted-foreground">Safety</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <code className="text-sm font-medium">estimate_repair_cost</code>
              <span className="text-xs text-muted-foreground">Estimation</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <code className="text-sm font-medium">escalate_to_property_manager</code>
              <span className="text-xs text-muted-foreground">Escalation</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <code className="text-sm font-medium">resolve_with_troubleshooting</code>
              <span className="text-xs text-muted-foreground">Resolution</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const TechStackSection = () => (
  <section className="py-16">
    <div className="mx-auto max-w-6xl px-6">
      <div className="mb-12 text-center">
        <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
          Tech Stack
        </span>
        <h2 className="text-3xl font-bold tracking-tight">Built With Modern Technologies</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: 'Next.js 14', desc: 'React Framework', icon: Code2 },
          { name: 'TypeScript', desc: 'Type Safety', icon: FileCode },
          { name: 'Python FastAPI', desc: 'AI Backend', icon: Server },
          { name: 'Claude Agent SDK', desc: 'AI Triage', icon: Zap },
          { name: 'PostgreSQL', desc: 'Neon Database', icon: Database },
          { name: 'Drizzle ORM', desc: 'Type-safe Queries', icon: Layers },
          { name: 'Twilio', desc: 'WhatsApp API', icon: Smartphone },
          { name: 'Railway', desc: 'Backend Hosting', icon: GitBranch },
        ].map(tech => (
          <div key={tech.name} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <tech.icon className="size-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">{tech.name}</h4>
              <p className="text-xs text-muted-foreground">{tech.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const QuickLinksSection = () => (
  <section className="bg-secondary/50 py-16">
    <div className="mx-auto max-w-6xl px-6">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Key Documentation</h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Quick links to important sections of the technical documentation.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          { title: 'API Endpoints', desc: 'Issues, tenants, webhooks, and analytics endpoints', section: 'api' },
          { title: 'Database Schema', desc: 'Tables for properties, tenants, issues, and messages', section: 'schema' },
          { title: 'Environment Setup', desc: 'Required environment variables for Vercel and Railway', section: 'env' },
          { title: 'Development Workflow', desc: 'Local development and deployment guides', section: 'dev' },
          { title: 'Demo Scenarios', desc: 'Test the AI agent with pre-built scenarios', section: 'demo' },
          { title: 'Dashboard Features', desc: 'Portfolio overview, PM dashboard, issue tracking', section: 'dashboard' },
        ].map(link => (
          <a
            key={link.section}
            href={`#${link.section}`}
            className="group flex items-start gap-4 rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
              <BookOpen className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="mb-1 font-semibold group-hover:text-primary">{link.title}</h3>
              <p className="text-sm text-muted-foreground">{link.desc}</p>
            </div>
            <ExternalLink className="ml-auto size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
        ))}
      </div>
    </div>
  </section>
);

export const GuideContent = () => (
  <PublicPageLayout>
    {/* Hero */}
    <section className="bg-gradient-to-b from-primary/5 to-transparent py-20">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
          <BookOpen className="size-4 text-primary" />
          <span className="text-sm font-medium text-primary">Technical Documentation</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          FixMate Technical Guide
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Architecture overview, API documentation, and development guides for the FixMate platform.
        </p>
      </div>
    </section>

    <ArchitectureSection />
    <AIAgentSection />
    <TechStackSection />
    <QuickLinksSection />
    <CTABanner />
  </PublicPageLayout>
);
