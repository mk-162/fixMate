'use client';

import { OrganizationSwitcher, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useLocale } from 'next-intl';

import { ActiveLink } from '@/components/ActiveLink';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { ToggleMenuButton } from '@/components/ToggleMenuButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/templates/Logo';
import { getI18nPath } from '@/utils/Helpers';

export const DashboardHeader = (props: {
  menu: {
    href: string;
    label: string;
  }[];
}) => {
  const locale = useLocale();

  return (
    <>
      <div className="flex items-center">
        <Link href="/dashboard" className="max-sm:hidden">
          <Logo />
        </Link>

        <svg
          className="size-8 stroke-muted-foreground max-sm:hidden"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" />
          <path d="M17 5 7 19" />
        </svg>

        <OrganizationSwitcher
          organizationProfileMode="navigation"
          organizationProfileUrl={getI18nPath(
            '/dashboard/organization-profile',
            locale,
          )}
          afterCreateOrganizationUrl="/dashboard"
          hidePersonal
          skipInvitationScreen
          appearance={{
            elements: {
              organizationSwitcherTrigger: 'max-w-28 sm:max-w-52',
            },
          }}
        />

        <nav className="ml-4 max-lg:hidden">
          <ul className="flex flex-row items-center gap-x-1 text-sm font-medium">
            {props.menu.map(item => (
              <li key={item.href}>
                <ActiveLink
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary [&.active]:bg-primary/10 [&.active]:text-primary"
                >
                  {item.label}
                </ActiveLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div>
        <ul className="flex items-center gap-x-1.5 [&_li[data-fade]:hover]:opacity-100 [&_li[data-fade]]:opacity-60">
          <li data-fade>
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <ToggleMenuButton />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {props.menu.map(item => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </li>

          {/* PRO: Dark mode toggle button */}

          <li data-fade>
            <LocaleSwitcher />
          </li>

          <li>
            <Separator orientation="vertical" className="h-4" />
          </li>

          <li>
            <UserButton
              userProfileMode="navigation"
              userProfileUrl="/dashboard/user-profile"
              appearance={{
                elements: {
                  rootBox: 'px-2 py-1.5',
                },
              }}
            />
          </li>
        </ul>
      </div>
    </>
  );
};
