// src/components/layout/Header.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { cn } from '@/lib/utils';
import { authTokenStorage } from '@/services/api/axios';
import { authQueryKeys, useProfileQuery } from '@/services/queries/auth';
import { cartQueryKeys, useCartQuery } from '@/services/queries/cart';
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

const SCROLL_Y_THRESHOLD = 12;

const Header = ({ className }: HeaderProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const pathname = usePathname();
  const isHome = pathname === '/';

  const { data: profileResponse, isError } = useProfileQuery();
  const user: AuthUser | null = profileResponse?.data ?? null;

  const isLoggedIn = useMemo(() => {
    if (isError) return false;
    return Boolean(user?.id);
  }, [isError, user?.id]);

  const displayName = user?.name ?? 'Guest';

  const avatarRaw = user?.avatar ?? '';
  const avatarUrl =
    avatarRaw && isLikelyAbsoluteUrl(avatarRaw) ? avatarRaw : null;

  const { data: cartData } = useCartQuery({
    enabled: isLoggedIn,
    retry: false,
  });

  const cartCount = cartData?.summary.totalItems ?? 0;

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRootRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  // Scroll state only matters for Home (others always solid)
  useEffect(() => {
    if (!isHome) return;

    const onScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_Y_THRESHOLD);
    };

    // sync initial state when entering Home
    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;

      const root = menuRootRef.current;
      const btn = menuButtonRef.current;

      if (root?.contains(target) || btn?.contains(target)) return;
      setIsMenuOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMenuOpen]);

  const handleCloseMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    setIsMenuOpen(false);

    await queryClient.cancelQueries({ queryKey: authQueryKeys.profile });
    queryClient.setQueryData(authQueryKeys.profile, undefined);
    queryClient.removeQueries({ queryKey: authQueryKeys.profile });

    await queryClient.cancelQueries({ queryKey: cartQueryKeys.all });
    queryClient.setQueryData(cartQueryKeys.all, undefined);
    queryClient.removeQueries({ queryKey: cartQueryKeys.all });

    authTokenStorage.clear();
    router.replace('/auth/login');
  };

  const headerSolid = !isHome || isScrolled;

  const logoSrc = headerSolid
    ? '/assets/icons/logo.svg'
    : '/assets/icons/logo-white.svg';

  const bagIconSrc = headerSolid
    ? '/assets/icons/bag.svg'
    : '/assets/icons/bag-white.svg';

  // ✅ fixed always (biar gak ada drama sticky)
  const headerPosition = 'fixed left-0 top-0';

  // ✅ theme rules:
  // - Home top: truly transparent (NO blur / NO tint)
  // - Home scrolled: solid glass
  // - Non-home: solid glass
  const headerTheme = headerSolid
    ? 'bg-card/95 text-card-foreground shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80'
    : 'bg-transparent text-white';

  // only apply drop-shadow to readable elements, not background
  const readableOnHero = !headerSolid && isHome ? 'drop-shadow-sm' : '';

  const cartBtnClass = cn(
    'relative inline-flex h-11 w-11 items-center justify-center rounded-full',
    headerSolid ? 'hover:bg-accent' : 'hover:bg-white/10',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
  );

  return (
    <header
      className={cn('z-60 w-full', headerPosition, headerTheme, className)}
    >
      <div className='mx-auto flex h-20 w-full max-w-360 items-center justify-between px-6 lg:px-16 xl:px-30'>
        <Link
          href='/'
          aria-label='Go to home'
          className={cn(
            'inline-flex items-center gap-3',
            readableOnHero,
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
        >
          <Image
            src={logoSrc}
            alt='Foody logo'
            width={32}
            height={32}
            priority
          />
          <span
            className={cn(
              'text-xl font-semibold leading-none',
              isHome ? 'hidden sm:inline' : 'inline'
            )}
          >
            Foody
          </span>
        </Link>

        <div className={cn('flex items-center gap-3', readableOnHero)}>
          {!isLoggedIn ? (
            <div className='flex items-center gap-2'>
              <Link
                href='/auth/login'
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium',
                  headerSolid
                    ? 'border bg-white text-foreground hover:bg-muted'
                    : 'bg-white/15 text-white hover:bg-white/20'
                )}
              >
                Sign In
              </Link>

              <Link
                href='/auth/register'
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium',
                  headerSolid
                    ? 'bg-primary text-primary-foreground hover:opacity-90'
                    : 'bg-white text-foreground hover:bg-white/90'
                )}
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className='relative flex items-center gap-3' ref={menuRootRef}>
              <Link href='/cart' aria-label='Cart' className={cartBtnClass}>
                <Image
                  src={bagIconSrc}
                  alt=''
                  width={20}
                  height={20}
                  aria-hidden='true'
                />
                {cartCount > 0 ? (
                  <span className='absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground'>
                    {cartCount}
                  </span>
                ) : null}
              </Link>

              <button
                ref={menuButtonRef}
                type='button'
                aria-label='User menu'
                onClick={() => setIsMenuOpen((v) => !v)}
                className={cn(
                  'inline-flex h-11 items-center gap-3 rounded-full px-3',
                  headerSolid ? 'hover:bg-accent' : 'hover:bg-white/10',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                )}
              >
                {avatarUrl ? (
                  <span className='relative h-8 w-8 overflow-hidden rounded-full bg-muted'>
                    <Image
                      src={avatarUrl}
                      alt={`${displayName} avatar`}
                      fill
                      className='object-cover'
                    />
                  </span>
                ) : (
                  <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground'>
                    {getInitial(displayName)}
                  </span>
                )}

                <span
                  className={cn(
                    'max-w-35 truncate text-sm font-medium',
                    isHome && !headerSolid ? 'text-white' : 'text-foreground',
                    'hidden sm:inline'
                  )}
                >
                  {displayName}
                </span>
              </button>

              {isMenuOpen ? (
                <div className='absolute right-0 top-14 w-70 overflow-hidden rounded-3xl border bg-card text-foreground shadow-lg'>
                  <div className='flex items-center gap-3 px-5 pt-5'>
                    {avatarUrl ? (
                      <span className='relative h-11 w-11 overflow-hidden rounded-full bg-muted'>
                        <Image
                          src={avatarUrl}
                          alt={`${displayName} avatar`}
                          fill
                          className='object-cover'
                        />
                      </span>
                    ) : (
                      <span className='inline-flex h-11 w-11 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground'>
                        {getInitial(displayName)}
                      </span>
                    )}

                    <Link
                      href='/profile'
                      onClick={handleCloseMenu}
                      className='truncate text-base font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                    >
                      {displayName}
                    </Link>
                  </div>

                  <div className='mx-5 mt-4 border-t' />

                  <div className='px-3 py-3'>
                    <Link
                      href='/profile'
                      onClick={handleCloseMenu}
                      className='flex items-center gap-3 rounded-2xl px-3 py-3 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    >
                      <Image
                        src='/assets/icons/marker-pin.svg'
                        alt=''
                        aria-hidden='true'
                        width={20}
                        height={20}
                      />
                      <span className='font-medium'>Delivery Address</span>
                    </Link>

                    <Link
                      href='/orders'
                      onClick={handleCloseMenu}
                      className='flex items-center gap-3 rounded-2xl px-3 py-3 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    >
                      <Image
                        src='/assets/icons/file.svg'
                        alt=''
                        aria-hidden='true'
                        width={20}
                        height={20}
                      />
                      <span className='font-medium'>My Orders</span>
                    </Link>

                    <button
                      type='button'
                      onClick={handleLogout}
                      className='flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    >
                      <Image
                        src='/assets/icons/arrow-circle.svg'
                        alt=''
                        aria-hidden='true'
                        width={20}
                        height={20}
                      />
                      <span className='font-medium'>Logout</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
