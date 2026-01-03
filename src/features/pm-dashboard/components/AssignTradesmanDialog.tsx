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

type AssignTradesmanDialogProps = {
  issue: Issue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (issueId: number, tradesperson: string) => Promise<void>;
};

// Demo tradesperson options - in production, this would come from an API
const TRADESPERSON_OPTIONS = [
  { id: 'quick-fix-plumbing', name: 'Quick Fix Plumbing', specialty: 'Plumbing', rating: 4.8 },
  { id: 'spark-electric', name: 'Spark Electric Ltd', specialty: 'Electrical', rating: 4.9 },
  { id: 'handy-home-repairs', name: 'Handy Home Repairs', specialty: 'General', rating: 4.6 },
  { id: 'heat-masters', name: 'Heat Masters', specialty: 'Heating & HVAC', rating: 4.7 },
  { id: 'apex-maintenance', name: 'Apex Maintenance Co', specialty: 'General', rating: 4.5 },
];

export function AssignTradesmanDialog({
  issue,
  open,
  onOpenChange,
  onAssign,
}: AssignTradesmanDialogProps) {
  const [selectedTradesperson, setSelectedTradesperson] = useState<string>('');
  const [customTradesperson, setCustomTradesperson] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!issue) {
      return;
    }

    const tradesperson = selectedTradesperson === 'custom' ? customTradesperson : selectedTradesperson;
    if (!tradesperson.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onAssign(issue.id, tradesperson);
      onOpenChange(false);
      setSelectedTradesperson('');
      setCustomTradesperson('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <svg className="size-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            Assign Tradesperson
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              {issue && (
                <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="font-medium text-slate-700">{issue.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{issue.description}</p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium text-slate-700">
            Select a tradesperson
          </p>

          <div className="grid gap-2">
            {TRADESPERSON_OPTIONS.map(tp => (
              <button
                key={tp.id}
                type="button"
                onClick={() => {
                  setSelectedTradesperson(tp.name);
                  setCustomTradesperson('');
                }}
                className={`flex items-center justify-between rounded-lg border p-3 text-left transition-all ${
                  selectedTradesperson === tp.name
                    ? 'border-teal-300 bg-teal-50 ring-2 ring-teal-100'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <p className="font-medium text-slate-700">{tp.name}</p>
                  <p className="text-xs text-slate-500">{tp.specialty}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-amber-600">
                  <svg className="size-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {tp.rating}
                </div>
              </button>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">Or enter manually</span>
            </div>
          </div>

          <input
            type="text"
            placeholder="Enter tradesperson name..."
            value={customTradesperson}
            onChange={(e) => {
              setCustomTradesperson(e.target.value);
              if (e.target.value) {
                setSelectedTradesperson('custom');
              } else {
                setSelectedTradesperson('');
              }
            }}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors placeholder:text-slate-400 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <Button
            onClick={handleAssign}
            disabled={loading || (!selectedTradesperson && !customTradesperson)}
            className="bg-teal-600 text-white hover:bg-teal-700"
          >
            {loading
              ? (
                  <>
                    <svg className="mr-2 size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Assigning...
                  </>
                )
              : (
                  'Assign & Notify'
                )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
