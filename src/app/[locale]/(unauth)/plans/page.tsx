import type { Metadata } from 'next';
import fs from 'node:fs';
import path from 'node:path';

import { PlansContent } from '@/templates/fixmate/PlansPage';

export const metadata: Metadata = {
  title: 'Development Plans | FixMate',
  description: 'Active development plans and proposals for the FixMate platform.',
};

// Read all plan files from .claude/plans directory at build time
async function getPlans() {
  const plansDir = path.join(process.cwd(), '.claude', 'plans');

  try {
    const files = fs.readdirSync(plansDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));

    const plans = mdFiles.map((filename) => {
      const filePath = path.join(plansDir, filename);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Extract title from first heading
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch?.[1] ?? filename.replace('.md', '');

      // Extract status if present
      const statusMatch = content.match(/\*\*Status\*\*:\s*(.+)/);
      const status = statusMatch?.[1]?.trim() ?? 'Draft';

      // Extract created date if present
      const createdMatch = content.match(/\*\*Created\*\*:\s*(.+)/);
      const created = createdMatch?.[1]?.trim() ?? null;

      return {
        slug: filename.replace('.md', ''),
        filename,
        title,
        status,
        created,
        content,
      };
    });

    return plans;
  } catch {
    return [];
  }
}

export default async function PlansPage() {
  const plans = await getPlans();
  return <PlansContent plans={plans} />;
}
