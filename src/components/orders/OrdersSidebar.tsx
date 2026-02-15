'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { authTokenStorage } from '@/services/api/axios';

const ICONS = {
  markerPin: '/assets/icons/marker-pin.svg',
  myOrdersActive: '/assets/icons/file-red.svg',
  logout: '/assets/icons/arrow-circle.svg',
} as const;

type OrdersSidebarProps = {
  userName?: string;
  avatarUrl?: string | null;
};

const isLikelyAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

const getInitial = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return 'G';
  return trimmed.slice(0, 1).toUpperCase();
};

const OrdersSidebar = ({
  userName = 'Guest',
  avatarUrl,
}: OrdersSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const isOrders = pathname === '/orders';

  const safeAvatar =
    typeof avatarUrl === 'string' && isLikelyAbsoluteUrl(avatarUrl)
      ? avatarUrl
      : null;

  const handleLogout = () => {
    authTokenStorage.clear();
    router.push('/auth/login');
  };

  return (
    <aside className='w-full max-w-[260px]'>
      <div className='rounded-2xl border bg-card p-4 shadow-sm'>
        {/* Avatar card */}
        <div className='flex items-center gap-3'>
          <div className='relative h-10 w-10 overflow-hidden rounded-full bg-muted'>
            {safeAvatar ? (
              <Image
                src={safeAvatar}
                alt={userName}
                fill
                sizes='40px'
                className='object-cover'
              />
            ) : (
              <div className='grid h-full w-full place-items-center text-sm font-semibold text-muted-foreground'>
                {getInitial(userName)}
              </div>
            )}
          </div>

          <div className='min-w-0'>
            <div className='truncate text-sm font-semibold'>{userName}</div>
          </div>
        </div>

        {/* Menu */}
        <nav className='mt-4 space-y-1'>
          <Link
            href='/profile'
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
              'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          >
            <Image src={ICONS.markerPin} alt='' width={18} height={18} />
            <span>Delivery Address</span>
          </Link>

          <Link
            href='/orders'
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
              isOrders
                ? 'font-semibold text-primary'
                : 'text-foreground hover:bg-muted',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          >
            <Image src={ICONS.myOrdersActive} alt='' width={18} height={18} />
            <span>My Orders</span>
          </Link>

          <button
            type='button'
            onClick={handleLogout}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
              'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          >
            <Image src={ICONS.logout} alt='' width={18} height={18} />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default OrdersSidebar;
