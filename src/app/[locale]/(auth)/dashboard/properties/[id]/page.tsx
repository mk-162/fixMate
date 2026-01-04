import {
  ArrowLeft,
  ClipboardList,
  DollarSign,
  Home,
  Mail,
  Pencil,
  Phone,
  Users,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPropertyWithDetails } from '@/features/properties/actions/propertyActions';
import { PropertyStatusBadge } from '@/features/properties/components/PropertyStatusBadge';

type Props = {
  params: Promise<{ id: string }>;
};

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  triaging: 'bg-purple-100 text-purple-700',
  resolved_by_agent: 'bg-emerald-100 text-emerald-700',
  escalated: 'bg-red-100 text-red-700',
  assigned: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-orange-100 text-orange-700',
  awaiting_confirmation: 'bg-cyan-100 text-cyan-700',
  closed: 'bg-gray-100 text-gray-700',
};

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export async function generateMetadata(props: Props) {
  const { id } = await props.params;
  const propertyId = Number.parseInt(id, 10);

  if (Number.isNaN(propertyId)) {
    return { title: 'Property Not Found' };
  }

  try {
    const { property } = await getPropertyWithDetails(propertyId);
    return { title: property.name };
  } catch {
    return { title: 'Property Not Found' };
  }
}

export default async function PropertyDetailPage(props: Props) {
  const { id } = await props.params;
  const propertyId = Number.parseInt(id, 10);

  if (Number.isNaN(propertyId)) {
    notFound();
  }

  let data;
  try {
    data = await getPropertyWithDetails(propertyId);
  } catch {
    notFound();
  }

  const { property, tenants, issues, stats } = data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/properties"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Properties
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{property.name}</h1>
            <p className="mt-1 text-muted-foreground">{property.address}</p>
          </div>
          <div className="flex items-center gap-2">
            <PropertyStatusBadge status={property.status} />
            <Button variant="outline" asChild>
              <Link href={`/dashboard/properties/${property.id}/edit`}>
                <Pencil className="mr-2 size-4" />
                Edit
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
              <Home className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{property.totalRooms}</p>
              <p className="text-sm text-muted-foreground">Rooms</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-violet-100 p-2 text-violet-600">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.tenantCount}</p>
              <p className="text-sm text-muted-foreground">Tenants</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
              <DollarSign className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(property.monthlyRent)}</p>
              <p className="text-sm text-muted-foreground">Monthly Rent</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${stats.activeIssueCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'}`}>
              <ClipboardList className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.activeIssueCount}</p>
              <p className="text-sm text-muted-foreground">Active Issues</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Tenants Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Tenants</h2>
            <Link href="/dashboard/tenants">
              <Button variant="ghost" size="sm" className="text-primary">
                Manage
              </Button>
            </Link>
          </div>

          {tenants.length === 0
            ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
                  <Users className="mx-auto size-10 text-muted-foreground/50" />
                  <p className="mt-3 font-medium text-foreground">No tenants yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add tenants to this property
                  </p>
                  <Link href="/dashboard/tenants">
                    <Button className="mt-4" size="sm">
                      Add Tenant
                    </Button>
                  </Link>
                </div>
              )
            : (
                <div className="divide-y divide-border rounded-xl border border-border bg-card">
                  {tenants.map(tenant => (
                    <Link
                      key={tenant.id}
                      href={`/dashboard/tenants/${tenant.id}`}
                      className="block p-4 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{tenant.name}</p>
                          {tenant.university && (
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {tenant.university}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        {tenant.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="size-3.5" />
                            {tenant.email}
                          </span>
                        )}
                        {tenant.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="size-3.5" />
                            {tenant.phone}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
        </div>

        {/* Issues Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Issues</h2>
            <Link href="/dashboard/issues">
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </Link>
          </div>

          {issues.length === 0
            ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
                  <Wrench className="mx-auto size-10 text-muted-foreground/50" />
                  <p className="mt-3 font-medium text-foreground">No issues</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No maintenance requests for this property
                  </p>
                </div>
              )
            : (
                <div className="divide-y divide-border rounded-xl border border-border bg-card">
                  {issues.map(issue => (
                    <Link
                      key={issue.id}
                      href={`/dashboard/issues/${issue.id}`}
                      className="block p-4 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-foreground">{issue.title}</p>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {new Date(issue.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                            })}
                            {issue.category && ` · ${issue.category}`}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {issue.priority && issue.priority !== 'medium' && (
                            <Badge className={priorityColors[issue.priority] || ''} variant="secondary">
                              {issue.priority}
                            </Badge>
                          )}
                          <Badge className={statusColors[issue.status] || ''} variant="secondary">
                            {issue.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                      {issue.assignedTo && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Assigned to:
                          {' '}
                          {issue.assignedTo}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
        </div>
      </div>

      {/* Notes Section */}
      {property.notes && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Notes</h2>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="whitespace-pre-wrap text-muted-foreground">{property.notes}</p>
          </div>
        </div>
      )}

      {/* Property Image */}
      {property.imageUrl && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Property Image</h2>
          <img
            src={property.imageUrl}
            alt={property.name}
            className="max-h-64 rounded-xl object-cover"
          />
        </div>
      )}
    </>
  );
}

export const dynamic = 'force-dynamic';
