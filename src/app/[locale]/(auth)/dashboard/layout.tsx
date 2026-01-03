import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { DashboardHeader } from '@/features/dashboard/DashboardHeader';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Dashboard',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default function DashboardLayout(props: { children: React.ReactNode }) {
  const t = useTranslations('DashboardLayout');

  return (
    <>
      {/* Header with glass effect */}
      <div className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3 lg:px-6">
          <DashboardHeader
            menu={[
              {
                href: '/dashboard',
                label: t('home'),
              },
              {
                href: '/dashboard/demo',
                label: 'AI Demo',
              },
              {
                href: '/dashboard/issues',
                label: 'Issues',
              },
              {
                href: '/dashboard/pm-dashboard',
                label: 'PM Dashboard',
              },
              {
                href: '/dashboard/properties',
                label: t('properties'),
              },
              {
                href: '/dashboard/tenants',
                label: t('tenants'),
              },
              {
                href: '/dashboard/organization-profile/organization-members',
                label: t('team'),
              },
              {
                href: '/dashboard/organization-profile',
                label: t('settings'),
              },
            ]}
          />
        </div>
      </div>

      {/* Main content with gradient mesh background */}
      <div className="gradient-mesh min-h-[calc(100vh-65px)] bg-background">
        <div className="mx-auto max-w-screen-xl px-4 pb-16 pt-8 lg:px-6">
          {props.children}
        </div>
      </div>
    </>
  );
}

export const dynamic = 'force-dynamic';
