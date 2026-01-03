'use client';

import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DataTable } from '@/components/ui/data-table';
import type { Property } from '@/models/Schema';

import { deleteProperty } from '../actions/propertyActions';
import { usePropertyColumns } from './PropertyTableColumns';

type PropertyTableProps = {
  properties: Property[];
};

export function PropertyTable({ properties }: PropertyTableProps) {
  const t = useTranslations('Properties');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId === null) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteProperty(deleteId);
      } catch (error) {
        console.error('Failed to delete property:', error);
      } finally {
        setDeleteId(null);
      }
    });
  };

  const columns = usePropertyColumns(handleDelete);

  return (
    <>
      <DataTable columns={columns} data={properties} />

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('delete.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              {t('delete.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
