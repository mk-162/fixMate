/**
 * PM Dashboard constants - status colors, labels, and priority mappings
 */

export const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  triaging: 'bg-amber-100 text-amber-700 border-amber-200',
  resolved_by_agent: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  escalated: 'bg-orange-100 text-orange-700 border-orange-200',
  assigned: 'bg-violet-100 text-violet-700 border-violet-200',
  in_progress: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  awaiting_confirmation: 'bg-pink-100 text-pink-700 border-pink-200',
  closed: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const statusLabels: Record<string, string> = {
  new: 'New',
  triaging: 'Agent Helping',
  resolved_by_agent: 'Resolved by AI',
  escalated: 'Escalated',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  awaiting_confirmation: 'Awaiting Confirmation',
  closed: 'Closed',
};

export const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export const priorityLabels: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

// Issues requiring PM attention
export const PM_ACTION_STATUSES = ['escalated', 'assigned', 'in_progress', 'awaiting_confirmation'];

// All active (non-closed) statuses
export const ACTIVE_STATUSES = ['new', 'triaging', 'resolved_by_agent', 'escalated', 'assigned', 'in_progress', 'awaiting_confirmation'];
