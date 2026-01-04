'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { getProperties } from '@/features/properties/actions/propertyActions';
import { getRooms } from '@/features/rooms/actions/roomActions';
import { createTenant } from '@/features/tenants/actions/tenantActions';
import { TenantForm } from '@/features/tenants/components/TenantForm';
import type { TenantFormValues } from '@/features/tenants/schemas/tenantSchema';
import type { Property, Room } from '@/models/Schema';

export default function NewTenantPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
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
  }, []);

  const handleSubmit = async (data: TenantFormValues) => {
    startTransition(async () => {
      try {
        await createTenant(data);
        router.push('/dashboard/tenants');
      } catch (error) {
        console.error('Failed to create tenant:', error);
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

  return (
    <>
      <div className="mb-6">
        <Link
          href="/dashboard/tenants"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Tenants
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">Add New Tenant</h1>
        <p className="mt-1 text-muted-foreground">
          Add a new student tenant to your property
        </p>
      </div>

      <TenantForm
        properties={properties}
        rooms={rooms}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/dashboard/tenants')}
        isLoading={isPending}
      />
    </>
  );
}
