'use client';

import {
  Building2,
  ClipboardList,
  DollarSign,
  Home,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Users,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  type DashboardStats,
  getDashboardStats,
  getPropertiesWithStats,
  type PropertyWithStats,
} from '@/features/dashboard/actions/dashboardActions';
import { TitleBar } from '@/features/dashboard/TitleBar';
import { FixmateAPI, type Issue } from '@/libs/FixmateAPI';

type StatCardProps = {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'teal' | 'emerald' | 'amber' | 'violet' | 'blue' | 'rose';
  href?: string;
  subtext?: string;
};

function StatCard({ label, value, icon, color, href, subtext }: StatCardProps) {
  const colorClasses = {
    teal: 'bg-primary/10 text-primary border-primary/20',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    violet: 'bg-violet-50 text-violet-600 border-violet-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
  };

  const content = (
    <div className={`rounded-xl border p-5 transition-all ${colorClasses[color]} ${href ? 'cursor-pointer hover:shadow-md' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
          {subtext && <p className="mt-0.5 text-xs opacity-70">{subtext}</p>}
        </div>
        <div className="rounded-lg bg-white/60 p-2.5">
          {icon}
        </div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

type QuickActionProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
};

function QuickAction({ title, description, icon, href }: QuickActionProps) {
  return (
    <Link href={href}>
      <div className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md">
        <div className="rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  );
}

function PropertyCard({ property }: { property: PropertyWithStats }) {
  return (
    <Link href={`/dashboard/properties/${property.id}`}>
      <div className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-foreground">{property.name}</h3>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{property.address}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
            property.status === 'occupied'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}
          >
            {property.status}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {property.tenantCount}
            {' '}
            tenants
          </span>
          <span className="flex items-center gap-1">
            <Home className="size-3.5" />
            {property.totalRooms}
            {' '}
            rooms
          </span>
          {property.activeIssueCount > 0 && (
            <span className="flex items-center gap-1 text-amber-600">
              <Wrench className="size-3.5" />
              {property.activeIssueCount}
              {' '}
              issues
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function DashboardIndexPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [properties, setProperties] = useState<PropertyWithStats[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, propertiesData, issuesData] = await Promise.all([
          getDashboardStats(),
          getPropertiesWithStats(),
          FixmateAPI.listIssues().catch(() => []),
        ]);
        setStats(statsData);
        setProperties(propertiesData);
        setIssues(issuesData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
        title="Dashboard"
        description="Your property portfolio at a glance"
      />

      {/* Portfolio Overview */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Portfolio Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Properties"
            value={loading ? '—' : stats?.propertyCount ?? 0}
            icon={<Building2 className="size-5" />}
            color="blue"
            href="/dashboard/properties"
            subtext={loading ? '' : `${stats?.totalRooms ?? 0} total rooms`}
          />
          <StatCard
            label="Tenants"
            value={loading ? '—' : stats?.tenantCount ?? 0}
            icon={<Users className="size-5" />}
            color="violet"
            href="/dashboard/tenants"
            subtext={loading ? '' : `${stats?.occupancyRate ?? 0}% occupancy`}
          />
          <StatCard
            label="Monthly Rent"
            value={loading ? '—' : formatCurrency(stats?.totalMonthlyRent ?? 0)}
            icon={<DollarSign className="size-5" />}
            color="emerald"
            subtext="Expected income"
          />
          <StatCard
            label="Active Issues"
            value={loading ? '—' : stats?.activeIssues ?? 0}
            icon={<ClipboardList className="size-5" />}
            color={!loading && (stats?.activeIssues ?? 0) > 0 ? 'amber' : 'teal'}
            href="/dashboard/issues"
            subtext={loading ? '' : `${stats?.escalatedIssues ?? 0} need attention`}
          />
        </div>
      </div>

      {/* AI Performance */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">AI Performance</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Resolved by AI"
            value={loading ? '—' : stats?.resolvedByAI ?? 0}
            icon={<Sparkles className="size-5" />}
            color="emerald"
          />
          <StatCard
            label="Resolution Rate"
            value={loading ? '—' : `${stats?.resolutionRate ?? 0}%`}
            icon={<TrendingUp className="size-5" />}
            color="violet"
          />
          <StatCard
            label="Needs Attention"
            value={loading ? '—' : stats?.escalatedIssues ?? 0}
            icon={<Wrench className="size-5" />}
            color="amber"
            href="/dashboard/pm-dashboard"
          />
        </div>
      </div>

      {/* Properties Summary */}
      {properties.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Your Properties</h2>
            <Link href="/dashboard/properties">
              <Button variant="ghost" size="sm" className="text-primary">
                View all
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {properties.slice(0, 6).map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            title="View Issues"
            description="See all maintenance requests"
            icon={<ClipboardList className="size-5" />}
            href="/dashboard/issues"
          />
          <QuickAction
            title="PM Dashboard"
            description="Manage escalated issues"
            icon={<Wrench className="size-5" />}
            href="/dashboard/pm-dashboard"
          />
          <QuickAction
            title="Properties"
            description="Manage your properties"
            icon={<Building2 className="size-5" />}
            href="/dashboard/properties"
          />
          <QuickAction
            title="Tenants"
            description="Manage tenant contacts"
            icon={<MessageSquare className="size-5" />}
            href="/dashboard/tenants"
          />
        </div>
      </div>

      {/* Recent Issues */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Issues</h2>
          <Link href="/dashboard/issues">
            <Button variant="ghost" size="sm" className="text-primary">
              View all
            </Button>
          </Link>
        </div>

        {loading
          ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <div className="mx-auto size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )
          : issues.length === 0
            ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
                  <MessageSquare className="mx-auto size-10 text-muted-foreground/50" />
                  <p className="mt-3 font-medium text-foreground">No issues yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    When tenants report issues, they&apos;ll appear here
                  </p>
                </div>
              )
            : (
                <div className="divide-y divide-border rounded-xl border border-border bg-card">
                  {issues.slice(0, 5).map(issue => (
                    <Link
                      key={issue.id}
                      href={`/dashboard/issues/${issue.id}`}
                      className="flex items-center justify-between p-4 transition-colors hover:bg-muted/30"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">{issue.title}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {new Date(issue.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                          })}
                          {' · '}
                          <span className="capitalize">{issue.status.replace(/_/g, ' ')}</span>
                        </p>
                      </div>
                      <svg className="size-5 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              )}
      </div>
    </>
  );
}
