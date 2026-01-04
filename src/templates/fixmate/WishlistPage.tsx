'use client';

import {
  BarChart3,
  Bell,
  Bot,
  Building,
  Calendar,
  Camera,
  CheckCircle2,
  CircleDot,
  CreditCard,
  FileText,
  Lock,
  Mail,
  MessageSquare,
  Palette,
  PoundSterling,
  Rocket,
  Settings,
  Smartphone,
  Users,
  Wrench,
} from 'lucide-react';

import { PublicPageLayout } from '@/components/public/PublicLayout';

const RoadmapHero = () => (
  <section className="bg-gradient-to-b from-primary/5 to-transparent py-20">
    <div className="mx-auto max-w-4xl px-6 text-center">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
        <Rocket className="size-4 text-primary" />
        <span className="text-sm font-medium text-primary">Product Roadmap</span>
      </div>
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
        What's Coming Next
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
        See our product roadmap and upcoming features. We're constantly improving FixMate based on feedback from property managers like you.
      </p>
    </div>
  </section>
);

const Tier1Completed = () => (
  <section className="py-16">
    <div className="mx-auto max-w-6xl px-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="size-5 text-green-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Tier 1: Core Platform</h2>
          <p className="text-muted-foreground">Completed and live</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { name: 'AI Triage Agent', desc: 'Intelligent issue classification and troubleshooting' },
          { name: 'WhatsApp Integration', desc: 'Tenants report issues via WhatsApp' },
          { name: 'Property Management', desc: 'Full CRUD for properties and rooms' },
          { name: 'Tenant Management', desc: 'Add, edit, and track tenants' },
          { name: 'Issue Dashboard', desc: 'View and manage all maintenance issues' },
          { name: 'PM Dashboard', desc: 'Quick status updates and issue queue' },
        ].map(feature => (
          <div key={feature.name} className="flex items-start gap-3 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-500" />
            <div>
              <h3 className="font-semibold">{feature.name}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Tier2Features = () => (
  <section className="bg-secondary/50 py-16">
    <div className="mx-auto max-w-6xl px-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-blue-500/10">
          <CircleDot className="size-5 text-blue-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Tier 2: Core Landlord Features</h2>
          <p className="text-muted-foreground">Coming soon</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { name: 'Cost Tracking per Issue', desc: 'Add estimated/actual cost fields for budgeting', icon: PoundSterling },
          { name: 'Contractor Directory', desc: 'Store tradespeople with specialties and ratings', icon: Wrench },
          { name: 'Move-in/Move-out Dates', desc: 'Track tenant move dates in the UI', icon: Calendar },
          { name: 'Lease Term Tracking', desc: 'Lease start/end dates with days remaining', icon: FileText },
          { name: 'Deposit Tracking', desc: 'Deposit amount, protection scheme, deposit ID', icon: Lock },
          { name: 'Rent Amount per Tenant', desc: 'Room-specific pricing for HMOs', icon: CreditCard },
        ].map(feature => (
          <div key={feature.name} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
              <feature.icon className="size-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">{feature.name}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Tier3Features = () => (
  <section className="py-16">
    <div className="mx-auto max-w-6xl px-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-purple-500/10">
          <MessageSquare className="size-5 text-purple-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Tier 3: Communication Upgrades</h2>
          <p className="text-muted-foreground">Enhanced notifications</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { name: 'Email Notifications', desc: 'Email landlord when issues escalated, assigned, or closed', icon: Mail },
          { name: 'Issue Updates via Email', desc: 'Email tenants when status changes', icon: Bell },
          { name: 'In-App Notifications', desc: 'Bell icon with unread count and notification dropdown', icon: Bell },
          { name: 'Bulk SMS/Email', desc: 'Send announcements to all tenants of a property', icon: Users },
        ].map(feature => (
          <div key={feature.name} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
              <feature.icon className="size-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold">{feature.name}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Tier4Features = () => (
  <section className="bg-secondary/50 py-16">
    <div className="mx-auto max-w-6xl px-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-orange-500/10">
          <BarChart3 className="size-5 text-orange-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Tier 4: Analytics & Intelligence</h2>
          <p className="text-muted-foreground">Advanced insights</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { name: 'Property Performance Dashboard', desc: 'Issues per property, resolution times, costs over time', icon: BarChart3 },
          { name: 'Financial Summary', desc: 'Total expected rent, collected, arrears dashboard', icon: PoundSterling },
          { name: 'Compliance Calendar', desc: 'Upcoming certificate expiries, inspections due', icon: Calendar },
          { name: 'AI Insights', desc: 'Predictive maintenance, risk alerts, seasonal trends', icon: Bot },
        ].map(feature => (
          <div key={feature.name} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
              <feature.icon className="size-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold">{feature.name}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FutureEnhancements = () => (
  <section className="py-16">
    <div className="mx-auto max-w-6xl px-6">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold">Future Enhancements</h2>
        <p className="mt-2 text-muted-foreground">Long-term vision and upcoming integrations</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <Bot className="size-6 text-primary" />
          </div>
          <h3 className="mb-2 font-bold">Agent Enhancements</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Agent SDK edit panel</li>
            <li>Photo analysis for diagnostics</li>
            <li>Multi-agent support</li>
            <li>Auto-assign contractors</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-green-500/10">
            <Smartphone className="size-6 text-green-500" />
          </div>
          <h3 className="mb-2 font-bold">Tenant Experience</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Photo/video upload</li>
            <li>Push notifications</li>
            <li>Mobile app (PWA)</li>
            <li>Satisfaction surveys</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-blue-500/10">
            <Building className="size-6 text-blue-500" />
          </div>
          <h3 className="mb-2 font-bold">Integrations</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Buildium, AppFolio, Yardi</li>
            <li>Xero, QuickBooks</li>
            <li>SMS notifications</li>
            <li>Payment/invoicing</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-purple-500/10">
            <Palette className="size-6 text-purple-500" />
          </div>
          <h3 className="mb-2 font-bold">Enterprise</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>White-label branding</li>
            <li>Multi-portfolio views</li>
            <li>Audit trail/compliance</li>
            <li>SSO integration</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
);

const FeedbackCTA = () => (
  <section className="bg-primary/5 py-16">
    <div className="mx-auto max-w-3xl px-6 text-center">
      <Settings className="mx-auto mb-6 size-12 text-primary" />
      <h2 className="text-2xl font-bold">Have a Feature Request?</h2>
      <p className="mt-4 text-muted-foreground">
        We're building FixMate based on feedback from property managers like you. Let us know what features would make your life easier.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <a
          href="mailto:feedback@fixmate.io"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90"
        >
          <Mail className="size-4" />
          Send Feedback
        </a>
        <a
          href="/#demo"
          className="inline-flex items-center gap-2 rounded-full border-2 border-border px-6 py-3 font-semibold transition-all hover:border-primary/30 hover:bg-primary/5"
        >
          <Camera className="size-4" />
          Book a Demo
        </a>
      </div>
    </div>
  </section>
);

export const WishlistContent = () => (
  <PublicPageLayout>
    <RoadmapHero />
    <Tier1Completed />
    <Tier2Features />
    <Tier3Features />
    <Tier4Features />
    <FutureEnhancements />
    <FeedbackCTA />
  </PublicPageLayout>
);
