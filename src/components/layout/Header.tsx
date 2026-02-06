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
  const router = useRouter();
  const queryClient = useQueryClient();

  const pathname = usePathname();
  const isHome = pathname === '/';

  const { data: profileResponse, isError } = useProfileQuery();

  // Swagger wrapper: { success, message, data }
  const user: AuthUser | null = profileResponse?.data ?? null;

  const isLoggedIn = useMemo(() => {
    if (isError) return false;
    return Boolean(user?.id);
  }, [isError, user?.id]);

  const displayName = user?.name ?? 'Guest';

  const avatarRaw = user?.avatar ?? '';
  const avatarUrl =
    avatarRaw && isLikelyAbsoluteUrl(avatarRaw) ? avatarRaw : null;

  // UI only (server cart comes later session)
  const cartCount = isLoggedIn ? 1 : 0;

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Refs for click-outside detection
  const menuRootRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isHome) return;

    const onScroll = () => setIsScrolled(window.scrollY > 12);

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  // Close dropdown on click outside + Escape key
  useEffect(() => {
    if (!isMenuOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;

      const root = menuRootRef.current;
      const btn = menuButtonRef.current;

      // If click happens inside dropdown or on the button, ignore
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

  const handleLogout = () => {
    // MVP logout: clear token + reset auth state cache + redirect
    authTokenStorage.clear();
    queryClient.removeQueries({ queryKey: authQueryKeys.profile });
    setIsMenuOpen(false);
    router.push('/auth/login');
  };

  // Home:
  // - top: transparent
  // - scrolled: solid
  // Other pages: solid
  const headerSolid = !isHome || isScrolled;

  const bagIconSrc = headerSolid
    ? '/assets/icons/bag.svg'
    : '/assets/icons/bag-white.svg';

  return (
    <header
      className={cn(
        isHome ? 'fixed left-0 top-0 z-50' : 'relative',
        'w-full',
        headerSolid
          ? 'bg-card text-card-foreground shadow-sm'
          : 'bg-transparent text-white',
        className
      )}
    >
      {/* lock height to prevent jump */}
      <div className='mx-auto flex h-20 w-full max-w-360 items-center justify-between px-6 lg:px-16 xl:px-[120px]'>
        {/* Left: Logo */}
        <Link href='/' className='flex items-center gap-3' aria-label='Foody'>
          <Image
            src={
              headerSolid
                ? '/assets/icons/logo.svg'
                : '/assets/icons/logo-white.svg'
            }
            alt='Foody logo'
            width={32}
            height={32}
            priority
          />
          {/* Home mobile: hide text like design */}
          <span
            className={cn(
              'text-xl font-semibold leading-none',
              isHome ? 'hidden sm:inline' : 'inline'
            )}
          >
            Foody
          </span>
        </Link>

        {/* Right */}
        <div className='flex items-center gap-3'>
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
              <button
                type='button'
                aria-label='Cart'
                className={cn(
                  'relative inline-flex h-11 w-11 items-center justify-center rounded-full',
                  headerSolid ? 'hover:bg-accent' : 'hover:bg-white/10',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                )}
              >
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
              </button>

              <button
                ref={menuButtonRef}
                type='button'
                aria-label='User menu'
                aria-haspopup='menu'
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((v) => !v)}
                className='relative h-11 w-11 overflow-hidden rounded-full bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={`${displayName} avatar`}
                    fill
                    sizes='44px'
                    className='object-cover'
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground'>
                    {getInitial(displayName)}
                  </div>
                )}
              </button>

              <span className='hidden text-sm font-medium sm:inline'>
                {displayName}
              </span>

              {isMenuOpen ? (
                <div
                  role='menu'
                  className='absolute right-0 top-14 w-80 rounded-2xl border bg-card p-5 text-card-foreground shadow-lg'
                >
                  {/* User header (match Figma hierarchy) */}
                  <div className='flex items-center gap-3'>
                    <div className='relative h-12 w-12 overflow-hidden rounded-full bg-muted'>
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt=''
                          fill
                          sizes='48px'
                          className='object-cover'
                        />
                      ) : (
                        <div className='flex h-full w-full items-center justify-center text-base font-semibold text-muted-foreground'>
                          {getInitial(displayName)}
                        </div>
                      )}
                    </div>

                    <div className='min-w-0'>
                      <p className='truncate text-lg font-semibold leading-none'>
                        {displayName}
                      </p>
                    </div>
                  </div>

                  <div className='my-4 h-px w-full bg-border' />

                  <nav className='space-y-1 text-sm text-card-foreground'>
                    <Link
                      href='/profile'
                      onClick={handleCloseMenu}
                      className='flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-muted'
                      role='menuitem'
                    >
                      <Image
                        src='/assets/icons/marker-pin.svg'
                        alt=''
                        aria-hidden='true'
                        width={20}
                        height={20}
                      />
                      <span className='text-base font-medium'>
                        Delivery Address
                      </span>
                    </Link>

                    <Link
                      href='/orders'
                      onClick={handleCloseMenu}
                      className='flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-muted'
                      role='menuitem'
                    >
                      <Image
                        src='/assets/icons/file.svg'
                        alt=''
                        aria-hidden='true'
                        width={20}
                        height={20}
                      />
                      <span className='text-base font-medium'>My Orders</span>
                    </Link>

                    {/* divider before logout (matches Figma separation) */}
                    <div className='my-2 h-px w-full bg-border' />

                    <button
                      type='button'
                      onClick={handleLogout}
                      className='flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-muted'
                      role='menuitem'
                    >
                      <Image
                        src='/assets/icons/arrow-circle.svg'
                        alt=''
                        aria-hidden='true'
                        width={20}
                        height={20}
                      />
                      <span className='text-base font-medium'>Logout</span>
                    </button>
                  </nav>
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
