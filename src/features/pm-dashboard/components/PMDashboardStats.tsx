'use client';

import type { Issue } from '@/libs/FixmateAPI';

type PMDashboardStatsProps = {
  issues: Issue[];
  loading?: boolean;
};

type StatCardProps = {
  label: string;
  value: number;
  color: 'teal' | 'orange' | 'violet' | 'emerald' | 'slate';
  icon: React.ReactNode;
};

function StatCard({ label, value, color, icon }: StatCardProps) {
  const colorClasses = {
    teal: 'bg-teal-50 text-teal-700 border-teal-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
  };

  const iconColorClasses = {
    teal: 'text-teal-500',
    orange: 'text-orange-500',
    violet: 'text-violet-500',
    emerald: 'text-emerald-500',
    slate: 'text-slate-400',
  };

  return (
    <div className={`rounded-xl border p-5 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
        </div>
        <div className={`rounded-lg bg-white/60 p-2 ${iconColorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function PMDashboardStats({ issues, loading }: PMDashboardStatsProps) {
  const escalatedCount = issues.filter(i => i.status === 'escalated').length;
  const assignedCount = issues.filter(i => ['assigned', 'in_progress'].includes(i.status)).length;
  const resolvedByAI = issues.filter(i => i.status === 'resolved_by_agent').length;
  const closedCount = issues.filter(i => i.status === 'closed').length;
  const needsAttention = issues.filter(i => ['escalated', 'awaiting_confirmation'].includes(i.status)).length;

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <StatCard
        label="Needs Attention"
        value={needsAttention}
        color="orange"
        icon={(
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
      />
      <StatCard
        label="Escalated"
        value={escalatedCount}
        color="teal"
        icon={(
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )}
      />
      <StatCard
        label="In Progress"
        value={assignedCount}
        color="violet"
        icon={(
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )}
      />
      <StatCard
        label="Resolved by AI"
        value={resolvedByAI}
        color="emerald"
        icon={(
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )}
      />
      <StatCard
        label="Closed"
        value={closedCount}
        color="slate"
        icon={(
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      />
    </div>
  );
}
