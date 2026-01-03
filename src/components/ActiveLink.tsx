'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/utils/Helpers';

export const ActiveLink = (props: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const pathname = usePathname();
  const isActive = pathname === props.href || pathname.endsWith(props.href);

  return (
    <Link
      href={props.href}
      className={cn(props.className, isActive && 'active')}
    >
      {props.children}
    </Link>
  );
};
