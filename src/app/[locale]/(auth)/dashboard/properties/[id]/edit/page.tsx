import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { DashboardSection } from '@/features/dashboard/DashboardSection';
import { TitleBar } from '@/features/dashboard/TitleBar';
import { getProperty } from '@/features/properties/actions/propertyActions';
import { PropertyForm } from '@/features/properties/components/PropertyForm';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props) {
  const { id } = await props.params;
  const t = await getTranslations('Properties');
  const propertyId = Number.parseInt(id, 10);

  if (Number.isNaN(propertyId)) {
    return { title: 'Property Not Found' };
  }

  try {
    const property = await getProperty(propertyId);
    return { title: `${t('meta.edit')} - ${property.name}` };
  } catch {
    return { title: 'Property Not Found' };
  }
}

export default async function EditPropertyPage(props: Props) {
  const t = await getTranslations('Properties');
  const { id } = await props.params;
  const propertyId = Number.parseInt(id, 10);

  if (Number.isNaN(propertyId)) {
    notFound();
  }

  let property;
  try {
    property = await getProperty(propertyId);
  } catch {
    notFound();
  }

  return (
    <>
      <TitleBar title={t('editTitle')} description={t('editDescription')} />
      <DashboardSection
        title={t('editSectionTitle')}
        description={t('editSectionDescription')}
      >
        <div className="max-w-2xl">
          <PropertyForm property={property} mode="edit" />
        </div>
      </DashboardSection>
    </>
  );
}

export const dynamic = 'force-dynamic';
