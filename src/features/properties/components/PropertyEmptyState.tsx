import { Building2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

export function PropertyEmptyState() {
  const t = useTranslations('Properties');

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-primary/10 p-4">
        <Building2 className="size-8 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{t('empty.title')}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {t('empty.description')}
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard/properties/new">{t('empty.action')}</Link>
      </Button>
    </div>
  );
}
