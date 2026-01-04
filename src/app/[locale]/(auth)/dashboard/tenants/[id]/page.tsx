import {
  ArrowLeft,
  BookOpen,
  Building2,
  Calendar,
  ClipboardList,
  GraduationCap,
  Mail,
  Pencil,
  Phone,
  Shield,
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

function formatDate(date: Date | null): string {
  if (!date) {
    return 'Not set';
  }
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(amount: number | null): string {
  if (amount === null) {
    return 'Not set';
  }
  return `£${amount.toLocaleString()}`;
}

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
          <Button variant="outline" asChild>
            <Link href={`/dashboard/tenants/${tenant.id}/edit`}>
              <Pencil className="mr-2 size-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
              <Calendar className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Lease Start</p>
              <p className="truncate font-medium">
                {formatDate(tenant.leaseStart)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2 text-red-600">
              <Calendar className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Lease End</p>
              <p className="truncate font-medium">
                {formatDate(tenant.leaseEnd)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Info & Financial */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Student Info */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <GraduationCap className="size-5 text-blue-600" />
            Student Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">University</span>
              <span className="font-medium">{tenant.university || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Course</span>
              <span className="font-medium">{tenant.course || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Year of Study</span>
              <span className="font-medium">
                {tenant.yearOfStudy ? `Year ${tenant.yearOfStudy}` : 'Not set'}
              </span>
            </div>
          </div>
        </div>

        {/* Financial */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <BookOpen className="size-5 text-emerald-600" />
            Tenancy Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Rent</span>
              <span className="font-medium">{formatCurrency(tenant.rentAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deposit</span>
              <span className="font-medium">{formatCurrency(tenant.depositAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency & Guarantor */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Emergency Contact */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Phone className="size-5 text-red-600" />
            Emergency Contact
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{tenant.emergencyContactName || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{tenant.emergencyContactPhone || 'Not set'}</span>
            </div>
          </div>
        </div>

        {/* Guarantor */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Shield className="size-5 text-purple-600" />
            Guarantor
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{tenant.guarantorName || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{tenant.guarantorPhone || 'Not set'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {tenant.notes && (
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <h3 className="mb-3 font-semibold">Notes</h3>
          <p className="whitespace-pre-wrap text-muted-foreground">{tenant.notes}</p>
        </div>
      )}

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
                          {formatDate(issue.createdAt)}
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
