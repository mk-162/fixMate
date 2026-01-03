import {
  ArrowLeft,
  Building2,
  Calendar,
  ClipboardList,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getTenantWithDetails } from '@/features/tenants/actions/tenantActions';

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
  const tenantId = Number.parseInt(id, 10);

  if (Number.isNaN(tenantId)) {
    return { title: 'Tenant Not Found' };
  }

  try {
    const { tenant } = await getTenantWithDetails(tenantId);
    return { title: tenant.name };
  } catch {
    return { title: 'Tenant Not Found' };
  }
}

export default async function TenantDetailPage(props: Props) {
  const { id } = await props.params;
  const tenantId = Number.parseInt(id, 10);

  if (Number.isNaN(tenantId)) {
    notFound();
  }

  let data;
  try {
    data = await getTenantWithDetails(tenantId);
  } catch {
    notFound();
  }

  const { tenant, property, issues, stats } = data;

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/tenants"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Tenants
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-emerald-100 p-3 text-emerald-600">
              <User className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{tenant.name}</h1>
              {property && (
                <Link
                  href={`/dashboard/properties/${property.id}`}
                  className="mt-1 flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <Building2 className="size-4" />
                  {property.name}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Info Section */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Phone */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
              <Phone className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="truncate font-medium">
                {tenant.phone || 'Not provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-violet-100 p-2 text-violet-600">
              <Mail className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="truncate font-medium">
                {tenant.email || 'Not provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Room */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
              <Building2 className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Room</p>
              <p className="truncate font-medium">
                {tenant.roomNumber || 'Not assigned'}
              </p>
            </div>
          </div>
        </div>

        {/* Move In Date */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
              <Calendar className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Move-in Date</p>
              <p className="truncate font-medium">
                {tenant.moveInDate
                  ? new Date(tenant.moveInDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                  : 'Not set'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
              <ClipboardList className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalIssues}</p>
              <p className="text-sm text-muted-foreground">Total Issues</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${stats.activeIssues > 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'}`}>
              <ClipboardList className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.activeIssues}</p>
              <p className="text-sm text-muted-foreground">Active Issues</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
              <ClipboardList className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.resolvedIssues}</p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Issues Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Issue History</h2>
          <Link href="/dashboard/issues">
            <Button variant="ghost" size="sm" className="text-primary">
              View All Issues
            </Button>
          </Link>
        </div>

        {issues.length === 0
          ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
                <ClipboardList className="mx-auto size-10 text-muted-foreground/50" />
                <p className="mt-3 font-medium text-foreground">No issues reported</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This tenant hasn&apos;t reported any maintenance issues yet
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
                            year: 'numeric',
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

      {/* Property Link */}
      {property && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Property</h2>
          <Link href={`/dashboard/properties/${property.id}`}>
            <div className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                  <Building2 className="size-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{property.name}</p>
                  <p className="text-sm text-muted-foreground">{property.address}</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}
    </>
  );
}

export const dynamic = 'force-dynamic';
