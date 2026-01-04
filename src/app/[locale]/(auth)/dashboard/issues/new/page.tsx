'use client';

import { Building2, Phone, PoundSterling, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { tradeLabels } from '@/features/contractors/schemas/contractorSchema';
import { TitleBar } from '@/features/dashboard/TitleBar';
import {
  type ContractorOption,
  getContractorsForSelect,
  getPropertiesForSelect,
  getTenantsForSelect,
  type PropertyOption,
  type TenantOption,
} from '@/features/issues/actions/issueFormActions';
import { FixmateAPI } from '@/libs/FixmateAPI';

const categories = [
  { value: 'appliance', label: 'Appliance Issue' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'heating', label: 'Heating / Hot Water' },
  { value: 'structural', label: 'Structural / Building' },
  { value: 'pest', label: 'Pest Control' },
  { value: 'other', label: 'Other' },
];

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export default function NewTeamIssuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data for dropdowns
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [contractors, setContractors] = useState<ContractorOption[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    propertyId: '',
    tenantId: '',
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
  });

  // Contractor selection
  const [selectedContractor, setSelectedContractor] = useState<ContractorOption | null>(null);

  // Load properties on mount
  useEffect(() => {
    async function loadProperties() {
      try {
        const props = await getPropertiesForSelect();
        setProperties(props);
      } catch (err) {
        console.error('Failed to load properties:', err);
      } finally {
        setLoadingData(false);
      }
    }
    loadProperties();
  }, []);

  // Load tenants when property changes
  useEffect(() => {
    async function loadTenants() {
      if (!formData.propertyId) {
        setTenants([]);
        setFormData(prev => ({ ...prev, tenantId: '' }));
        return;
      }
      try {
        const t = await getTenantsForSelect(Number(formData.propertyId));
        setTenants(t);
        // Clear tenant selection if not in new list
        if (!t.find(tenant => tenant.id.toString() === formData.tenantId)) {
          setFormData(prev => ({ ...prev, tenantId: '' }));
        }
      } catch (err) {
        console.error('Failed to load tenants:', err);
      }
    }
    loadTenants();
  }, [formData.propertyId]);

  // Load contractors when category changes
  useEffect(() => {
    async function loadContractors() {
      try {
        const c = await getContractorsForSelect(formData.category);
        setContractors(c);
        // Clear selection if contractor no longer in list
        if (selectedContractor && !c.find(con => con.id === selectedContractor.id)) {
          setSelectedContractor(null);
        }
      } catch (err) {
        console.error('Failed to load contractors:', err);
      }
    }
    loadContractors();
  }, [formData.category]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.propertyId) {
      setError('Please select a property');
      setLoading(false);
      return;
    }
    if (!formData.tenantId) {
      setError('Please select a tenant');
      setLoading(false);
      return;
    }
    if (!formData.title.trim()) {
      setError('Please enter a title');
      setLoading(false);
      return;
    }

    try {
      const result = await FixmateAPI.createIssue({
        tenant_id: Number(formData.tenantId),
        property_id: Number(formData.propertyId),
        title: formData.title,
        description: formData.description,
        category: formData.category,
        skip_agent: true,
        priority: formData.priority,
        assigned_to: selectedContractor
          ? selectedContractor.company
            ? `${selectedContractor.name} (${selectedContractor.company})`
            : selectedContractor.name
          : undefined,
      });

      router.push(`/dashboard/issues/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create issue');
      setLoading(false);
    }
  }

  const formatRate = (rateInPence: number | null) => {
    if (!rateInPence) {
      return null;
    }
    return `£${(rateInPence / 100).toFixed(0)}/hr`;
  };

  if (loadingData) {
    return (
      <>
        <TitleBar
          title="Log Team Issue"
          description="Create a new issue for a property and tenant"
        />
        <div className="mt-6 flex items-center justify-center py-12">
          <div className="size-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
        </div>
      </>
    );
  }

  return (
    <>
      <TitleBar
        title="Log Team Issue"
        description="Create a new issue for a property and tenant"
      />

      <div className="mt-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Property & Tenant Section */}
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-4 flex items-center gap-2 font-medium text-slate-900">
              <Building2 className="size-5 text-teal-600" />
              Property & Tenant
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Property Select */}
              <div className="space-y-2">
                <Label htmlFor="property">Property *</Label>
                {properties.length === 0
                  ? (
                      <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center">
                        <p className="text-sm text-slate-500">No properties found</p>
                        <Link
                          href="/dashboard/properties/new"
                          className="mt-2 inline-flex items-center gap-1 text-sm text-teal-600 hover:underline"
                        >
                          <UserPlus className="size-4" />
                          Add a property
                        </Link>
                      </div>
                    )
                  : (
                      <>
                        <Select
                          value={formData.propertyId}
                          onValueChange={value => setFormData({ ...formData, propertyId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a property" />
                          </SelectTrigger>
                          <SelectContent>
                            {properties.map(prop => (
                              <SelectItem key={prop.id} value={prop.id.toString()}>
                                {prop.name}
                                {prop.address && (
                                  <span className="ml-2 text-slate-400">
                                    -
                                    {' '}
                                    {prop.address}
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Link
                          href="/dashboard/properties/new"
                          className="inline-flex items-center gap-1 text-xs text-teal-600 hover:underline"
                        >
                          <UserPlus className="size-3" />
                          Add new property
                        </Link>
                      </>
                    )}
              </div>

              {/* Tenant Select */}
              <div className="space-y-2">
                <Label htmlFor="tenant">Tenant *</Label>
                {!formData.propertyId
                  ? (
                      <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center">
                        <p className="text-sm text-slate-500">Select a property first</p>
                      </div>
                    )
                  : tenants.length === 0
                    ? (
                        <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center">
                          <p className="text-sm text-slate-500">No tenants at this property</p>
                          <Link
                            href="/dashboard/tenants/new"
                            className="mt-2 inline-flex items-center gap-1 text-sm text-teal-600 hover:underline"
                          >
                            <UserPlus className="size-4" />
                            Add a tenant
                          </Link>
                        </div>
                      )
                    : (
                        <>
                          <Select
                            value={formData.tenantId}
                            onValueChange={value => setFormData({ ...formData, tenantId: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a tenant" />
                            </SelectTrigger>
                            <SelectContent>
                              {tenants.map(tenant => (
                                <SelectItem key={tenant.id} value={tenant.id.toString()}>
                                  {tenant.name}
                                  {tenant.email && (
                                    <span className="ml-2 text-slate-400">
                                      (
                                      {tenant.email}
                                      )
                                    </span>
                                  )}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Link
                            href="/dashboard/tenants/new"
                            className="inline-flex items-center gap-1 text-xs text-teal-600 hover:underline"
                          >
                            <UserPlus className="size-3" />
                            Add new tenant
                          </Link>
                        </>
                      )}
              </div>
            </div>
          </div>

          {/* Issue Details Section */}
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-4 font-medium text-slate-900">Issue Details</h3>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={value => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={value => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map(p => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Broken window in bedroom"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  placeholder="Provide details about the issue..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Contractor Assignment Section */}
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-4 font-medium text-slate-900">
              Assign Contractor
              <span className="ml-2 text-sm font-normal text-slate-500">(Optional)</span>
            </h3>

            {contractors.length === 0
              ? (
                  <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
                    <p className="text-sm text-slate-500">No contractors in your directory</p>
                    <Link
                      href="/dashboard/contractors"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-teal-600 hover:underline"
                    >
                      <UserPlus className="size-4" />
                      Add contractors
                    </Link>
                  </div>
                )
              : (
                  <>
                    <div className="grid max-h-64 gap-2 overflow-y-auto">
                      {contractors.map(contractor => (
                        <button
                          key={contractor.id}
                          type="button"
                          onClick={() =>
                            setSelectedContractor(
                              selectedContractor?.id === contractor.id ? null : contractor,
                            )}
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
                                {tradeLabels[contractor.trade as keyof typeof tradeLabels]
                                || contractor.trade}
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
                    <Link
                      href="/dashboard/contractors"
                      className="mt-3 inline-flex items-center gap-1 text-xs text-teal-600 hover:underline"
                    >
                      <UserPlus className="size-3" />
                      Add new contractor
                    </Link>
                  </>
                )}
          </div>

          {/* Tenant Communications Placeholder */}
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
            <h3 className="mb-2 font-medium text-slate-700">Tenant Communications</h3>
            <p className="text-sm text-slate-500">
              Coming soon: Send messages to tenants, log phone calls, and track all communications
              related to this issue.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700">
              {loading ? 'Creating...' : 'Create Issue'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
