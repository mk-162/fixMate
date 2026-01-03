'use client';

import { useCallback, useEffect, useState } from 'react';

import { TitleBar } from '@/features/dashboard/TitleBar';
import {
  AssignTradesmanDialog,
  CloseIssueDialog,
  PMDashboardStats,
  PMIssueQueue,
} from '@/features/pm-dashboard/components';
import { FixmateAPI, type Issue } from '@/libs/FixmateAPI';

export default function PMDashboardPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const fetchIssues = useCallback(async () => {
    try {
      const data = await FixmateAPI.listIssues();
      setIssues(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchIssues, 30000);
    return () => clearInterval(interval);
  }, [fetchIssues]);

  const handleAssignClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setAssignDialogOpen(true);
  };

  const handleCloseClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setCloseDialogOpen(true);
  };

  const handleAssign = async (issueId: number, tradesperson: string) => {
    await FixmateAPI.assignTradesperson(issueId, tradesperson);
    await fetchIssues();
  };

  const handleClose = async (issueId: number) => {
    await FixmateAPI.closeIssue(issueId);
    await fetchIssues();
  };

  return (
    <>
      <TitleBar
        title="Property Manager Dashboard"
        description="Manage escalated issues and coordinate tradesperson assignments"
      />

      <div className="mt-6 space-y-6">
        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="flex items-center gap-2">
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">Connection Error</span>
            </div>
            <p className="mt-1 text-sm">{error}</p>
            <button
              type="button"
              onClick={fetchIssues}
              className="mt-2 text-sm font-medium text-red-700 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Stats Overview */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Overview</h2>
          <PMDashboardStats issues={issues} loading={loading} />
        </section>

        {/* Issue Queue */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Issue Queue</h2>
          <PMIssueQueue
            issues={issues}
            loading={loading}
            onAssign={handleAssignClick}
            onClose={handleCloseClick}
          />
        </section>
      </div>

      {/* Dialogs */}
      <AssignTradesmanDialog
        issue={selectedIssue}
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        onAssign={handleAssign}
      />

      <CloseIssueDialog
        issue={selectedIssue}
        open={closeDialogOpen}
        onOpenChange={setCloseDialogOpen}
        onClose={handleClose}
      />
    </>
  );
}
