'use client';

import { zodResolver } from '@hookform/resolvers/zod';
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
import type { Property, Room, Tenant } from '@/models/Schema';

import {
  depositSchemeOptions,
  tenantFormSchema,
  type TenantFormValues,
} from '../schemas/tenantSchema';

type TenantFormProps = {
  tenant?: Tenant;
  properties: Property[];
  rooms: Room[];
  onSubmit: (data: TenantFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
};

// Helper to format date for input
function formatDateForInput(date: Date | null | undefined): string {
  if (!date) {
    return '';
  }
  return new Date(date).toISOString().split('T')[0] ?? '';
}

export function TenantForm({
  tenant,
  properties,
  rooms,
  onSubmit,
  onCancel,
  isLoading,
}: TenantFormProps) {
  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: tenant?.name ?? '',
      email: tenant?.email ?? '',
      phone: tenant?.phone ?? '',
      propertyId: tenant?.propertyId ?? null,
      roomId: tenant?.roomId ?? null,
      leaseStart: tenant?.leaseStart ?? null,
      leaseEnd: tenant?.leaseEnd ?? null,
      rentAmount: tenant?.rentAmount ?? null,
      depositAmount: tenant?.depositAmount ?? null,
      depositScheme: (tenant?.depositScheme as typeof depositSchemeOptions[number]) ?? null,
      depositReference: tenant?.depositReference ?? '',
      emergencyContactName: tenant?.emergencyContactName ?? '',
      emergencyContactPhone: tenant?.emergencyContactPhone ?? '',
      emergencyContactRelation: tenant?.emergencyContactRelation ?? '',
      guarantorName: tenant?.guarantorName ?? '',
      guarantorEmail: tenant?.guarantorEmail ?? '',
      guarantorPhone: tenant?.guarantorPhone ?? '',
      guarantorAddress: tenant?.guarantorAddress ?? '',
      university: tenant?.university ?? '',
      course: tenant?.course ?? '',
      yearOfStudy: tenant?.yearOfStudy ?? null,
      notes: tenant?.notes ?? '',
    },
  });

  const selectedPropertyId = form.watch('propertyId');
  const availableRooms = rooms.filter(r => r.propertyId === selectedPropertyId);

  const handleSubmit = async (data: TenantFormValues) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="rounded-lg border bg-white p-4">
          <h3 className="mb-4 font-semibold">Basic Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="07123 456789" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Property & Room Assignment */}
        <div className="rounded-lg border bg-white p-4">
          <h3 className="mb-4 font-semibold">Property & Room</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property</FormLabel>
                  <Select
                    onValueChange={val => field.onChange(val ? Number(val) : null)}
                    value={field.value?.toString() ?? ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {properties.map(prop => (
                        <SelectItem key={prop.id} value={prop.id.toString()}>
                          {prop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room</FormLabel>
                  <Select
                    onValueChange={val => field.onChange(val ? Number(val) : null)}
                    value={field.value?.toString() ?? ''}
                    disabled={!selectedPropertyId || availableRooms.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !selectedPropertyId
                            ? 'Select property first'
                            : availableRooms.length === 0
                              ? 'No rooms available'
                              : 'Select room'
                        }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRooms.map(room => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          {room.roomName}
                          {' '}
                          - £
                          {room.monthlyRent}
                          /mo
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Lease Details */}
        <div className="rounded-lg border bg-white p-4">
          <h3 className="mb-4 font-semibold">Lease Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="leaseStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lease Start</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={formatDateForInput(field.value)}
                      onChange={e => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="leaseEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lease End</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={formatDateForInput(field.value)}
                      onChange={e => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Rent (GBP)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      value={field.value ?? ''}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="depositAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deposit (GBP)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      value={field.value ?? ''}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="depositScheme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deposit Scheme</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select scheme" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {depositSchemeOptions.map(scheme => (
                        <SelectItem key={scheme} value={scheme}>
                          {scheme}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="depositReference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deposit Reference</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. DPS123456" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Student Information */}
        <div className="rounded-lg border bg-white p-4">
          <h3 className="mb-4 font-semibold">Student Information</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="university"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>University</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. University of Manchester" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Computer Science" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="yearOfStudy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year of Study</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      placeholder="1"
                      value={field.value ?? ''}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="rounded-lg border bg-white p-4">
          <h3 className="mb-4 font-semibold">Emergency Contact</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="emergencyContactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Parent/Guardian name" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergencyContactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="07123 456789" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergencyContactRelation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relation</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Mother, Father" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Guarantor */}
        <div className="rounded-lg border bg-white p-4">
          <h3 className="mb-4 font-semibold">Guarantor</h3>
          <FormDescription className="mb-4">
            Required for student tenants
          </FormDescription>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="guarantorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Guarantor full name" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guarantorEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="guarantor@example.com" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guarantorPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="07123 456789" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guarantorAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Full address" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-lg border bg-white p-4">
          <h3 className="mb-4 font-semibold">Notes</h3>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Any additional notes about this tenant..."
                    rows={4}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : tenant ? 'Update Tenant' : 'Add Tenant'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
