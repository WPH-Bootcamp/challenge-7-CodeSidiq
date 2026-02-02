'use client';

import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { useProfileQuery } from '@/services/queries/auth';
import type { AuthUser } from '@/types/auth';

type HeaderProps = {
  className?: string;
};

const isLikelyAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

const getInitial = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return 'G';
  return trimmed.slice(0, 1).toUpperCase();
};

const Header = ({ className }: HeaderProps) => {
  const { data: profileResponse } = useProfileQuery();

  // Swagger wrapper: { success, message, data }
  const user: AuthUser | null = profileResponse?.data ?? null;

  const displayName = user?.name ?? 'Guest';

  const avatarRaw = user?.avatar ?? '';
  const avatarUrl =
    avatarRaw && isLikelyAbsoluteUrl(avatarRaw) ? avatarRaw : null;

  // Static UI dulu (sesuai A3.1 scope). Nanti sesi cart baru real.
  const cartCount = 1;

  return (
    <header
      className={cn('w-full bg-card text-card-foreground shadow-sm', className)}
    >
      <div className='mx-auto flex w-full max-w-360 items-center justify-between px-4 py-3 sm:px-6 xl:px-30'>
        {/* Left: Logo */}
        <Link
          href='/'
          className='flex items-center gap-3'
          aria-label='Foody Home'
        >
          <Image
            src='/assets/icons/logo.svg'
            alt='Foody logo'
            width={32}
            height={32}
            priority
          />
          <span className='hidden text-xl font-semibold leading-none sm:inline'>
            Foody
          </span>
        </Link>

        {/* Right: Cart + User */}
        <div className='flex items-center gap-4'>
          {/* Cart */}
          <button
            type='button'
            aria-label='Cart'
            className='relative inline-flex h-12 w-12 items-center justify-center rounded-full hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          >
            <Image
              src='/assets/icons/bag.svg'
              alt=''
              width={22}
              height={22}
              aria-hidden='true'
            />
            {cartCount > 0 ? (
              <span className='absolute right-2 top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground'>
                {cartCount}
              </span>
            ) : null}
          </button>

          {/* User */}
          <div className='flex items-center gap-3'>
            <div className='relative h-10 w-10 overflow-hidden rounded-full bg-muted'>
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={`${displayName} avatar`}
                  fill
                  sizes='40px'
                  className='object-cover'
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground'>
                  {getInitial(displayName)}
                </div>
              )}
            </div>

            <span className='hidden text-sm font-medium sm:inline'>
              {displayName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
