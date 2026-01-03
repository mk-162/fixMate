'use client';

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Home,
  MessageCircle,
  Phone,
  Send,
  Shield,
  Sparkles,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

// WhatsApp Icon Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// FixMate Logo
const FixMateLogo = () => (
  <div className="flex items-center gap-2.5">
    <div className="flex size-10 items-center justify-center rounded-xl bg-primary">
      <Wrench className="size-5 text-white" />
    </div>
    <span className="text-xl font-bold tracking-tight">FixMate</span>
  </div>
);

// Navigation
const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="glass fixed inset-x-0 top-0 z-50 border-b border-border/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <FixMateLogo />

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 md:flex">
          <a href="#problem" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            The Problem
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            How It Works
          </a>
          <a href="#safety" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Safety
          </a>
          <a
            href="/sign-in"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign In
          </a>
          <a
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-transparent px-5 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary/10"
          >
            Sign Up
          </a>
          <a
            href="#demo"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
          >
            Book Demo
            <ArrowRight className="size-4" />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="rounded-lg p-2 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <div className="flex flex-col gap-1.5">
            <span className={`block h-0.5 w-6 bg-foreground transition-transform ${mobileMenuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-6 bg-foreground transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-6 bg-foreground transition-transform ${mobileMenuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="glass border-t border-border/50 md:hidden">
          <div className="flex flex-col gap-4 p-6">
            <a href="#problem" className="text-sm font-medium text-muted-foreground">The Problem</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground">How It Works</a>
            <a href="#safety" className="text-sm font-medium text-muted-foreground">Safety</a>
            <a href="/sign-in" className="text-sm font-medium text-muted-foreground">Sign In</a>
            <a href="/sign-up" className="text-sm font-medium text-primary">Sign Up</a>
            <a
              href="#demo"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white"
            >
              Book Demo
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

// Phone Mockup with WhatsApp Chat
const PhoneMockup = () => (
  <div className="animate-float relative mx-auto w-[280px] md:w-[320px]">
    {/* Phone Frame */}
    <div className="phone-shadow overflow-hidden rounded-[3rem] border-8 border-gray-900 bg-gray-900">
      {/* Screen */}
      <div className="relative h-[580px] w-full overflow-hidden rounded-[2.5rem] bg-[#0b141a]">
        {/* WhatsApp Header */}
        <div className="flex items-center gap-3 bg-[#1f2c34] px-4 py-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary">
            <Wrench className="size-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">FixMate</div>
            <div className="text-xs text-gray-400">online</div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex flex-col gap-3 p-4">
          {/* User Message */}
          <div className="ml-auto max-w-[80%] rounded-lg rounded-tr-none bg-[#005c4b] px-3 py-2">
            <p className="text-sm text-white">My boiler won&apos;t turn on and it&apos;s freezing! What do I do? 😰</p>
            <span className="mt-1 block text-right text-[10px] text-gray-300">11:42 PM</span>
          </div>

          {/* FixMate Response */}
          <div className="mr-auto max-w-[85%] rounded-lg rounded-tl-none bg-[#1f2c34] px-3 py-2">
            <p className="text-sm text-white">
              Don&apos;t worry! Let&apos;s figure this out together. 💪
            </p>
            <p className="mt-2 text-sm text-white">
              First, can you check if the pressure gauge shows below 1 bar? Send me a photo of your boiler display.
            </p>
            <span className="mt-1 block text-right text-[10px] text-gray-400">11:42 PM</span>
          </div>

          {/* Safety indicator */}
          <div className="mr-auto flex items-center gap-2 rounded-lg bg-[#1f2c34] px-3 py-2">
            <div className="flex size-6 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle2 className="size-4 text-green-400" />
            </div>
            <span className="text-xs text-green-400">Safe to troubleshoot yourself</span>
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-[#1f2c34] p-3">
          <div className="flex-1 rounded-full bg-[#2a3942] px-4 py-2">
            <span className="text-sm text-gray-400">Message FixMate...</span>
          </div>
          <div className="flex size-10 items-center justify-center rounded-full bg-primary">
            <Send className="size-4 text-white" />
          </div>
        </div>
      </div>
    </div>

    {/* Glow Effect */}
    <div className="absolute -inset-10 -z-10 rounded-full bg-primary/20 blur-3xl" />
  </div>
);

// Hero Section
const HeroSection = () => (
  <section className="relative min-h-screen overflow-hidden pt-24">
    {/* Background */}
    <div className="gradient-mesh absolute inset-0 -z-10" />

    <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-16 md:flex-row md:py-24">
      {/* Content */}
      <div className="flex-1 text-center md:text-left">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
          <WhatsAppIcon className="size-4 text-primary" />
          <span className="text-sm font-medium text-primary">WhatsApp-native support</span>
        </div>

        <h1 className="animate-fade-up text-balance text-4xl font-extrabold leading-[1.1] tracking-tight opacity-0 md:text-5xl lg:text-6xl">
          Maintenance calls,
          {' '}
          <span className="text-primary">handled.</span>
        </h1>

        <p className="animate-fade-up animation-delay-200 mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground opacity-0 md:text-xl">
          FixMate triages tenant issues via WhatsApp — resolving simple fixes instantly and escalating real problems with full context. Fewer calls for you, faster help for them.
        </p>

        <div className="animate-fade-up animation-delay-300 mt-10 flex flex-col items-center gap-4 opacity-0 sm:flex-row md:justify-start">
          <a
            href="#demo"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 sm:w-auto"
          >
            Book a demo
            <ArrowRight className="size-5" />
          </a>
          <a
            href="#how-it-works"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-border bg-white px-8 py-4 text-base font-semibold transition-all hover:border-primary/30 hover:bg-primary/5 sm:w-auto"
          >
            See how it works
          </a>
        </div>

        {/* Trust Indicator */}
        <div className="animate-fade-up animation-delay-400 mt-12 flex items-center justify-center gap-6 opacity-0 md:justify-start">
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-primary" />
            <span className="text-sm text-muted-foreground">Reduced liability</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="size-5 text-primary" />
            <span className="text-sm text-muted-foreground">60% fewer callouts</span>
          </div>
        </div>
      </div>

      {/* Phone Mockup */}
      <div className="mt-16 flex-1 md:mt-0">
        <PhoneMockup />
      </div>
    </div>
  </section>
);

// Problem Section
const ProblemSection = () => {
  const problems = [
    {
      icon: Phone,
      title: 'After-hours calls',
      description: 'Your phone rings at 11pm because a tenant doesn\'t know how to reset their boiler.',
    },
    {
      icon: Clock,
      title: 'Wasted callouts',
      description: 'You dispatch a contractor for a problem that could\'ve been fixed with a 2-minute explanation.',
    },
    {
      icon: AlertTriangle,
      title: 'Liability risk',
      description: 'Tenants attempt DIY fixes on issues they shouldn\'t touch. You\'re left holding the risk.',
    },
  ];

  return (
    <section id="problem" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-destructive/10 px-4 py-1.5 text-sm font-semibold text-destructive">
            The Problem
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Tenant maintenance is eating your time
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Every call, every unnecessary callout, every panicked text — it adds up. There\'s a better way.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {problems.map((problem, i) => (
            <div
              key={problem.title}
              className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-destructive/30 hover:shadow-lg"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-destructive/10 transition-colors group-hover:bg-destructive/20">
                <problem.icon className="size-6 text-destructive" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">{problem.title}</h3>
              <p className="leading-relaxed text-muted-foreground">{problem.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <p className="text-xl font-semibold text-primary">
            FixMate handles the noise so you can focus on what matters.
          </p>
        </div>
      </div>
    </section>
  );
};

// How It Works Section
const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      icon: MessageCircle,
      title: 'Tenant messages FixMate',
      description: 'Your tenants message via WhatsApp — photos, voice notes, or text. No app downloads, no portals, no friction.',
    },
    {
      number: '02',
      icon: Sparkles,
      title: 'AI triages instantly',
      description: 'Our AI diagnoses the issue in seconds, classifies safety risk, and determines if it\'s a DIY fix or needs a professional.',
    },
    {
      number: '03',
      icon: CheckCircle2,
      title: 'You get actionable tickets',
      description: 'Simple issues are resolved automatically. Real problems hit your dashboard with full context, photos, and recommended action.',
    },
  ];

  return (
    <section id="how-it-works" className="relative bg-secondary/50 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            How It Works
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Three steps to peace of mind
          </h2>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-primary/50 via-primary to-primary/50 md:block" />

          <div className="flex flex-col gap-12 md:gap-24">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={`flex flex-col items-center gap-8 md:flex-row ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Content */}
                <div className={`flex-1 ${i % 2 === 1 ? 'md:text-right' : ''}`}>
                  <span className="mb-4 inline-block text-sm font-bold text-primary">{step.number}</span>
                  <h3 className="mb-4 text-2xl font-bold">{step.title}</h3>
                  <p className="max-w-md text-lg leading-relaxed text-muted-foreground">{step.description}</p>
                </div>

                {/* Icon */}
                <div className="relative z-10 flex size-24 items-center justify-center rounded-full border-4 border-primary bg-white shadow-xl">
                  <step.icon className="size-10 text-primary" />
                </div>

                {/* Spacer */}
                <div className="hidden flex-1 md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Safety Section
const SafetySection = () => {
  const safetyLevels = [
    {
      color: 'bg-green-500',
      title: 'Green: Self-serve',
      description: 'Low-risk issues tenants can safely resolve with guided instructions.',
      examples: 'Resetting a boiler, unblocking a drain, bleeding a radiator',
    },
    {
      color: 'bg-yellow-500',
      title: 'Yellow: Guided caution',
      description: 'Moderate issues with step-by-step guidance and safety checks.',
      examples: 'Minor electrical resets, water shut-off, thermostat adjustments',
    },
    {
      color: 'bg-red-500',
      title: 'Red: Escalate immediately',
      description: 'Dangerous issues where DIY is blocked. Escalated to you with urgency flags.',
      examples: 'Gas leaks, electrical faults, structural damage, flooding',
    },
  ];

  return (
    <section id="safety" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-green-500/10 px-4 py-1.5 text-sm font-semibold text-green-600">
            Built-in Safety
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Automated triage protects you and your tenants
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Every issue is classified by safety level. Dangerous problems are blocked from DIY and escalated to you immediately — with full documentation.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {safetyLevels.map(level => (
            <div key={level.title} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className={`h-2 ${level.color}`} />
              <div className="p-6">
                <h3 className="mb-3 text-lg font-bold">{level.title}</h3>
                <p className="mb-4 text-muted-foreground">{level.description}</p>
                <div className="rounded-lg bg-muted p-3">
                  <span className="text-sm font-medium text-muted-foreground">Examples: </span>
                  <span className="text-sm">{level.examples}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <Shield className="size-8 text-primary" />
          <p className="text-lg font-medium">
            <span className="text-primary">Every interaction is logged.</span>
            {' '}
            Full audit trail for compliance and liability protection.
          </p>
        </div>
      </div>
    </section>
  );
};

// Why Different Section
const WhyDifferentSection = () => {
  const differences = [
    {
      icon: WhatsAppIcon,
      title: 'Tenants actually use it',
      description: 'WhatsApp means zero friction. No app downloads, no portal logins. Adoption rates above 90%.',
    },
    {
      icon: Zap,
      title: 'Instant resolution',
      description: 'AI resolves simple issues in minutes, not days. Fewer back-and-forth messages for everyone.',
    },
    {
      icon: Users,
      title: 'Happier tenants',
      description: 'Fast, friendly support improves satisfaction scores and reduces complaints.',
    },
    {
      icon: Home,
      title: 'Built for UK housing',
      description: 'We understand HMOs, Victorian heating systems, and student accommodation regulations.',
    },
  ];

  return (
    <section className="relative bg-secondary/50 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            Why FixMate
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Your tenants love it. You&apos;ll love the results.
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          {differences.map(diff => (
            <div key={diff.title} className="flex gap-5 rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                {diff.icon === WhatsAppIcon
                  ? (
                      <WhatsAppIcon className="size-6 text-primary" />
                    )
                  : (
                      <diff.icon className="size-6 text-primary" />
                    )}
              </div>
              <div>
                <h3 className="mb-2 text-lg font-bold">{diff.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{diff.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Vision Section
const VisionSection = () => (
  <section className="relative overflow-hidden py-24 md:py-32">
    <div className="gradient-mesh absolute inset-0 -z-10 opacity-50" />

    <div className="mx-auto max-w-4xl px-6 text-center">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
        Where we&apos;re going
      </h2>

      <div className="mt-12 flex flex-col items-center gap-8 md:flex-row md:gap-4">
        <div className="flex-1 rounded-2xl border border-border bg-card p-8">
          <div className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">Today</div>
          <h3 className="text-xl font-bold">AI maintenance triage</h3>
          <p className="mt-2 text-muted-foreground">Instant issue resolution and smart escalation via WhatsApp</p>
        </div>

        <div className="flex size-12 items-center justify-center">
          <ArrowRight className="size-8 rotate-90 text-primary md:rotate-0" />
        </div>

        <div className="flex-1 rounded-2xl border-2 border-primary bg-primary/5 p-8">
          <div className="mb-4 text-sm font-bold uppercase tracking-wider text-primary">Tomorrow</div>
          <h3 className="text-xl font-bold text-primary">Complete property operations</h3>
          <p className="mt-2 text-muted-foreground">Predictive maintenance, contractor marketplace, and full property intelligence</p>
        </div>
      </div>
    </div>
  </section>
);

// CTA / Demo Section
const DemoSection = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section id="demo" className="relative bg-foreground py-24 text-background md:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
          <Sparkles className="size-4" />
          <span className="text-sm font-medium">Limited pilot spots</span>
        </div>

        <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
          See FixMate in action
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
          We&apos;re onboarding property managers for our pilot programme. Book a 15-minute demo to see how FixMate can reduce your maintenance burden.
        </p>

        {submitted
          ? (
              <div className="mt-10 rounded-2xl bg-primary/20 p-8">
                <CheckCircle2 className="mx-auto mb-4 size-12 text-primary" />
                <h3 className="text-xl font-bold">We&apos;ll be in touch!</h3>
                <p className="mt-2 text-white/70">Expect an email within 24 hours to schedule your demo.</p>
              </div>
            )
          : (
              <form onSubmit={handleSubmit} className="mx-auto mt-10 flex max-w-md flex-col gap-4 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Work email"
                  className="flex-1 rounded-full bg-white/10 px-6 py-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 font-semibold text-white transition-all hover:bg-primary/90"
                >
                  Book demo
                  <ArrowRight className="size-5" />
                </button>
              </form>
            )}

        <p className="mt-6 text-sm text-white/50">
          Free during pilot. No commitment required.
        </p>
      </div>
    </section>
  );
};

// Footer
const FooterSection = () => (
  <footer className="border-t border-border bg-card py-12">
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
      <FixMateLogo />

      <div className="flex items-center gap-6">
        <span className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">Privacy</span>
        <span className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">Terms</span>
        <span className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">Contact</span>
      </div>

      <p className="text-sm text-muted-foreground">
        ©
        {' '}
        {new Date().getFullYear()}
        {' '}
        FixMate. All rights reserved.
      </p>
    </div>
  </footer>
);

// Main Landing Page Component
export const FixMateLanding = () => (
  <main className="min-h-screen bg-background">
    <Navigation />
    <HeroSection />
    <ProblemSection />
    <HowItWorksSection />
    <SafetySection />
    <WhyDifferentSection />
    <VisionSection />
    <DemoSection />
    <FooterSection />
  </main>
);
