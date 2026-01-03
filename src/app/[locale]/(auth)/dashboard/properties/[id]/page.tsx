import { Pencil } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import { DashboardSection } from '@/features/dashboard/DashboardSection';
import { getProperty } from '@/features/properties/actions/propertyActions';
import { PropertyStatusBadge } from '@/features/properties/components/PropertyStatusBadge';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props) {
  const { id } = await props.params;
  const propertyId = Number.parseInt(id, 10);

  if (Number.isNaN(propertyId)) {
    return { title: 'Property Not Found' };
  }

  try {
    const property = await getProperty(propertyId);
    return { title: property.name };
  } catch {
    return { title: 'Property Not Found' };
  }
}

export default async function PropertyDetailPage(props: Props) {
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
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="text-2xl font-semibold">{property.name}</div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/properties/${property.id}/edit`}>
            <Pencil className="mr-2 size-4" />
            {t('actions.edit')}
          </Link>
        </Button>
      </div>

      <DashboardSection
        title={t('detail.sectionTitle')}
        description={t('detail.sectionDescription')}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              {t('detail.address')}
            </h3>
            <p className="mt-1">{property.address}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              {t('detail.status')}
            </h3>
            <div className="mt-1">
              <PropertyStatusBadge status={property.status} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              {t('detail.totalRooms')}
            </h3>
            <p className="mt-1">{property.totalRooms}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              {t('detail.monthlyRent')}
            </h3>
            <p className="mt-1">
              {new Intl.NumberFormat('en-GB', {
                style: 'currency',
                currency: 'GBP',
              }).format(property.monthlyRent)}
            </p>
          </div>

          {property.imageUrl && (
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t('detail.image')}
              </h3>
              <img
                src={property.imageUrl}
                alt={property.name}
                className="mt-2 max-h-64 rounded-md object-cover"
              />
            </div>
          )}

          {property.notes && (
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t('detail.notes')}
              </h3>
              <p className="mt-1 whitespace-pre-wrap">{property.notes}</p>
            </div>
          )}
        </div>
      </DashboardSection>
    </>
  );
}

export const dynamic = 'force-dynamic';
