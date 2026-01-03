import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';

import type { PropertyStatus } from '../schemas/propertySchema';

type PropertyStatusBadgeProps = {
  status: PropertyStatus;
};

const variants: Record<PropertyStatus, 'default' | 'secondary'> = {
  available: 'default',
  occupied: 'secondary',
};

export function PropertyStatusBadge({ status }: PropertyStatusBadgeProps) {
  const t = useTranslations('Properties');

  return <Badge variant={variants[status]}>{t(`status.${status}`)}</Badge>;
}
