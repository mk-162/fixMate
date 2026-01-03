import { Plus } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import { TitleBar } from '@/features/dashboard/TitleBar';
import { getProperties } from '@/features/properties/actions/propertyActions';
import { PropertyEmptyState } from '@/features/properties/components/PropertyEmptyState';
import { PropertyTable } from '@/features/properties/components/PropertyTable';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Properties' });
  return { title: t('meta.title') };
}

export default async function PropertiesPage() {
  const t = await getTranslations('Properties');
  const { data: properties } = await getProperties();

  return (
    <>
      <TitleBar title={t('title')} description={t('description')} />

      <div className="mb-6 flex justify-end">
        <Button asChild>
          <Link href="/dashboard/properties/new">
            <Plus className="mr-2 size-4" />
            {t('addProperty')}
          </Link>
        </Button>
      </div>

      <div className="rounded-md bg-card p-5">
        {properties.length === 0
          ? (
              <PropertyEmptyState />
            )
          : (
              <PropertyTable properties={properties} />
            )}
      </div>
    </>
  );
}

export const dynamic = 'force-dynamic';
