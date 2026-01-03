'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TitleBar } from '@/features/dashboard/TitleBar';
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

export default function NewIssuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'appliance',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // For MVP, use hardcoded tenant_id and property_id
      // In production, these would come from the authenticated user
      const result = await FixmateAPI.createIssue({
        tenant_id: 1,
        property_id: 1,
        title: formData.title,
        description: formData.description,
        category: formData.category,
      });

      // Redirect to the issue detail page
      router.push(`/dashboard/issues/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create issue');
      setLoading(false);
    }
  }

  return (
    <>
      <TitleBar
        title="Report New Issue"
        description="Describe your maintenance issue and our AI assistant will help"
      />

      <div className="mt-6 max-w-2xl">
        <div className="rounded-lg bg-white p-6 shadow">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="title">What's the issue? (Brief summary)</Label>
              <Input
                id="title"
                placeholder="e.g., Washing machine not working"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="description">Describe the problem in detail</Label>
              <textarea
                id="description"
                placeholder="Please describe what's happening, when it started, and any error messages or sounds you've noticed..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                required
                rows={5}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                <strong>What happens next:</strong>
                {' '}
                Our AI assistant will review your issue
                and may ask some questions to help troubleshoot. Many issues can be resolved
                with simple fixes - saving you time waiting for a tradesperson!
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Issue'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
