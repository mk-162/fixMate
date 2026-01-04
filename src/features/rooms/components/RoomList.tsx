'use client';

import { Bed, Plus } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Room } from '@/models/Schema';

import { createRoom, deleteRoom, getRoomsWithTenants, updateRoom } from '../actions/roomActions';
import type { RoomFormValues } from '../schemas/roomSchema';
import { RoomCard } from './RoomCard';
import { RoomForm } from './RoomForm';

type RoomWithTenant = Room & {
  tenant: {
    id: number;
    name: string;
    email: string | null;
    leaseEnd: Date | null;
  } | null;
};

type RoomListProps = {
  propertyId: number;
  initialRooms?: RoomWithTenant[];
};

export function RoomList({ propertyId, initialRooms }: RoomListProps) {
  const [rooms, setRooms] = useState<RoomWithTenant[]>(initialRooms ?? []);
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);

  const fetchRooms = async () => {
    try {
      const data = await getRoomsWithTenants(propertyId);
      setRooms(data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  useEffect(() => {
    if (!initialRooms || initialRooms.length === 0) {
      fetchRooms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const handleCreate = async (data: RoomFormValues) => {
    startTransition(async () => {
      try {
        await createRoom(propertyId, data);
        setShowAddModal(false);
        await fetchRooms();
      } catch (error) {
        console.error('Failed to create room:', error);
      }
    });
  };

  const handleUpdate = async (data: RoomFormValues) => {
    if (!editingRoom) {
      return;
    }
    startTransition(async () => {
      try {
        await updateRoom(editingRoom.id, data);
        setEditingRoom(null);
        await fetchRooms();
      } catch (error) {
        console.error('Failed to update room:', error);
      }
    });
  };

  const handleDelete = async () => {
    if (!deletingRoom) {
      return;
    }
    startTransition(async () => {
      try {
        await deleteRoom(deletingRoom.id);
        setDeletingRoom(null);
        await fetchRooms();
      } catch (error) {
        console.error('Failed to delete room:', error);
      }
    });
  };

  const occupiedCount = rooms.filter(r => r.status === 'occupied' || r.tenant).length;
  const availableCount = rooms.filter(r => r.status === 'available' && !r.tenant).length;
  const totalRent = rooms.reduce((sum, r) => sum + r.monthlyRent, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Rooms</h2>
          <p className="text-sm text-muted-foreground">
            {rooms.length}
            {' '}
            rooms
            {' '}
            ·
            {' '}
            {occupiedCount}
            {' '}
            occupied
            {' '}
            ·
            {' '}
            {availableCount}
            {' '}
            available
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 size-4" />
          Add Room
        </Button>
      </div>

      {/* Summary Card */}
      {rooms.length > 0 && (
        <div className="mb-4 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Total Monthly Income</div>
            <div className="text-xl font-bold text-foreground">
              £
              {totalRent.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Room Grid */}
      {rooms.length === 0
        ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
              <Bed className="mx-auto size-10 text-muted-foreground/50" />
              <p className="mt-3 font-medium text-foreground">No rooms yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add rooms to manage individual lettings
              </p>
              <Button className="mt-4" onClick={() => setShowAddModal(true)}>
                <Plus className="mr-2 size-4" />
                Add First Room
              </Button>
            </div>
          )
        : (
            <div className="grid gap-4 sm:grid-cols-2">
              {rooms.map(room => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onEdit={setEditingRoom}
                  onDelete={setDeletingRoom}
                />
              ))}
            </div>
          )}

      {/* Add Room Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Room</DialogTitle>
            <DialogDescription>
              Add a new lettable room to this property
            </DialogDescription>
          </DialogHeader>
          <RoomForm
            onSubmit={handleCreate}
            onCancel={() => setShowAddModal(false)}
            isLoading={isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Room Modal */}
      <Dialog open={!!editingRoom} onOpenChange={() => setEditingRoom(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>
              Update room details
            </DialogDescription>
          </DialogHeader>
          {editingRoom && (
            <RoomForm
              room={editingRoom}
              onSubmit={handleUpdate}
              onCancel={() => setEditingRoom(null)}
              isLoading={isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deletingRoom} onOpenChange={() => setDeletingRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;
              {deletingRoom?.roomName}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingRoom(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Deleting...' : 'Delete Room'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
