'use client';

import {
  Building2,
  Calendar,
  GraduationCap,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  User,
  Users,
} from 'lucide-react';
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
  deleteTenant,
  getTenantsWithDetails,
} from '@/features/tenants/actions/tenantActions';
import type { Property, Room, Tenant } from '@/models/Schema';

type TenantWithDetails = Tenant & {
  property: Property | null;
  room: Room | null;
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<TenantWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<TenantWithDetails | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchData = async () => {
    try {
      const data = await getTenantsWithDetails();
      setTenants(data);
    } catch (error) {
      console.error('Failed to load tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deleteConfirm) {
      return;
    }
    startTransition(async () => {
      try {
        await deleteTenant(deleteConfirm.id);
        setDeleteConfirm(null);
        fetchData();
      } catch (error) {
        console.error('Failed to delete tenant:', error);
      }
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) {
      return null;
    }
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <>
      <TitleBar
        title="Tenants"
        description="Manage your student tenants"
        action={(
          <Button asChild>
            <Link href="/dashboard/tenants/new">
              <Plus className="mr-2 size-4" />
              Add Tenant
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
        : tenants.length === 0
          ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <Users className="mx-auto size-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg font-medium text-foreground">No tenants yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add tenants to assign them to rooms and manage their details
                </p>
                <Button className="mt-6" asChild>
                  <Link href="/dashboard/tenants/new">
                    <Plus className="mr-2 size-4" />
                    Add Tenant
                  </Link>
                </Button>
              </div>
            )
          : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tenants.map(tenant => (
                  <div
                    key={tenant.id}
                    className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <Link
                        href={`/dashboard/tenants/${tenant.id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-600">
                          <User className="size-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{tenant.name}</h3>
                          {tenant.property && (
                            <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                              <Building2 className="size-3" />
                              {tenant.property.name}
                              {tenant.room && ` · ${tenant.room.roomName}`}
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
                          <Link href={`/dashboard/tenants/${tenant.id}/edit`}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteConfirm(tenant)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                      {tenant.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="size-3.5" />
                          {tenant.phone}
                        </div>
                      )}
                      {tenant.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="size-3.5" />
                          <span className="truncate">{tenant.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Badges Row */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tenant.university && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                          <GraduationCap className="mr-1 size-3" />
                          {tenant.university}
                        </Badge>
                      )}
                      {tenant.leaseEnd && (
                        <Badge
                          variant="secondary"
                          className={
                            new Date(tenant.leaseEnd) < new Date()
                              ? 'bg-red-50 text-red-700'
                              : new Date(tenant.leaseEnd) < new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-gray-50 text-gray-700'
                          }
                        >
                          <Calendar className="mr-1 size-3" />
                          Ends
                          {' '}
                          {formatDate(tenant.leaseEnd)}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Tenant</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove &quot;
              {deleteConfirm?.name}
              &quot;? Their issue history will be preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Removing...' : 'Remove Tenant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
