'use client';

import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { Issue } from '@/libs/FixmateAPI';

type CloseIssueDialogProps = {
  issue: Issue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: (issueId: number) => Promise<void>;
};

export function CloseIssueDialog({
  issue,
  open,
  onOpenChange,
  onClose,
}: CloseIssueDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleClose = async () => {
    if (!issue) {
      return;
    }

    setLoading(true);
    try {
      await onClose(issue.id);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <svg className="size-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Close Issue
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <p className="text-slate-600">
                Are you sure you want to close this issue? This will mark it as fully resolved.
              </p>
              {issue && (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="font-medium text-slate-700">{issue.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Issue #
                    {issue.id}
                  </p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <Button
            onClick={handleClose}
            disabled={loading}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {loading
              ? (
                  <>
                    <svg className="mr-2 size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Closing...
                  </>
                )
              : (
                  'Close Issue'
                )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
