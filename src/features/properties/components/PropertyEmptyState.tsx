import { Building2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

export function PropertyEmptyState() {
  const t = useTranslations('Properties');

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4">
        <Building2 className="size-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{t('empty.title')}</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {t('empty.description')}
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard/properties/new">{t('empty.action')}</Link>
      </Button>
    </div>
  );
}
