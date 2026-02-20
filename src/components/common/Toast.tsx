'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

import { cn } from '@/lib/utils';

export type ToastVariant = 'info' | 'danger' | 'warning' | 'success';

type ToastAction =
  | {
      label: string;
      href: string;
    }
  | {
      label: string;
      onClick: () => void;
    };

type ToastProps = {
  open: boolean;
  title: string;
  description?: string;
  variant?: ToastVariant;

  /**
   * If you want a secondary action like "View changes" / "Learn more".
   */
  action?: ToastAction;

  /**
   * Called when user clicks Dismiss or close (X)
   */
  onClose: () => void;

  /**
   * Auto close after N ms (e.g. 3000). If omitted, it will not auto-close.
   */
  autoCloseMs?: number;

  /**
   * Optional override icon (if you want custom icon per screen)
   */
  iconSrc?: string;

  /**
   * Optional className for positioning container
   */
  className?: string;
};

// ==================================================
// Design tokens (single source of truth)
// ==================================================
const TOAST_MAX_WIDTH = 'w-full max-w-[420px]';
const TOAST_ICON_CONTAINER_SIZE = 'h-10 w-10'; // 32px (no inline style)
const TOAST_ICON_PADDING_CLASS = 'p-0.25';

const DEFAULT_ICONS: Record<ToastVariant, string> = {
  info: '/assets/icons/info.svg',
  danger: '/assets/icons/danger.svg',
  warning: '/assets/icons/warning.svg',
  success: '/assets/icons/success.svg',
};

const ICON_RING: Record<ToastVariant, string> = {
  info: 'ring-muted-foreground/25',
  danger: 'ring-destructive/25',
  warning: 'ring-warning/25',
  success: 'ring-success/25',
};

const ICON_BG: Record<ToastVariant, string> = {
  info: 'bg-muted',
  danger: 'bg-destructive/10',
  warning: 'bg-warning/10',
  success: 'bg-success/10',
};

const getA11yRole = (variant: ToastVariant) => {
  // Danger is usually urgent -> alert
  if (variant === 'danger') return 'alert' as const;
  return 'status' as const;
};

export const Toast = ({
  open,
  title,
  description,
  variant = 'info',
  action,
  onClose,
  autoCloseMs,
  iconSrc,
  className,
}: ToastProps) => {
  useEffect(() => {
    if (!open) return;
    if (!autoCloseMs) return;

    const id = window.setTimeout(() => {
      onClose();
    }, autoCloseMs);

    return () => window.clearTimeout(id);
  }, [open, autoCloseMs, onClose]);

  if (!open) return null;

  const icon = iconSrc ?? DEFAULT_ICONS[variant];

  return (
    <div
      role={getA11yRole(variant)}
      aria-live={variant === 'danger' ? 'assertive' : 'polite'}
      className={cn(
        TOAST_MAX_WIDTH,
        'max-w-[calc(100vw-48px)]',
        'rounded-2xl border bg-card shadow-lg',
        'px-5 py-4',
        className
      )}
    >
      {/* top row: icon + close */}
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-start gap-3'>
          <div
            className={cn(
              'relative mt-0.5 shrink-0 rounded-full ring-2',
              TOAST_ICON_CONTAINER_SIZE,
              ICON_BG[variant],
              ICON_RING[variant]
            )}
          >
            <Image
              src={icon}
              alt=''
              aria-hidden='true'
              fill
              sizes='32px'
              className={cn('object-contain', TOAST_ICON_PADDING_CLASS)}
              priority
            />
          </div>

          <div className='min-w-0'>
            <p className='text-sm font-semibold text-foreground'>{title}</p>
            {description ? (
              <p className='mt-1 text-sm text-muted-foreground'>
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <button
          type='button'
          onClick={onClose}
          aria-label='Close notification'
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-full',
            'text-muted-foreground hover:bg-muted hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
        >
          <span className='text-xl leading-none'></span>
        </button>
      </div>

      {/* footer actions */}
      <div className='mt-4 flex items-center gap-5 text-sm'>
        <button
          type='button'
          onClick={onClose}
          className='font-medium text-muted-foreground hover:text-foreground'
        >
          Dismiss
        </button>

        {action ? (
          'href' in action ? (
            <Link
              href={action.href}
              className='font-medium text-primary hover:underline'
            >
              {action.label}
            </Link>
          ) : (
            <button
              type='button'
              onClick={action.onClick}
              className='font-medium text-primary hover:underline'
            >
              {action.label}
            </button>
          )
        ) : null}
      </div>
    </div>
  );
};
