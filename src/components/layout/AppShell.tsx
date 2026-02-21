// src/components/layout/AppShell.tsx
'use client';

import { usePathname } from 'next/navigation';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { cn } from '@/lib/utils';

type AppShellProps = {
  children: React.ReactNode;
};

const AUTH_ROUTE_PREFIX = '/auth';

// Routes that must NOT show Header/Footer (UI-only clean screens)
const CLEAN_ROUTES = new Set<string>(['/payment-success']);

const AppShell = ({ children }: AppShellProps) => {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith(AUTH_ROUTE_PREFIX);
  const isHome = pathname === '/';
  const isCleanRoute = CLEAN_ROUTES.has(pathname);

  if (isAuthRoute || isCleanRoute) {
    return (
      <main className='min-h-screen bg-background text-foreground overflow-x-hidden isolate'>
        {children}
      </main>
    );
  }

  return (
    <div className='min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden isolate'>
      <Header />
      <main className={cn('flex-1', isHome ? '' : 'pt-20')}>{children}</main>
      <Footer className='mt-auto' />
    </div>
  );
};

export default AppShell;
