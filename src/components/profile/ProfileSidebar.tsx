// src/components/profile/ProfileSidebar.tsx
import Image from 'next/image';
import Link from 'next/link';

import type { AuthUser } from '@/types/auth';

type ProfileSidebarProps = {
  user: AuthUser;
};

export const ProfileSidebar = ({ user }: ProfileSidebarProps) => {
  const displayName = user.name?.trim() ? user.name : 'User';

  return (
    <aside className='w-full'>
      <div className='rounded-2xl bg-white p-6 shadow-sm'>
        <div className='flex items-center gap-3'>
          <div className='relative h-10 w-10 overflow-hidden rounded-full bg-muted'>
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt='User avatar'
                fill
                sizes='40px'
                className='object-cover'
              />
            ) : null}
          </div>

          <div className='min-w-0'>
            <p className='truncate text-sm font-semibold text-foreground'>
              {displayName}
            </p>
          </div>
        </div>

        <div className='mt-5 space-y-2'>
          <Link
            href='/profile'
            className='flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted'
          >
            <Image
              src='/assets/icons/marker-pin.svg'
              alt=''
              width={20}
              height={20}
              aria-hidden='true'
            />
            <span>Delivery Address</span>
          </Link>

          <Link
            href='/orders'
            className='flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted'
          >
            <Image
              src='/assets/icons/file.svg'
              alt=''
              width={20}
              height={20}
              aria-hidden='true'
            />
            <span>My Orders</span>
          </Link>

          <button
            type='button'
            className='flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-foreground hover:bg-muted'
            onClick={() => {}}
          >
            <Image
              src='/assets/icons/arrow-circle.svg'
              alt=''
              width={20}
              height={20}
              aria-hidden='true'
            />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
