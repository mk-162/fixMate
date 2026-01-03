'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Property } from '@/models/Schema';

import { createProperty, updateProperty } from '../actions/propertyActions';
import {
  propertyFormSchema,
  type PropertyFormValues,
  propertyStatusOptions,
} from '../schemas/propertySchema';

type PropertyFormProps = {
  property?: Property;
  mode: 'create' | 'edit';
};

export function PropertyForm({ property, mode }: PropertyFormProps) {
  const t = useTranslations('Properties');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      name: property?.name ?? '',
      address: property?.address ?? '',
      totalRooms: property?.totalRooms ?? 1,
      monthlyRent: property?.monthlyRent ?? 0,
      status: property?.status ?? 'available',
      notes: property?.notes ?? '',
      imageUrl: property?.imageUrl ?? '',
    },
  });

  async function onSubmit(data: PropertyFormValues) {
    startTransition(async () => {
      try {
        if (mode === 'create') {
          await createProperty(data);
        } else if (property) {
          await updateProperty(property.id, data);
        }
        router.push('/dashboard/properties');
      } catch (error) {
        console.error('Failed to save property:', error);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.name.label')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.name.placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address Field */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.address.label')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.address.placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Total Rooms and Monthly Rent in a grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="totalRooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.totalRooms.label')}</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monthlyRent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.monthlyRent.label')}</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormDescription>
                  {t('form.monthlyRent.description')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Status Select */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.status.label')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.status.placeholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {propertyStatusOptions.map(status => (
                    <SelectItem key={status} value={status}>
                      {t(`status.${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image URL (Optional) */}
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.imageUrl.label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('form.imageUrl.placeholder')}
                  {...field}
                />
              </FormControl>
              <FormDescription>{t('form.imageUrl.description')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes (Optional) */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.notes.label')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('form.notes.placeholder')}
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending
              ? t('form.submitting')
              : mode === 'create'
                ? t('form.create')
                : t('form.update')}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t('form.cancel')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
