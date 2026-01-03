'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TitleBar } from '@/features/dashboard/TitleBar';
import { FixmateAPI, type Issue } from '@/libs/FixmateAPI';

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  triaging: 'bg-yellow-100 text-yellow-800',
  resolved_by_agent: 'bg-green-100 text-green-800',
  escalated: 'bg-orange-100 text-orange-800',
  assigned: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  awaiting_confirmation: 'bg-pink-100 text-pink-800',
  closed: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<string, string> = {
  new: 'New',
  triaging: 'Agent Helping',
  resolved_by_agent: 'Resolved by Agent',
  escalated: 'Escalated',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  awaiting_confirmation: 'Awaiting Confirmation',
  closed: 'Closed',
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
      />

      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Issues</h2>
          <Link href="/dashboard/issues/new">
            <Button>Report New Issue</Button>
          </Link>
        </div>

        {loading && (
          <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
            Loading issues...
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && issues.length === 0 && (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <p className="mb-4 text-gray-500">No issues reported yet.</p>
            <Link href="/dashboard/issues/new">
              <Button>Report Your First Issue</Button>
            </Link>
          </div>
        )}

        {!loading && !error && issues.length > 0 && (
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Issue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {issues.map(issue => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {issue.title}
                      </div>
                      <div className="max-w-xs truncate text-sm text-gray-500">
                        {issue.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={statusColors[issue.status] || 'bg-gray-100'}>
                        {statusLabels[issue.status] || issue.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm capitalize text-gray-500">
                      {issue.priority || 'medium'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/issues/${issue.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
