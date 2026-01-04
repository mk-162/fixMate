'use client';

import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Building,
  CheckCircle2,
  Clock,
  FileText,
  Home,
  PoundSterling,
  Shield,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';

import { CTABanner, PublicPageLayout } from '@/components/public/PublicLayout';

// WhatsApp Icon Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const FeaturesHero = () => (
  <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-transparent py-20 md:py-28">
    <div className="mx-auto max-w-6xl px-6">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
          <Sparkles className="size-4 text-primary" />
          <span className="text-sm font-medium text-primary">For Landlords & Property Managers</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Spend less time on maintenance.
          <span className="text-primary"> Keep tenants happier.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          FixMate's AI assistant handles tenant maintenance requests via WhatsApp, resolving simple issues instantly and escalating real problems with full context.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/#demo"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl"
          >
            Book a Demo
            <ArrowRight className="size-5" />
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-full border-2 border-border px-8 py-4 font-semibold transition-all hover:border-primary/30 hover:bg-primary/5"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const KeyBenefits = () => {
  const benefits = [
    {
      icon: Clock,
      title: 'Save 10+ Hours/Week',
      description: 'Stop fielding repetitive maintenance calls. AI handles the triage so you can focus on your portfolio.',
      stat: '60%',
      statLabel: 'fewer callouts',
    },
    {
      icon: PoundSterling,
      title: 'Cut Maintenance Costs',
      description: 'Resolve simple issues without expensive contractor visits. Track savings from AI-resolved issues.',
      stat: '£150',
      statLabel: 'avg. callout saved',
    },
    {
      icon: Users,
      title: 'Happier Tenants',
      description: 'Instant responses via WhatsApp. No more waiting days for a callback on a simple fix.',
      stat: '< 30s',
      statLabel: 'response time',
    },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-green-500/10 px-4 py-1.5 text-sm font-semibold text-green-600">
            Key Benefits
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Why Property Managers Love FixMate
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {benefits.map(benefit => (
            <div key={benefit.title} className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-xl">
              <div className="mb-6 flex size-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <benefit.icon className="size-7 text-primary" />
              </div>
              <div className="mb-4">
                <span className="text-4xl font-bold text-primary">{benefit.stat}</span>
                <span className="ml-2 text-sm text-muted-foreground">{benefit.statLabel}</span>
              </div>
              <h3 className="mb-3 text-xl font-bold">{benefit.title}</h3>
              <p className="leading-relaxed text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CoreFeatures = () => {
  const features = [
    {
      icon: WhatsAppIcon,
      title: 'WhatsApp Integration',
      description: 'Tenants report issues via WhatsApp - the app they already use. No portal logins, no app downloads, just instant messaging.',
      points: ['Works with existing tenant phone numbers', 'Photo and voice note support', 'Automatic language detection'],
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Triage',
      description: 'Intelligent classification of every issue. Simple fixes get guided troubleshooting. Real problems get escalated with full context.',
      points: ['Classifies issue type and severity', 'Provides step-by-step troubleshooting', 'Estimates repair costs for escalated issues'],
    },
    {
      icon: AlertTriangle,
      title: 'Emergency Detection',
      description: 'Automatic detection of gas leaks, flooding, fires, and other emergencies. Immediate escalation with urgency flags.',
      points: ['24/7 monitoring', 'Instant PM notification', 'Safety instructions for tenants'],
    },
    {
      icon: Building,
      title: 'Property Dashboard',
      description: 'Full visibility of your portfolio. Track properties, tenants, and issues in one place with real-time updates.',
      points: ['Portfolio overview with key metrics', 'Property-level drill-down', 'Issue history per tenant'],
    },
  ];

  return (
    <section className="bg-secondary/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            Core Features
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything You Need to Manage Maintenance
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {features.map(feature => (
            <div key={feature.title} className="rounded-2xl border border-border bg-card p-8">
              <div className="mb-6 flex size-14 items-center justify-center rounded-xl bg-primary/10">
                {feature.icon === WhatsAppIcon
                  ? (
                      <WhatsAppIcon className="size-7 text-primary" />
                    )
                  : (
                      <feature.icon className="size-7 text-primary" />
                    )}
              </div>
              <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
              <p className="mb-6 text-muted-foreground">{feature.description}</p>
              <ul className="space-y-3">
                {feature.points.map(point => (
                  <li key={point} className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 shrink-0 text-green-500" />
                    <span className="text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const DashboardFeatures = () => {
  const dashboardItems = [
    { icon: Home, title: 'Portfolio Overview', desc: 'Properties, tenants, occupancy, and revenue at a glance' },
    { icon: Wrench, title: 'Issue Queue', desc: 'Filter by status, category, or priority. Quick status updates.' },
    { icon: Users, title: 'Tenant Management', desc: 'Contact info, property assignment, and issue history' },
    { icon: FileText, title: 'Internal Notes', desc: 'Private notes on issues for your team - not visible to tenants' },
    { icon: BarChart3, title: 'Analytics', desc: 'Resolution rates, savings tracking, and response metrics' },
    { icon: Bell, title: 'Status Updates', desc: 'Track issues from new to triaging to resolved' },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-blue-600">
            PM Dashboard
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            A Dashboard Built for Property Managers
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Everything you need to manage maintenance - without the noise.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dashboardItems.map(item => (
            <div key={item.title} className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                <item.icon className="size-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const SafetyFeatures = () => (
  <section className="bg-gradient-to-b from-green-50 to-white py-20 dark:from-green-950/20 dark:to-background">
    <div className="mx-auto max-w-6xl px-6">
      <div className="mb-16 text-center">
        <span className="mb-4 inline-block rounded-full bg-green-500/10 px-4 py-1.5 text-sm font-semibold text-green-600">
          Built-in Safety
        </span>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Reduced Liability, Full Audit Trail
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Every interaction is logged. Dangerous issues are blocked from DIY and escalated immediately.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="h-2 bg-green-500" />
          <div className="p-6">
            <h3 className="mb-3 text-lg font-bold">Green: Self-Serve</h3>
            <p className="mb-4 text-muted-foreground">Low-risk issues tenants can safely resolve with guided instructions.</p>
            <div className="rounded-lg bg-muted p-3 text-sm">
              Resetting boilers, unblocking drains, bleeding radiators
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="h-2 bg-yellow-500" />
          <div className="p-6">
            <h3 className="mb-3 text-lg font-bold">Yellow: Guided Caution</h3>
            <p className="mb-4 text-muted-foreground">Moderate issues with step-by-step guidance and safety checks.</p>
            <div className="rounded-lg bg-muted p-3 text-sm">
              Electrical resets, water shut-off, thermostat adjustments
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="h-2 bg-red-500" />
          <div className="p-6">
            <h3 className="mb-3 text-lg font-bold">Red: Escalate Immediately</h3>
            <p className="mb-4 text-muted-foreground">Dangerous issues where DIY is blocked. Escalated with urgency flags.</p>
            <div className="rounded-lg bg-muted p-3 text-sm">
              Gas leaks, electrical faults, structural damage, flooding
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 flex items-center justify-center gap-4 rounded-2xl border border-green-500/20 bg-green-500/5 p-6">
        <Shield className="size-8 text-green-500" />
        <p className="text-lg font-medium">
          Every conversation is logged for compliance and liability protection.
        </p>
      </div>
    </div>
  </section>
);

const Comparison = () => (
  <section className="py-20">
    <div className="mx-auto max-w-4xl px-6">
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Before & After FixMate
        </h2>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 dark:border-red-900 dark:bg-red-950/20">
          <h3 className="mb-6 text-lg font-bold text-red-600">Without FixMate</h3>
          <ul className="space-y-4">
            {[
              'Phone rings at 11pm for simple resets',
              'Dispatch contractor for £150 visit that wasn\'t needed',
              'Tenant frustrated waiting days for callback',
              'No visibility into issue until contractor arrives',
              'Liability risk from unguided DIY attempts',
            ].map(item => (
              <li key={item} className="flex items-start gap-3">
                <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-red-500/20">
                  <span className="text-xs text-red-600">✕</span>
                </div>
                <span className="text-sm text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50/50 p-8 dark:border-green-900 dark:bg-green-950/20">
          <h3 className="mb-6 text-lg font-bold text-green-600">With FixMate</h3>
          <ul className="space-y-4">
            {[
              'AI handles late-night issues automatically',
              '40%+ of issues resolved without callouts',
              'Tenant gets help in under 30 seconds',
              'Full context and photos when escalated',
              'Safety-first triage blocks risky DIY',
            ].map(item => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-500" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

export const FeaturesContent = () => (
  <PublicPageLayout>
    <FeaturesHero />
    <KeyBenefits />
    <CoreFeatures />
    <DashboardFeatures />
    <SafetyFeatures />
    <Comparison />
    <CTABanner />
  </PublicPageLayout>
);
