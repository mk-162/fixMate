'use client';

import {
  ArrowRight,
  ChevronDown,
  HelpCircle,
  Mail,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { PublicPageLayout } from '@/components/public/PublicLayout';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // Getting Started
  {
    category: 'Getting Started',
    question: 'How do I get started with FixMate?',
    answer: 'Getting started is simple: Sign up for a free account, add your properties and tenants, and share the WhatsApp number with your tenants. They can start reporting issues immediately. We offer a free pilot period so you can see the results before committing.',
  },
  {
    category: 'Getting Started',
    question: 'Do my tenants need to download an app?',
    answer: 'No! Tenants simply message via WhatsApp - the app they already use. There\'s no app to download, no portal to log into, and no passwords to remember. This is why adoption rates are above 90%.',
  },
  {
    category: 'Getting Started',
    question: 'How long does setup take?',
    answer: 'Most property managers are up and running within 30 minutes. Add your properties, import your tenant list (or add manually), and you\'re ready to go. Our team can help with bulk imports if you have many properties.',
  },

  // How It Works
  {
    category: 'How It Works',
    question: 'How does the AI triage work?',
    answer: 'When a tenant reports an issue, our AI (powered by Claude) analyzes the message, asks clarifying questions, and determines the best course of action. For simple issues like resetting a boiler, it provides step-by-step guidance. For complex or dangerous issues, it escalates to you with full context, photos, and a cost estimate.',
  },
  {
    category: 'How It Works',
    question: 'What types of issues can the AI resolve?',
    answer: 'The AI excels at common troubleshooting: resetting boilers, unblocking drains, bleeding radiators, adjusting thermostats, checking circuit breakers, and more. These typically make up 40-60% of maintenance calls. For issues requiring professional attention, it escalates with full context.',
  },
  {
    category: 'How It Works',
    question: 'How fast does the AI respond?',
    answer: 'Response time is typically under 30 seconds. Unlike human support that\'s only available during office hours, FixMate provides 24/7 instant responses. This is especially valuable for late-night issues that don\'t actually need a callout.',
  },
  {
    category: 'How It Works',
    question: 'Can tenants send photos and voice notes?',
    answer: 'Yes! Tenants can send photos and voice notes via WhatsApp. The AI uses these to better diagnose issues. Photos are also attached when escalating to you, so you can see exactly what the tenant is describing.',
  },

  // Safety & Emergencies
  {
    category: 'Safety & Emergencies',
    question: 'How does FixMate handle emergencies?',
    answer: 'FixMate automatically detects emergency keywords like "gas leak", "fire", "flooding", and "smoke". When detected, it immediately escalates to you with an urgent flag, provides safety instructions to the tenant, and blocks any DIY troubleshooting. You receive instant notification.',
  },
  {
    category: 'Safety & Emergencies',
    question: 'Will tenants try dangerous DIY repairs?',
    answer: 'FixMate uses a safety-first approach. Issues are classified into three levels: Green (safe to guide), Yellow (proceed with caution), and Red (escalate immediately, no DIY). For anything potentially dangerous, the AI explicitly tells tenants NOT to attempt repairs and escalates to you.',
  },
  {
    category: 'Safety & Emergencies',
    question: 'Is there an audit trail for compliance?',
    answer: 'Yes. Every conversation, action, and decision is logged with timestamps. This provides full documentation for compliance purposes and protects you in case of disputes. You can access the complete history for any issue at any time.',
  },

  // Pricing & Plans
  {
    category: 'Pricing & Plans',
    question: 'How much does FixMate cost?',
    answer: 'We offer simple, transparent pricing based on the number of properties you manage. There\'s no setup fee, and we offer a free pilot period so you can see the value before committing. Contact us for a custom quote based on your portfolio size.',
  },
  {
    category: 'Pricing & Plans',
    question: 'Is there a free trial?',
    answer: 'Yes! We offer a free pilot program for new customers. This lets you test FixMate with a few properties and see real results before scaling up. No credit card required to start.',
  },
  {
    category: 'Pricing & Plans',
    question: 'What ROI can I expect?',
    answer: 'Most property managers see ROI within the first month. If the average contractor callout costs £150 and FixMate resolves 40% of issues without a callout, the math works quickly. Plus, you save hours of time handling calls and coordinating repairs.',
  },

  // Integration & Technical
  {
    category: 'Integration & Technical',
    question: 'Does FixMate integrate with my property management software?',
    answer: 'We\'re building integrations with popular PMS platforms like Buildium, AppFolio, and Yardi. Currently, FixMate works as a standalone system with its own dashboard. Contact us to discuss integration priorities.',
  },
  {
    category: 'Integration & Technical',
    question: 'How does WhatsApp integration work?',
    answer: 'FixMate uses the official WhatsApp Business API (via Twilio or Respond.io). Tenants message a dedicated WhatsApp number for your organization. All messages are routed to the AI for triage. You don\'t need to share your personal number.',
  },
  {
    category: 'Integration & Technical',
    question: 'Can I customize the AI\'s responses?',
    answer: 'Yes. You can configure troubleshooting guides for specific appliances, set custom escalation rules, and adjust the AI\'s communication style. Enterprise customers can access more advanced customization options.',
  },

  // Property Types
  {
    category: 'Property Types',
    question: 'Does FixMate work for HMOs?',
    answer: 'Absolutely. FixMate is designed with HMOs in mind. Each tenant can be associated with their specific room, and rent can be tracked at the tenant level for room-specific pricing. The AI understands shared property dynamics.',
  },
  {
    category: 'Property Types',
    question: 'Can I use FixMate for student accommodation?',
    answer: 'Yes! Student properties often have high volumes of simple maintenance requests. FixMate handles these efficiently while ensuring serious issues get immediate attention. The 24/7 availability is especially valuable for student tenants.',
  },
  {
    category: 'Property Types',
    question: 'How many properties can I manage?',
    answer: 'FixMate scales from single landlords with a few properties to agencies managing hundreds. The dashboard is designed to handle large portfolios with filtering, search, and bulk operations.',
  },
];

const FAQAccordion = ({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) => (
  <div className="border-b border-border last:border-b-0">
    <button
      type="button"
      className="flex w-full items-center justify-between py-5 text-left"
      onClick={onToggle}
    >
      <span className="pr-4 font-semibold">{item.question}</span>
      <ChevronDown className={`size-5 shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    {isOpen && (
      <div className="pb-5 pr-8 text-muted-foreground">
        {item.answer}
      </div>
    )}
  </div>
);

const FAQSection = ({ category, items }: { category: string; items: FAQItem[] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mb-12">
      <h2 className="mb-6 text-xl font-bold">{category}</h2>
      <div className="rounded-2xl border border-border bg-card">
        {items.map((item, index) => (
          <FAQAccordion
            key={item.question}
            item={item}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </div>
  );
};

const FAQHero = () => (
  <section className="bg-gradient-to-b from-primary/5 to-transparent py-20">
    <div className="mx-auto max-w-4xl px-6 text-center">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
        <HelpCircle className="size-4 text-primary" />
        <span className="text-sm font-medium text-primary">Frequently Asked Questions</span>
      </div>
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
        Got Questions? We've Got Answers.
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
        Everything landlords and property managers need to know about FixMate's AI-powered maintenance triage.
      </p>
    </div>
  </section>
);

const FAQContent = () => {
  const categories = [...new Set(faqs.map(faq => faq.category))];

  return (
    <section className="py-16">
      <div className="mx-auto max-w-3xl px-6">
        {categories.map(category => (
          <FAQSection
            key={category}
            category={category}
            items={faqs.filter(faq => faq.category === category)}
          />
        ))}
      </div>
    </section>
  );
};

const StillHaveQuestions = () => (
  <section className="bg-secondary/50 py-16">
    <div className="mx-auto max-w-3xl px-6 text-center">
      <MessageCircle className="mx-auto mb-6 size-12 text-primary" />
      <h2 className="text-2xl font-bold">Still Have Questions?</h2>
      <p className="mt-4 text-muted-foreground">
        Can't find what you're looking for? Our team is happy to help.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link
          href="/#demo"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90"
        >
          Book a Demo
          <ArrowRight className="size-4" />
        </Link>
        <a
          href="mailto:support@fixmate.io"
          className="inline-flex items-center gap-2 rounded-full border-2 border-border px-6 py-3 font-semibold transition-all hover:border-primary/30 hover:bg-primary/5"
        >
          <Mail className="size-4" />
          Email Support
        </a>
      </div>
    </div>
  </section>
);

export const FAQPage = () => (
  <PublicPageLayout>
    <FAQHero />
    <FAQContent />
    <StillHaveQuestions />
  </PublicPageLayout>
);

// Export alias for the page import
export { FAQPage as FAQContent };
