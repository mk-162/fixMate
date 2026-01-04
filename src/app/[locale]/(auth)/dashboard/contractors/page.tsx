'use client';

import {
  HardHat,
  Mail,
  Pencil,
  Phone,
  Plus,
  PoundSterling,
  Trash2,
  Wrench,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createContractor,
  deleteContractor,
  getContractors,
  updateContractor,
} from '@/features/contractors/actions/contractorActions';
import {
  type ContractorTrade,
  contractorTrades,
  tradeLabels,
} from '@/features/contractors/schemas/contractorSchema';
import { TitleBar } from '@/features/dashboard/TitleBar';
import type { Contractor } from '@/models/Schema';

// Trade badge colors
const tradeColors: Record<ContractorTrade, string> = {
  plumbing: 'bg-blue-100 text-blue-700',
  electrical: 'bg-yellow-100 text-yellow-700',
  heating: 'bg-orange-100 text-orange-700',
  appliance: 'bg-purple-100 text-purple-700',
  locksmith: 'bg-gray-100 text-gray-700',
  carpentry: 'bg-amber-100 text-amber-700',
  roofing: 'bg-red-100 text-red-700',
  glazing: 'bg-cyan-100 text-cyan-700',
  cleaning: 'bg-green-100 text-green-700',
  gardening: 'bg-emerald-100 text-emerald-700',
  pest_control: 'bg-rose-100 text-rose-700',
  general: 'bg-slate-100 text-slate-700',
  other: 'bg-neutral-100 text-neutral-700',
};

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Contractor | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formTrade, setFormTrade] = useState<ContractorTrade>('general');
  const [formHourlyRate, setFormHourlyRate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchContractors = async () => {
    try {
      const result = await getContractors();
      setContractors(result.data);
    } catch (error) {
      console.error('Failed to load contractors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, []);

  const resetForm = () => {
    setFormName('');
    setFormCompany('');
    setFormEmail('');
    setFormPhone('');
    setFormTrade('general');
    setFormHourlyRate('');
    setFormNotes('');
  };

  const handleAdd = async () => {
    if (!formName.trim()) {
      return;
    }
    setFormLoading(true);
    try {
      await createContractor({
        name: formName.trim(),
        company: formCompany.trim() || undefined,
        email: formEmail.trim() || undefined,
        phone: formPhone.trim() || undefined,
        trade: formTrade,
        hourlyRate: formHourlyRate ? Number.parseInt(formHourlyRate, 10) * 100 : undefined, // Convert to pence
        notes: formNotes.trim() || undefined,
        isActive: 1,
      });
      setShowAddModal(false);
      resetForm();
      fetchContractors();
    } catch (error) {
      console.error('Failed to create contractor:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingContractor || !formName.trim()) {
      return;
    }
    setFormLoading(true);
    try {
      await updateContractor(editingContractor.id, {
        name: formName.trim(),
        company: formCompany.trim() || undefined,
        email: formEmail.trim() || undefined,
        phone: formPhone.trim() || undefined,
        trade: formTrade,
        hourlyRate: formHourlyRate ? Number.parseInt(formHourlyRate, 10) * 100 : undefined,
        notes: formNotes.trim() || undefined,
      });
      setEditingContractor(null);
      resetForm();
      fetchContractors();
    } catch (error) {
      console.error('Failed to update contractor:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      return;
    }
    setFormLoading(true);
    try {
      await deleteContractor(deleteConfirm.id);
      setDeleteConfirm(null);
      fetchContractors();
    } catch (error) {
      console.error('Failed to delete contractor:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (contractor: Contractor) => {
    setFormName(contractor.name);
    setFormCompany(contractor.company || '');
    setFormEmail(contractor.email || '');
    setFormPhone(contractor.phone || '');
    setFormTrade(contractor.trade as ContractorTrade);
    setFormHourlyRate(contractor.hourlyRate ? String(contractor.hourlyRate / 100) : '');
    setFormNotes(contractor.notes || '');
    setEditingContractor(contractor);
  };

  const formatRate = (rateInPence: number | null) => {
    if (!rateInPence) {
      return null;
    }
    return `£${(rateInPence / 100).toFixed(0)}/hr`;
  };

  return (
    <>
      <TitleBar
        title="Contractors"
        description="Manage your tradespeople directory"
        action={(
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 size-4" />
            Add Contractor
          </Button>
        )}
      />

      {loading
        ? (
            <div className="flex items-center justify-center py-12">
              <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )
        : contractors.length === 0
          ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <HardHat className="mx-auto size-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg font-medium text-foreground">No contractors yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add tradespeople to assign them to maintenance issues
                </p>
                <Button className="mt-6" onClick={() => setShowAddModal(true)}>
                  <Plus className="mr-2 size-4" />
                  Add Contractor
                </Button>
              </div>
            )
          : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {contractors.map(contractor => (
                  <div
                    key={contractor.id}
                    className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                          <Wrench className="size-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{contractor.name}</h3>
                          {contractor.company && (
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {contractor.company}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => openEditModal(contractor)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteConfirm(contractor)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Trade badge */}
                    <div className="mt-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tradeColors[contractor.trade as ContractorTrade] || tradeColors.other}`}>
                        {tradeLabels[contractor.trade as ContractorTrade] || contractor.trade}
                      </span>
                    </div>

                    {/* Contact info */}
                    <div className="mt-4 space-y-2 text-sm">
                      {contractor.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="size-3.5" />
                          <a href={`tel:${contractor.phone}`} className="hover:text-foreground">
                            {contractor.phone}
                          </a>
                        </div>
                      )}
                      {contractor.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="size-3.5" />
                          <a href={`mailto:${contractor.email}`} className="hover:text-foreground">
                            {contractor.email}
                          </a>
                        </div>
                      )}
                      {contractor.hourlyRate && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <PoundSterling className="size-3.5" />
                          {formatRate(contractor.hourlyRate)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

      {/* Add Modal */}
      <Dialog
        open={showAddModal}
        onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Contractor</DialogTitle>
            <DialogDescription>
              Add a new tradesperson to your directory
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., John Smith"
                value={formName}
                onChange={e => setFormName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="e.g., ABC Plumbing Ltd"
                value={formCompany}
                onChange={e => setFormCompany(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="trade">Trade *</Label>
              <Select value={formTrade} onValueChange={v => setFormTrade(v as ContractorTrade)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trade" />
                </SelectTrigger>
                <SelectContent>
                  {contractorTrades.map(trade => (
                    <SelectItem key={trade} value={trade}>
                      {tradeLabels[trade]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="07700 900000"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hourlyRate">Hourly Rate (£)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  placeholder="45"
                  value={formHourlyRate}
                  onChange={e => setFormHourlyRate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Any additional notes..."
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!formName.trim() || formLoading}>
              {formLoading ? 'Adding...' : 'Add Contractor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog
        open={!!editingContractor}
        onOpenChange={(open) => {
          if (!open) {
            setEditingContractor(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Contractor</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={e => setFormName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-company">Company</Label>
              <Input
                id="edit-company"
                value={formCompany}
                onChange={e => setFormCompany(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-trade">Trade *</Label>
              <Select value={formTrade} onValueChange={v => setFormTrade(v as ContractorTrade)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contractorTrades.map(trade => (
                    <SelectItem key={trade} value={trade}>
                      {tradeLabels[trade]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-hourlyRate">Hourly Rate (£)</Label>
                <Input
                  id="edit-hourlyRate"
                  type="number"
                  value={formHourlyRate}
                  onChange={e => setFormHourlyRate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Input
                id="edit-notes"
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingContractor(null)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={!formName.trim() || formLoading}>
              {formLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contractor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;
              {deleteConfirm?.name}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={formLoading}>
              {formLoading ? 'Deleting...' : 'Delete Contractor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
