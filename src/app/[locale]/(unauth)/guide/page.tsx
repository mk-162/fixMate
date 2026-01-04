import type { Metadata } from 'next';

import { GuideContent } from '@/templates/fixmate/GuidePage';

export const metadata: Metadata = {
  title: 'Technical Guide | FixMate',
  description: 'Technical documentation and architecture guide for the FixMate platform.',
};

export default function GuidePage() {
  return <GuideContent />;
}
