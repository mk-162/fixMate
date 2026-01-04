import type { Metadata } from 'next';

import { FeaturesContent } from '@/templates/fixmate/FeaturesPage';

export const metadata: Metadata = {
  title: 'Features for Landlords & Property Managers | FixMate',
  description: 'Discover how FixMate helps landlords and property managers reduce maintenance costs, save time, and keep tenants happy.',
};

export default function FeaturesPage() {
  return <FeaturesContent />;
}
