'use client';

import { Building2, Home, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TitleBar } from '@/features/dashboard/TitleBar';
import {
  deleteProperty,
  getProperties,
} from '@/features/properties/actions/propertyActions';
import type { Property } from '@/models/Schema';

const propertyTypeLabels: Record<string, string> = {
  hmo: 'HMO',
  single_let: 'Single Let',
  studio: 'Studio',
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<Property | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchProperties = async () => {
    try {
      const result = await getProperties();
      setProperties(result.data);
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async () => {
    if (!deleteConfirm) {
      return;
    }
    startTransition(async () => {
      try {
        await deleteProperty(deleteConfirm.id);
        setDeleteConfirm(null);
        fetchProperties();
      } catch (error) {
        console.error('Failed to delete property:', error);
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <TitleBar
        title="Properties"
        description="Manage your HMO rental properties"
        action={(
          <Button asChild>
            <Link href="/dashboard/properties/new">
              <Plus className="mr-2 size-4" />
              Add Property
            </Link>
          </Button>
        )}
      />

      {loading
        ? (
            <div className="flex items-center justify-center py-12">
              <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )
        : properties.length === 0
          ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <Building2 className="mx-auto size-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg font-medium text-foreground">No properties yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add your first HMO property to start managing rooms and tenants
                </p>
                <Button className="mt-6" asChild>
                  <Link href="/dashboard/properties/new">
                    <Plus className="mr-2 size-4" />
                    Add Property
                  </Link>
                </Button>
              </div>
            )
          : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map(property => (
                  <div
                    key={property.id}
                    className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <Link
                        href={`/dashboard/properties/${property.id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                          <Home className="size-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{property.name}</h3>
                          {property.address && (
                            <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="size-3" />
                              <span className="max-w-[180px] truncate">{property.address}</span>
                            </p>
                          )}
                        </div>
                      </Link>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          asChild
                        >
                          <Link href={`/dashboard/properties/${property.id}/edit`}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteConfirm(property)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Property Type & Status */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {property.propertyType && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                          {propertyTypeLabels[property.propertyType] || property.propertyType}
                        </Badge>
                      )}
                      <Badge
                        variant="secondary"
                        className={property.status === 'available' ? 'bg-green-50 text-green-700' : 'bg-violet-50 text-violet-700'}
                      >
                        {property.status === 'available' ? 'Available' : 'Occupied'}
                      </Badge>
                      {property.epcRating && (
                        <Badge variant="secondary" className="bg-amber-50 text-amber-700">
                          EPC {property.epcRating}
                        </Badge>
                      )}
                    </div>

                    {/* Stats Row */}
                    <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="size-4" />
                        {property.totalRooms}
                        {' '}
                        room{property.totalRooms !== 1 ? 's' : ''}
                      </div>
                      <div className="font-medium text-foreground">
                        {formatCurrency(property.monthlyRent)}/mo
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {property.furnished === 1 && <span>Furnished</span>}
                      {property.wifiIncluded === 1 && <span>· WiFi</span>}
                      {property.billsIncluded === 1 && <span>· Bills inc.</span>}
                      {property.hasParking === 1 && <span>· Parking</span>}
                      {property.hasGarden === 1 && <span>· Garden</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;
              {deleteConfirm?.name}
              &quot;? This will also remove all associated rooms, tenants and issues.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Deleting...' : 'Delete Property'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
