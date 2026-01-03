import { getTranslations } from 'next-intl/server';

import { DashboardSection } from '@/features/dashboard/DashboardSection';
import { TitleBar } from '@/features/dashboard/TitleBar';
import { PropertyForm } from '@/features/properties/components/PropertyForm';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Properties' });
  return { title: t('meta.create') };
}

export default async function NewPropertyPage() {
  const t = await getTranslations('Properties');

  return (
    <>
      <TitleBar title={t('createTitle')} description={t('createDescription')} />
      <DashboardSection
        title={t('createSectionTitle')}
        description={t('createSectionDescription')}
      >
        <div className="max-w-2xl">
          <PropertyForm mode="create" />
        </div>
      </DashboardSection>
    </>
  );
}
