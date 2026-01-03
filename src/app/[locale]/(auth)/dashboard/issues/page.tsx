'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TitleBar } from '@/features/dashboard/TitleBar';
import { FixmateAPI, type Issue } from '@/libs/FixmateAPI';

const statusColors: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  triaging: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved_by_agent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  escalated: 'bg-orange-50 text-orange-700 border-orange-200',
  assigned: 'bg-violet-50 text-violet-700 border-violet-200',
  in_progress: 'bg-primary/10 text-primary border-primary/20',
  awaiting_confirmation: 'bg-pink-50 text-pink-700 border-pink-200',
  closed: 'bg-muted text-muted-foreground border-border',
};

const statusLabels: Record<string, string> = {
  new: 'New',
  triaging: 'Agent Helping',
  resolved_by_agent: 'Resolved by AI',
  escalated: 'Escalated',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  awaiting_confirmation: 'Awaiting Confirmation',
  closed: 'Closed',
};

const priorityColors: Record<string, string> = {
  low: 'text-muted-foreground',
  medium: 'text-foreground',
  high: 'text-orange-600 font-medium',
  urgent: 'text-red-600 font-semibold',
};

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIssues() {
      try {
        const data = await FixmateAPI.listIssues();
        setIssues(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load issues');
      } finally {
        setLoading(false);
      }
    }
    fetchIssues();
  }, []);

  return (
    <>
      <TitleBar
        title="Maintenance Issues"
        description="View and manage property maintenance requests"
        action={(
          <Link href="/dashboard/issues/new">
            <Button className="gap-2">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Report Issue
            </Button>
          </Link>
        )}
      />

      {loading && (
        <div className="animate-fade-in rounded-xl border border-border bg-card p-12 text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Loading issues...</p>
        </div>
      )}

      {error && (
        <div className="animate-fade-in rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-destructive/10 p-2">
              <svg className="size-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-destructive">Failed to load issues</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && issues.length === 0 && (
        <div className="animate-fade-in rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <svg className="size-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">No issues yet</h3>
          <p className="mb-6 mt-1 text-muted-foreground">
            Report your first maintenance issue to get started
          </p>
          <Link href="/dashboard/issues/new">
            <Button>Report Your First Issue</Button>
          </Link>
        </div>
      )}

      {!loading && !error && issues.length > 0 && (
        <div className="animate-fade-in overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Issue
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {issues.map(issue => (
                  <tr
                    key={issue.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/issues/${issue.id}`}
                        className="block transition-colors hover:text-primary"
                      >
                        <div className="font-medium text-foreground">
                          {issue.title}
                        </div>
                        <div className="mt-0.5 line-clamp-1 max-w-xs text-sm text-muted-foreground">
                          {issue.description}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`border ${statusColors[issue.status] || 'bg-muted'}`}>
                        {statusLabels[issue.status] || issue.status}
                      </Badge>
                    </td>
                    <td className={`px-6 py-4 text-sm capitalize ${priorityColors[issue.priority || 'medium']}`}>
                      {issue.priority || 'medium'}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(issue.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/issues/${issue.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-primary hover:bg-primary/10 hover:text-primary">
                          View
                          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
