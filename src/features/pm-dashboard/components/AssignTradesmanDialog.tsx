'use client';

import { CalendarIcon, Phone, PoundSterling } from 'lucide-react';
import { useEffect, useState } from 'react';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  assignContractorToIssue,
  getContractors,
  getContractorsForCategory,
} from '@/features/contractors/actions/contractorActions';
import { type ContractorTrade, tradeLabels } from '@/features/contractors/schemas/contractorSchema';
import type { Issue } from '@/libs/FixmateAPI';
import type { Contractor } from '@/models/Schema';

type AssignTradesmanDialogProps = {
  issue: Issue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (issueId: number, tradesperson: string) => Promise<void>;
};

export function AssignTradesmanDialog({
  issue,
  open,
  onOpenChange,
  onAssign,
}: AssignTradesmanDialogProps) {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [customTradesperson, setCustomTradesperson] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [notes, setNotes] = useState('');
  const [quotedAmount, setQuotedAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingContractors, setLoadingContractors] = useState(false);

  // Fetch contractors when dialog opens
  useEffect(() => {
    if (open && issue) {
      setLoadingContractors(true);
      const fetchContractors = async () => {
        try {
          // Try to get contractors matching the issue category
          const category = issue.category || 'general';
          const result = await getContractorsForCategory(category);
          if (result.data.length > 0) {
            setContractors(result.data);
          } else {
            // Fallback to all contractors
            const allResult = await getContractors({ isActive: 1 });
            setContractors(allResult.data);
          }
        } catch (err) {
          console.error('Failed to load contractors:', err);
          setContractors([]);
        } finally {
          setLoadingContractors(false);
        }
      };
      fetchContractors();
    }
  }, [open, issue]);

  const resetForm = () => {
    setSelectedContractor(null);
    setCustomTradesperson('');
    setScheduledFor('');
    setNotes('');
    setQuotedAmount('');
  };

  const handleAssign = async () => {
    if (!issue) {
      return;
    }

    setLoading(true);
    try {
      if (selectedContractor) {
        // Use the new contractor assignment system
        await assignContractorToIssue({
          issueId: issue.id,
          contractorId: selectedContractor.id,
          scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
          notes: notes || undefined,
          quotedAmount: quotedAmount ? Number.parseInt(quotedAmount, 10) * 100 : undefined,
        });

        // Also call the original onAssign for compatibility
        const contractorName = selectedContractor.company
          ? `${selectedContractor.name} (${selectedContractor.company})`
          : selectedContractor.name;
        await onAssign(issue.id, contractorName);
      } else if (customTradesperson.trim()) {
        // Fallback to manual entry (legacy behavior)
        await onAssign(issue.id, customTradesperson.trim());
      }

      onOpenChange(false);
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const formatRate = (rateInPence: number | null) => {
    if (!rateInPence) {
      return null;
    }
    return `£${(rateInPence / 100).toFixed(0)}/hr`;
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          resetForm();
        }
      }}
    >
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
            Assign Contractor
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              {issue && (
                <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="font-medium text-slate-700">{issue.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{issue.description}</p>
                  {issue.category && (
                    <span className="mt-2 inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                      {issue.category}
                    </span>
                  )}
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700">
              Select a contractor
            </p>

            {loadingContractors
              ? (
                  <div className="mt-2 flex items-center justify-center py-8">
                    <div className="size-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
                  </div>
                )
              : contractors.length === 0
                ? (
                    <div className="mt-2 rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
                      No contractors found.
                      {' '}
                      <a href="/dashboard/contractors" className="text-teal-600 hover:underline">
                        Add contractors
                      </a>
                      {' '}
                      to your directory.
                    </div>
                  )
                : (
                    <div className="mt-2 grid max-h-48 gap-2 overflow-y-auto">
                      {contractors.map(contractor => (
                        <button
                          key={contractor.id}
                          type="button"
                          onClick={() => {
                            setSelectedContractor(contractor);
                            setCustomTradesperson('');
                          }}
                          className={`flex items-center justify-between rounded-lg border p-3 text-left transition-all ${
                            selectedContractor?.id === contractor.id
                              ? 'border-teal-300 bg-teal-50 ring-2 ring-teal-100'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <p className="font-medium text-slate-700">{contractor.name}</p>
                            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                              {contractor.company && <span>{contractor.company}</span>}
                              <span className="rounded-full bg-slate-100 px-1.5 py-0.5">
                                {tradeLabels[contractor.trade as ContractorTrade] || contractor.trade}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {contractor.phone && (
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Phone className="size-3" />
                                {contractor.phone}
                              </div>
                            )}
                            {contractor.hourlyRate && (
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <PoundSterling className="size-3" />
                                {formatRate(contractor.hourlyRate)}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
          </div>

          {/* Divider */}
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
                setSelectedContractor(null);
              }
            }}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors placeholder:text-slate-400 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-100"
          />

          {/* Additional fields when contractor is selected */}
          {selectedContractor && (
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="scheduledFor" className="text-xs">
                    <CalendarIcon className="mr-1 inline-block size-3" />
                    Scheduled For
                  </Label>
                  <Input
                    id="scheduledFor"
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={e => setScheduledFor(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="quotedAmount" className="text-xs">
                    <PoundSterling className="mr-1 inline-block size-3" />
                    Quoted Amount (£)
                  </Label>
                  <Input
                    id="quotedAmount"
                    type="number"
                    placeholder="150"
                    value={quotedAmount}
                    onChange={e => setQuotedAmount(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="notes" className="text-xs">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Any additional notes for the contractor..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <Button
            onClick={handleAssign}
            disabled={loading || (!selectedContractor && !customTradesperson.trim())}
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
