'use client';

import { useOrganization } from '@clerk/nextjs';
import { Mail, Pencil, Phone, Plus, Trash2, User, Users } from 'lucide-react';
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
import { TitleBar } from '@/features/dashboard/TitleBar';
import { FixmateAPI, type Property, type Tenant } from '@/libs/FixmateAPI';

export default function TenantsPage() {
  const { organization } = useOrganization();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Tenant | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPropertyId, setFormPropertyId] = useState<string>('');
  const [formLoading, setFormLoading] = useState(false);

  const orgId = organization?.id;

  const fetchData = async () => {
    if (!orgId) {
      return;
    }
    try {
      const [tenantsData, propertiesData] = await Promise.all([
        FixmateAPI.listTenants(orgId),
        FixmateAPI.listProperties(orgId),
      ]);
      setTenants(tenantsData);
      setProperties(propertiesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orgId]);

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormPropertyId('');
  };

  const handleAdd = async () => {
    if (!orgId || !formName.trim()) {
      return;
    }
    setFormLoading(true);
    try {
      await FixmateAPI.createTenant({
        name: formName.trim(),
        email: formEmail.trim() || undefined,
        phone: formPhone.trim() || undefined,
        property_id: formPropertyId ? Number.parseInt(formPropertyId, 10) : undefined,
      }, orgId);
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Failed to create tenant:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!orgId || !editingTenant || !formName.trim()) {
      return;
    }
    setFormLoading(true);
    try {
      await FixmateAPI.updateTenant(editingTenant.id, {
        name: formName.trim(),
        email: formEmail.trim() || undefined,
        phone: formPhone.trim() || undefined,
        property_id: formPropertyId ? Number.parseInt(formPropertyId, 10) : undefined,
      }, orgId);
      setEditingTenant(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Failed to update tenant:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!orgId || !deleteConfirm) {
      return;
    }
    setFormLoading(true);
    try {
      await FixmateAPI.deleteTenant(deleteConfirm.id, orgId);
      setDeleteConfirm(null);
      fetchData();
    } catch (error) {
      console.error('Failed to delete tenant:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (tenant: Tenant) => {
    setFormName(tenant.name);
    setFormEmail(tenant.email || '');
    setFormPhone(tenant.phone || '');
    setFormPropertyId(tenant.property_id?.toString() || '');
    setEditingTenant(tenant);
  };

  return (
    <>
      <TitleBar
        title="Tenants"
        description="Manage your tenant contacts"
        action={(
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 size-4" />
            Add Tenant
          </Button>
        )}
      />

      {loading
        ? (
            <div className="flex items-center justify-center py-12">
              <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )
        : tenants.length === 0
          ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <Users className="mx-auto size-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg font-medium text-foreground">No tenants yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add tenants to link them to properties and WhatsApp
                </p>
                <Button className="mt-6" onClick={() => setShowAddModal(true)}>
                  <Plus className="mr-2 size-4" />
                  Add Tenant
                </Button>
              </div>
            )
          : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tenants.map(tenant => (
                  <div
                    key={tenant.id}
                    className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-600">
                          <User className="size-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{tenant.name}</h3>
                          {tenant.property_name && (
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {tenant.property_name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => openEditModal(tenant)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteConfirm(tenant)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                      {tenant.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="size-3.5" />
                          {tenant.phone}
                        </div>
                      )}
                      {tenant.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="size-3.5" />
                          {tenant.email}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tenant</DialogTitle>
            <DialogDescription>
              Add a new tenant to receive WhatsApp support
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Full name"
                value={formName}
                onChange={e => setFormName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g., 07123456789"
                value={formPhone}
                onChange={e => setFormPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Will be auto-formatted to international format
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="property">Property</Label>
              <Select value={formPropertyId} onValueChange={setFormPropertyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map(prop => (
                    <SelectItem key={prop.id} value={prop.id.toString()}>
                      {prop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!formName.trim() || formLoading}>
              {formLoading ? 'Adding...' : 'Add Tenant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingTenant} onOpenChange={() => setEditingTenant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
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
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={formPhone}
                onChange={e => setFormPhone(e.target.value)}
              />
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
              <Label htmlFor="edit-property">Property</Label>
              <Select value={formPropertyId} onValueChange={setFormPropertyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map(prop => (
                    <SelectItem key={prop.id} value={prop.id.toString()}>
                      {prop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTenant(null)}>
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
            <DialogTitle>Remove Tenant</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove &quot;
              {deleteConfirm?.name}
              &quot;? Their issue history will be preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={formLoading}>
              {formLoading ? 'Removing...' : 'Remove Tenant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
