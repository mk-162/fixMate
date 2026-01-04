import type { Metadata } from 'next';

import { FAQContent } from '@/templates/fixmate/FAQPage';

export const metadata: Metadata = {
  title: 'FAQ for Landlords & Property Managers | FixMate',
  description: 'Frequently asked questions about FixMate - AI-powered maintenance triage for property managers.',
};

export default function FAQPage() {
  return <FAQContent />;
}
