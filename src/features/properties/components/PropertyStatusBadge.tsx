import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';

import type { PropertyStatus } from '../schemas/propertySchema';

type PropertyStatusBadgeProps = {
  status: PropertyStatus;
};

const statusStyles: Record<PropertyStatus, string> = {
  available: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  occupied: 'border border-primary/20 bg-primary/10 text-primary',
};

export function PropertyStatusBadge({ status }: PropertyStatusBadgeProps) {
  const t = useTranslations('Properties');

  return (
    <Badge className={statusStyles[status]}>
      {t(`status.${status}`)}
    </Badge>
  );
}
