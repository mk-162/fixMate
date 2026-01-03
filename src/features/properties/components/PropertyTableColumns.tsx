'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Property } from '@/models/Schema';

import { PropertyStatusBadge } from './PropertyStatusBadge';

export function usePropertyColumns(
  onDelete: (id: number) => void,
): ColumnDef<Property>[] {
  const t = useTranslations('Properties');

  return [
    {
      accessorKey: 'name',
      header: t('table.name'),
    },
    {
      accessorKey: 'address',
      header: t('table.address'),
    },
    {
      accessorKey: 'totalRooms',
      header: t('table.totalRooms'),
    },
    {
      accessorKey: 'monthlyRent',
      header: t('table.monthlyRent'),
      cell: ({ row }) => {
        const amount = row.getValue('monthlyRent') as number;
        return new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency: 'GBP',
        }).format(amount);
      },
    },
    {
      accessorKey: 'status',
      header: t('table.status'),
      cell: ({ row }) => (
        <PropertyStatusBadge status={row.getValue('status')} />
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const property = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/properties/${property.id}`}>
                  <Eye className="mr-2 size-4" />
                  {t('actions.view')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/properties/${property.id}/edit`}>
                  <Pencil className="mr-2 size-4" />
                  {t('actions.edit')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(property.id)}
              >
                <Trash2 className="mr-2 size-4" />
                {t('actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
