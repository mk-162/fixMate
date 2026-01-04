import type { Metadata } from 'next';

import { WishlistContent } from '@/templates/fixmate/WishlistPage';

export const metadata: Metadata = {
  title: 'Product Roadmap | FixMate',
  description: 'See what features are coming next to FixMate - AI-powered property maintenance platform.',
};

export default function WishlistPage() {
  return <WishlistContent />;
}
