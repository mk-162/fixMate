'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { Issue } from '@/libs/FixmateAPI';

import { ACTIVE_STATUSES, PM_ACTION_STATUSES, priorityLabels, statusLabels } from '../constants';
import { PMIssueCard } from './PMIssueCard';

type PMIssueQueueProps = {
  issues: Issue[];
  loading?: boolean;
  onAssign: (issue: Issue) => void;
  onClose: (issue: Issue) => void;
  onStatusChange?: (issue: Issue, newStatus: string) => void;
  properties?: { id: number; name: string }[];
  tenants?: { id: number; name: string }[];
};

type FilterTab = 'needs_action' | 'all_active' | 'resolved' | 'closed';
type SortOption = 'newest' | 'oldest' | 'priority';

export function PMIssueQueue({ issues, loading, onAssign, onClose, onStatusChange, properties: _properties, tenants: _tenants }: PMIssueQueueProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('needs_action');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [propertyFilter, _setPropertyFilter] = useState<string>('all');
  const [tenantFilter, _setTenantFilter] = useState<string>('all');
  const [dateFrom, _setDateFrom] = useState<string>('');
  const [dateTo, _setDateTo] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAndSortedIssues = useMemo(() => {
    let filtered = [...issues];

    // Tab filtering
    switch (activeTab) {
      case 'needs_action':
        filtered = filtered.filter(i => PM_ACTION_STATUSES.includes(i.status));
        break;
      case 'all_active':
        filtered = filtered.filter(i => ACTIVE_STATUSES.includes(i.status));
        break;
      case 'resolved':
        filtered = filtered.filter(i => i.status === 'resolved_by_agent');
        break;
      case 'closed':
        filtered = filtered.filter(i => i.status === 'closed');
        break;
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(i => i.priority === priorityFilter);
    }

    // Property filter
    if (propertyFilter !== 'all') {
      filtered = filtered.filter(i => i.property_id === Number(propertyFilter));
    }

    // Tenant filter
    if (tenantFilter !== 'all') {
      filtered = filtered.filter(i => i.tenant_id === Number(tenantFilter));
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(i => new Date(i.created_at) >= new Date(dateFrom));
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(i => new Date(i.created_at) <= toDate);
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        i =>
          i.title.toLowerCase().includes(query)
          || i.description.toLowerCase().includes(query)
          || (i.category && i.category.toLowerCase().includes(query)),
      );
    }

    // Sort
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      // priority
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;
      return aPriority - bPriority;
    });

    return filtered;
  }, [issues, activeTab, statusFilter, priorityFilter, propertyFilter, tenantFilter, dateFrom, dateTo, sortBy, searchQuery]);

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    {
      key: 'needs_action',
      label: 'Needs Action',
      count: issues.filter(i => PM_ACTION_STATUSES.includes(i.status)).length,
    },
    {
      key: 'all_active',
      label: 'All Active',
      count: issues.filter(i => ACTIVE_STATUSES.includes(i.status)).length,
    },
    {
      key: 'resolved',
      label: 'Resolved by AI',
      count: issues.filter(i => i.status === 'resolved_by_agent').length,
    },
    {
      key: 'closed',
      label: 'Closed',
      count: issues.filter(i => i.status === 'closed').length,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 w-28 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
        {tabs.map(tab => (
          <button
            type="button"
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-teal-50 text-teal-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                activeTab === tab.key
                  ? 'bg-teal-100 text-teal-700'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1">
          <svg
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search issues..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm transition-colors placeholder:text-slate-400 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-100"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-100"
        >
          <option value="all">All Statuses</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-100"
        >
          <option value="all">All Priorities</option>
          {Object.entries(priorityLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortOption)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-100"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Showing
          {' '}
          {filteredAndSortedIssues.length}
          {' '}
          issue
          {filteredAndSortedIssues.length !== 1 ? 's' : ''}
        </span>
        {(statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter('all');
              setPriorityFilter('all');
              setSearchQuery('');
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Issue Cards Grid */}
      {filteredAndSortedIssues.length === 0
        ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
              <div className="rounded-full bg-slate-100 p-4">
                <svg className="size-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <p className="mt-4 font-medium text-slate-600">No issues found</p>
              <p className="mt-1 text-sm text-slate-400">
                {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Great work! No issues need attention right now.'}
              </p>
            </div>
          )
        : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedIssues.map(issue => (
                <PMIssueCard
                  key={issue.id}
                  issue={issue}
                  onAssign={onAssign}
                  onClose={onClose}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
          )}
    </div>
  );
}
