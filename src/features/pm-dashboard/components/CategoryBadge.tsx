import {
  Bug,
  Flame,
  Hammer,
  Lightbulb,
  Lock,
  Pipette,
  Refrigerator,
  Sparkles,
  Thermometer,
  TreeDeciduous,
  Wrench,
} from 'lucide-react';

import { categoryConfig } from '../constants';

type CategoryBadgeProps = {
  category: string | null;
  showLabel?: boolean;
  size?: 'sm' | 'md';
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  plumbing: Pipette,
  electrical: Lightbulb,
  appliance: Refrigerator,
  heating: Flame,
  hvac: Thermometer,
  structural: Hammer,
  pest: Bug,
  cleaning: Sparkles,
  security: Lock,
  exterior: TreeDeciduous,
  general: Wrench,
};

export function CategoryBadge({ category, showLabel = true, size = 'sm' }: CategoryBadgeProps) {
  if (!category) {
    return null;
  }

  const normalizedCategory = category.toLowerCase();
  const config = categoryConfig[normalizedCategory] ?? categoryConfig.general;
  const Icon = categoryIcons[normalizedCategory] ?? categoryIcons.general;

  if (!config || !Icon) {
    return null;
  }

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs gap-1'
    : 'px-2.5 py-1 text-sm gap-1.5';

  const iconSize = size === 'sm' ? 'size-3' : 'size-4';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.bgColor} ${config.color} ${sizeClasses}`}
    >
      <Icon className={iconSize} />
      {showLabel && <span>{config.label || category}</span>}
    </span>
  );
}
