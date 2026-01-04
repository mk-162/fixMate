'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  councilTaxBandOptions,
  epcRatingOptions,
  heatingTypeOptions,
  propertyFormSchema,
  type PropertyFormValues,
  propertyStatusOptions,
  propertyTypeOptions,
} from '../schemas/propertySchema';

type PropertyFormProps = {
  property?: Property;
  mode: 'create' | 'edit';
};

// Helper to format date for input
function formatDateForInput(date: Date | null | undefined): string {
  if (!date) {
    return '';
  }
  return new Date(date).toISOString().split('T')[0] ?? '';
}

export function PropertyForm({ property, mode }: PropertyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      name: property?.name ?? '',
      address: property?.address ?? '',
      propertyType: property?.propertyType ?? 'hmo',
      totalRooms: property?.totalRooms ?? 1,
      monthlyRent: property?.monthlyRent ?? 0,
      status: property?.status ?? 'available',
      licenseNumber: property?.licenseNumber ?? '',
      licenseExpiry: property?.licenseExpiry ?? null,
      epcRating: property?.epcRating ?? null,
      epcExpiry: property?.epcExpiry ?? null,
      gasCertExpiry: property?.gasCertExpiry ?? null,
      electricalCertExpiry: property?.electricalCertExpiry ?? null,
      councilTaxBand: property?.councilTaxBand ?? null,
      heatingType: property?.heatingType ?? null,
      furnished: property?.furnished ?? 1,
      hasParking: property?.hasParking ?? 0,
      hasGarden: property?.hasGarden ?? 0,
      wifiIncluded: property?.wifiIncluded ?? 0,
      billsIncluded: property?.billsIncluded ?? 0,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information Section */}
        <div className="rounded-lg border bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold">Basic Information</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 42 Oak Street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Address *</FormLabel>
                  <FormControl>
                    <Input placeholder="Full address including postcode" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {propertyTypeOptions.map(type => (
                          <SelectItem key={type} value={type}>
                            {type === 'hmo' ? 'HMO' : type === 'single_let' ? 'Single Let' : 'Studio'}
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
                name="totalRooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Rooms *</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {propertyStatusOptions.map(status => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="monthlyRent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Monthly Rent (GBP) *</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormDescription>
                      Combined rent from all rooms
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="councilTaxBand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Council Tax Band</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select band" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {councilTaxBandOptions.map(band => (
                          <SelectItem key={band} value={band}>
                            Band
                            {' '}
                            {band}
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
        </div>

        {/* Compliance & Certificates Section */}
        <div className="rounded-lg border bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold">Compliance & Certificates</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HMO License Number</FormLabel>
                    <FormControl>
                      <Input placeholder="License number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="licenseExpiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Expiry Date</FormLabel>
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
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="epcRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>EPC Rating</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {epcRatingOptions.map(rating => (
                          <SelectItem key={rating} value={rating}>
                            {rating}
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
                name="epcExpiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>EPC Expiry Date</FormLabel>
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
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="gasCertExpiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gas Safety Certificate Expiry</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={formatDateForInput(field.value)}
                        onChange={e => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormDescription>Annual renewal required</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="electricalCertExpiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>EICR Expiry Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={formatDateForInput(field.value)}
                        onChange={e => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormDescription>Electrical Installation Condition Report</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Property Features Section */}
        <div className="rounded-lg border bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold">Property Features</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="heatingType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heating Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value ?? undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full md:w-1/2">
                        <SelectValue placeholder="Select heating type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {heatingTypeOptions.map(type => (
                        <SelectItem key={type} value={type}>
                          {type === 'heat_pump' ? 'Heat Pump' : type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <FormField
                control={form.control}
                name="furnished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value === 1}
                        onCheckedChange={(checked: boolean) => field.onChange(checked ? 1 : 0)}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Furnished</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasParking"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value === 1}
                        onCheckedChange={(checked: boolean) => field.onChange(checked ? 1 : 0)}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Parking</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasGarden"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value === 1}
                        onCheckedChange={(checked: boolean) => field.onChange(checked ? 1 : 0)}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Garden</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="wifiIncluded"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value === 1}
                        onCheckedChange={(checked: boolean) => field.onChange(checked ? 1 : 0)}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>WiFi Incl.</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billsIncluded"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value === 1}
                        onCheckedChange={(checked: boolean) => field.onChange(checked ? 1 : 0)}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Bills Incl.</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="rounded-lg border bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold">Additional Information</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>Link to property photo</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes about the property..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending
              ? 'Saving...'
              : mode === 'create'
                ? 'Create Property'
                : 'Update Property'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
