// src/components/layout/AppShell.tsx
'use client';

import { usePathname } from 'next/navigation';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';

type AppShellProps = {
  children: React.ReactNode;
};

const AUTH_ROUTE_PREFIX = '/auth';

const AppShell = ({ children }: AppShellProps) => {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith(AUTH_ROUTE_PREFIX);

  if (isAuthRoute) {
    return (
      <main className='min-h-screen bg-background text-foreground'>
        {children}
      </main>
    );
  }

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <div className='flex min-h-screen flex-col'>
        <Header />
        <main className='flex-1'>{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default AppShell;
