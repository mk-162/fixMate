'use client';

import { Building2, ClipboardList, MessageSquare, Sparkles, TrendingUp, Wrench } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { TitleBar } from '@/features/dashboard/TitleBar';
import { FixmateAPI, type Issue } from '@/libs/FixmateAPI';

type StatCardProps = {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'teal' | 'emerald' | 'amber' | 'violet';
  href?: string;
};

function StatCard({ label, value, icon, color, href }: StatCardProps) {
  const colorClasses = {
    teal: 'bg-primary/10 text-primary border-primary/20',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    violet: 'bg-violet-50 text-violet-600 border-violet-200',
  };

  const content = (
    <div className={`rounded-xl border p-5 transition-all ${colorClasses[color]} ${href ? 'cursor-pointer hover:shadow-md' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
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

export default function DashboardIndexPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await FixmateAPI.listIssues();
        setIssues(data);
      } catch {
        // Silently fail for dashboard stats
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const activeIssues = issues.filter(i => !['closed', 'resolved_by_agent'].includes(i.status));
  const resolvedByAI = issues.filter(i => i.status === 'resolved_by_agent').length;
  const escalated = issues.filter(i => i.status === 'escalated').length;

  return (
    <>
      <TitleBar
        title="Welcome to FixMate"
        description="Your AI-powered property maintenance assistant"
      />

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Issues"
          value={loading ? '—' : activeIssues.length}
          icon={<ClipboardList className="size-5" />}
          color="teal"
          href="/dashboard/issues"
        />
        <StatCard
          label="Needs Attention"
          value={loading ? '—' : escalated}
          icon={<Wrench className="size-5" />}
          color="amber"
          href="/dashboard/pm-dashboard"
        />
        <StatCard
          label="Resolved by AI"
          value={loading ? '—' : resolvedByAI}
          icon={<Sparkles className="size-5" />}
          color="emerald"
        />
        <StatCard
          label="Resolution Rate"
          value={loading || issues.length === 0 ? '—' : `${Math.round((resolvedByAI / Math.max(issues.length, 1)) * 100)}%`}
          icon={<TrendingUp className="size-5" />}
          color="violet"
        />
      </div>

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

      {/* Recent Activity */}
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
