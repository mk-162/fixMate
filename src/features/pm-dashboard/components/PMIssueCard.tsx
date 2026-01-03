'use client';

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Issue } from '@/libs/FixmateAPI';

import { priorityColors, priorityLabels, statusColors, statusLabels } from '../constants';
import { CategoryBadge } from './CategoryBadge';

type PMIssueCardProps = {
  issue: Issue;
  onAssign: (issue: Issue) => void;
  onClose: (issue: Issue) => void;
  onStatusChange?: (issue: Issue, newStatus: string) => void;
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) {
    return 'Just now';
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return date.toLocaleDateString();
}

export function PMIssueCard({ issue, onAssign, onClose, onStatusChange }: PMIssueCardProps) {
  const canAssign = ['escalated', 'new'].includes(issue.status);
  const canClose = ['assigned', 'in_progress', 'awaiting_confirmation', 'resolved_by_agent'].includes(issue.status);
  const isUrgent = issue.priority === 'urgent' || issue.priority === 'high';

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus !== issue.status && onStatusChange) {
      onStatusChange(issue, newStatus);
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border bg-white transition-all hover:shadow-md ${
        isUrgent ? 'border-l-4 border-l-orange-400' : ''
      }`}
    >
      {/* Top accent bar for escalated issues */}
      {issue.status === 'escalated' && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-400 to-orange-500" />
      )}

      <div className="p-4">
        {/* Header row */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Link
              href={`/dashboard/issues/${issue.id}`}
              className="block truncate font-semibold text-slate-800 transition-colors hover:text-teal-600"
            >
              {issue.title}
            </Link>
            <p className="mt-0.5 text-xs text-slate-500">
              Issue #
              {issue.id}
              {' '}
              &middot;
              {' '}
              {formatTimeAgo(issue.created_at)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge className={`border text-xs ${priorityColors[issue.priority || 'medium']}`}>
              {priorityLabels[issue.priority || 'medium']}
            </Badge>
          </div>
        </div>

        {/* Description */}
        <p className="mb-3 line-clamp-2 text-sm text-slate-600">
          {issue.description}
        </p>

        {/* Category and Status */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {onStatusChange
            ? (
                <select
                  value={issue.status}
                  onChange={handleStatusChange}
                  className={`cursor-pointer rounded-full border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-200 ${statusColors[issue.status]}`}
                  onClick={e => e.stopPropagation()}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              )
            : (
                <Badge className={`border text-xs ${statusColors[issue.status]}`}>
                  {statusLabels[issue.status] || issue.status}
                </Badge>
              )}
          <CategoryBadge category={issue.category} />
          {issue.assigned_to && (
            <span className="flex items-center gap-1 text-xs text-violet-600">
              <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {issue.assigned_to}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
          <Link href={`/dashboard/issues/${issue.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <svg className="mr-1.5 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </Button>
          </Link>

          {canAssign && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAssign(issue)}
              className="border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <svg className="mr-1.5 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Assign
            </Button>
          )}

          {canClose && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onClose(issue)}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <svg className="mr-1.5 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
