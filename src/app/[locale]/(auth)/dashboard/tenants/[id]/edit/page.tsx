'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { use, useEffect, useState, useTransition } from 'react';

import { getProperties } from '@/features/properties/actions/propertyActions';
import { getRooms } from '@/features/rooms/actions/roomActions';
import { getTenants, updateTenant } from '@/features/tenants/actions/tenantActions';
import { TenantForm } from '@/features/tenants/components/TenantForm';
import type { TenantFormValues } from '@/features/tenants/schemas/tenantSchema';
import type { Property, Room, Tenant } from '@/models/Schema';

type Props = {
  params: Promise<{ id: string }>;
};

export default function EditTenantPage(props: Props) {
  const { id } = use(props.params);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const tenantId = Number.parseInt(id, 10);

  useEffect(() => {
    if (Number.isNaN(tenantId)) {
      return;
    }

    async function fetchData() {
      try {
        // Fetch all tenants and find the one we need
        const tenants = await getTenants();
        const foundTenant = tenants.find(t => t.id === tenantId);

        if (!foundTenant) {
          setLoading(false);
          return;
        }

        setTenant(foundTenant);

        // Fetch properties
        const propsResult = await getProperties();
        setProperties(propsResult.data);

        // Fetch rooms for all properties
        const allRooms: Room[] = [];
        for (const prop of propsResult.data) {
          try {
            const propRooms = await getRooms(prop.id);
            allRooms.push(...propRooms);
          } catch {
            // Property might not have rooms yet
          }
        }
        setRooms(allRooms);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [tenantId]);

  if (Number.isNaN(tenantId)) {
    notFound();
  }

  const handleSubmit = async (data: TenantFormValues) => {
    startTransition(async () => {
      try {
        await updateTenant(tenantId, data);
        router.push(`/dashboard/tenants/${tenantId}`);
      } catch (error) {
        console.error('Failed to update tenant:', error);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!tenant) {
    notFound();
  }

  return (
    <>
      <div className="mb-6">
        <Link
          href={`/dashboard/tenants/${tenantId}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Tenant
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">Edit Tenant</h1>
        <p className="mt-1 text-muted-foreground">
          Update details for
          {' '}
          {tenant.name}
        </p>
      </div>

      <TenantForm
        tenant={tenant}
        properties={properties}
        rooms={rooms}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/dashboard/tenants/${tenantId}`)}
        isLoading={isPending}
      />
    </>
  );
}
