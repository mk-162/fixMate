'use client';

import {
  Bath,
  Bed,
  Calendar,
  Pencil,
  Ruler,
  Trash2,
  User,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Room } from '@/models/Schema';

type RoomCardProps = {
  room: Room & {
    tenant: {
      id: number;
      name: string;
      email: string;
      leaseEnd: Date | null;
    } | null;
  };
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
};

const statusColors: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  occupied: 'bg-blue-100 text-blue-700',
  maintenance: 'bg-amber-100 text-amber-700',
};

const floorLabels: Record<number, string> = {
  '-1': 'Basement',
  '0': 'Ground',
  '1': '1st Floor',
  '2': '2nd Floor',
  '3': '3rd Floor',
  '4': 'Attic',
};

export function RoomCard({ room, onEdit, onDelete }: RoomCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) {
      return null;
    }
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Bed className="size-5" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{room.roomName}</h4>
            <p className="text-sm text-muted-foreground">
              {floorLabels[room.floor ?? 0] ?? `Floor ${room.floor}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[room.status] || ''} variant="secondary">
            {room.status}
          </Badge>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => onEdit(room)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(room)}
              disabled={!!room.tenant}
              title={room.tenant ? 'Unassign tenant first' : 'Delete room'}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Room Details */}
      <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {formatCurrency(room.monthlyRent)}
          /mo
        </span>
        {room.sizeSqm && (
          <span className="flex items-center gap-1">
            <Ruler className="size-3.5" />
            {room.sizeSqm}
            m&sup2;
          </span>
        )}
        {room.hasEnsuite === 1 && (
          <span className="flex items-center gap-1">
            <Bath className="size-3.5" />
            Ensuite
          </span>
        )}
        {room.furnished === 1 && (
          <span>Furnished</span>
        )}
      </div>

      {/* Tenant Info */}
      {room.tenant
        ? (
            <div className="mt-3 rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <span className="font-medium">{room.tenant.name}</span>
              </div>
              {room.tenant.leaseEnd && (
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="size-3.5" />
                  Lease ends:
                  {' '}
                  {formatDate(room.tenant.leaseEnd)}
                </div>
              )}
            </div>
          )
        : (
            <div className="mt-3 rounded-lg border border-dashed border-green-300 bg-green-50 p-3 text-center text-sm text-green-700">
              Available to let
            </div>
          )}

      {/* Notes */}
      {room.notes && (
        <p className="mt-3 text-sm text-muted-foreground">{room.notes}</p>
      )}
    </div>
  );
}
