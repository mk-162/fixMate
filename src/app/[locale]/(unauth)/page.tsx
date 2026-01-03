import type { Metadata } from 'next';

import { FixMateLanding } from '@/templates/fixmate/FixMateLanding';

export const metadata: Metadata = {
  title: 'FixMate — AI-powered tenant maintenance for property managers',
  description:
    'FixMate triages tenant maintenance issues via WhatsApp. Reduce callouts by 60%, cut after-hours calls, and keep tenants happy.',
  openGraph: {
    title: 'FixMate — AI-powered tenant maintenance for property managers',
    description:
      'FixMate triages tenant maintenance issues via WhatsApp. Reduce callouts by 60%, cut after-hours calls, and keep tenants happy.',
    type: 'website',
  },
};

export default function IndexPage() {
  return <FixMateLanding />;
}
