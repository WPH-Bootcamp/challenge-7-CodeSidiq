import './globals.css';

import type { Metadata } from 'next';

import Providers from '@/app/providers';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Restaurant App',
  description: 'Restaurant Web Frontend MVP',
};

type RootLayoutProps = {
  children: React.ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang='id'>
      <body suppressHydrationWarning>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
