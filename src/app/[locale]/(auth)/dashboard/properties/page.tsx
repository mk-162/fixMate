'use client';

import { useOrganization } from '@clerk/nextjs';
import { Building2, Home, MapPin, Pencil, Plus, Trash2, Users } from 'lucide-react';
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
import { TitleBar } from '@/features/dashboard/TitleBar';
import { FixmateAPI, type Property } from '@/libs/FixmateAPI';

export default function PropertiesPage() {
  const { organization } = useOrganization();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Property | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const orgId = organization?.id;

  const fetchProperties = async () => {
    if (!orgId) {
      return;
    }
    try {
      const data = await FixmateAPI.listProperties(orgId);
      setProperties(data);
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [orgId]);

  const handleAdd = async () => {
    if (!orgId || !formName.trim()) {
      return;
    }
    setFormLoading(true);
    try {
      await FixmateAPI.createProperty({
        name: formName.trim(),
        address: formAddress.trim() || undefined,
      }, orgId);
      setShowAddModal(false);
      setFormName('');
      setFormAddress('');
      fetchProperties();
    } catch (error) {
      console.error('Failed to create property:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!orgId || !editingProperty || !formName.trim()) {
      return;
    }
    setFormLoading(true);
    try {
      await FixmateAPI.updateProperty(editingProperty.id, {
        name: formName.trim(),
        address: formAddress.trim() || undefined,
      }, orgId);
      setEditingProperty(null);
      setFormName('');
      setFormAddress('');
      fetchProperties();
    } catch (error) {
      console.error('Failed to update property:', error);
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
      await FixmateAPI.deleteProperty(deleteConfirm.id, orgId);
      setDeleteConfirm(null);
      fetchProperties();
    } catch (error) {
      console.error('Failed to delete property:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (property: Property) => {
    setFormName(property.name);
    setFormAddress(property.address || '');
    setEditingProperty(property);
  };

  return (
    <>
      <TitleBar
        title="Properties"
        description="Manage your rental properties"
        action={(
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 size-4" />
            Add Property
          </Button>
        )}
      />

      {loading
        ? (
            <div className="flex items-center justify-center py-12">
              <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )
        : properties.length === 0
          ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <Building2 className="mx-auto size-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg font-medium text-foreground">No properties yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add your first property to start managing tenants
                </p>
                <Button className="mt-6" onClick={() => setShowAddModal(true)}>
                  <Plus className="mr-2 size-4" />
                  Add Property
                </Button>
              </div>
            )
          : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map(property => (
                  <div
                    key={property.id}
                    className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                          <Home className="size-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{property.name}</h3>
                          {property.address && (
                            <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="size-3" />
                              {property.address}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => openEditModal(property)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteConfirm(property)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="size-4" />
                        {property.tenant_count}
                        {' '}
                        tenant
                        {property.tenant_count !== 1 ? 's' : ''}
                      </div>
                      {property.active_issue_count > 0 && (
                        <div className="flex items-center gap-1.5 text-amber-600">
                          <span className="size-2 rounded-full bg-amber-500" />
                          {property.active_issue_count}
                          {' '}
                          active issue
                          {property.active_issue_count !== 1 ? 's' : ''}
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
            <DialogTitle>Add Property</DialogTitle>
            <DialogDescription>
              Add a new rental property to your portfolio
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Property Name *</Label>
              <Input
                id="name"
                placeholder="e.g., 123 Oak Street"
                value={formName}
                onChange={e => setFormName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Full address"
                value={formAddress}
                onChange={e => setFormAddress(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!formName.trim() || formLoading}>
              {formLoading ? 'Adding...' : 'Add Property'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingProperty} onOpenChange={() => setEditingProperty(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Property Name *</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={e => setFormName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formAddress}
                onChange={e => setFormAddress(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProperty(null)}>
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
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;
              {deleteConfirm?.name}
              &quot;? This will also remove all associated tenants and issues.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={formLoading}>
              {formLoading ? 'Deleting...' : 'Delete Property'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
