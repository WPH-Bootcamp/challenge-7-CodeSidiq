// src/components/layout/AccountMenuContent.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

type MenuItemKey = 'delivery' | 'orders' | 'logout';

type MenuItem = {
  key: MenuItemKey;
  label: string;
  href?: string;
  iconSrc: string;
  isDanger?: boolean;
};

const MENU_ITEMS: MenuItem[] = [
  {
    key: 'delivery',
    label: 'Delivery Address',
    href: '/profile?focus=delivery',
    iconSrc: '/assets/icons/marker-pin.svg',
  },
  {
    key: 'orders',
    label: 'My Orders',
    href: '/orders',
    iconSrc: '/assets/icons/file.svg',
  },
  {
    key: 'logout',
    label: 'Logout',
    iconSrc: '/assets/icons/arrow-circle.svg',
    isDanger: false,
  },
];

type Props = {
  onNavigate: () => void;
  onLogout: () => void | Promise<void>;
  className?: string;

  /**
   * Mobile behavior: open delivery modal (sheet will close, modal lives in Header).
   * Desktop behavior: navigate to profile page.
   */
  deliveryMode: 'modal' | 'link';

  /**
   * Called when user clicks "Delivery Address" in modal mode.
   * This must be handled by parent (Header) so modal can render outside Sheet.
   */
  onOpenDeliveryModal?: () => void;
};

export const AccountMenuContent = ({
  onNavigate,
  onLogout,
  className,
  deliveryMode,
  onOpenDeliveryModal,
}: Props) => {
  const baseItemClass = cn(
    'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm',
    'cursor-pointer',
    'hover:bg-muted transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
  );

  const handleLogoutClick = async () => {
    await onLogout();
    onNavigate();
  };

  const handleDeliveryClickModal = () => {
    // Close menu first (dropdown/sheet), then ask parent to open modal.
    onNavigate();
    requestAnimationFrame(() => {
      onOpenDeliveryModal?.();
    });
  };

  return (
    <div className={cn('px-3 py-3', className)}>
      {MENU_ITEMS.map((item) => {
        // Delivery Address: behavior depends on mode
        if (item.key === 'delivery') {
          if (deliveryMode === 'modal') {
            return (
              <button
                key={item.key}
                type='button'
                onClick={handleDeliveryClickModal}
                className={baseItemClass}
                aria-label='Open delivery address modal'
              >
                <Image
                  src={item.iconSrc}
                  alt=''
                  aria-hidden='true'
                  width={20}
                  height={20}
                />
                <span className='font-medium'>{item.label}</span>
              </button>
            );
          }

          // deliveryMode === 'link' (desktop)
          return (
            <Link
              key={item.key}
              href={item.href ?? '/profile'}
              onClick={onNavigate}
              className={baseItemClass}
            >
              <Image
                src={item.iconSrc}
                alt=''
                aria-hidden='true'
                width={20}
                height={20}
              />
              <span className='font-medium'>{item.label}</span>
            </Link>
          );
        }

        // Normal link items
        if (item.href) {
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onNavigate}
              className={baseItemClass}
            >
              <Image
                src={item.iconSrc}
                alt=''
                aria-hidden='true'
                width={20}
                height={20}
              />
              <span className='font-medium'>{item.label}</span>
            </Link>
          );
        }

        // Logout
        return (
          <button
            key={item.key}
            type='button'
            onClick={handleLogoutClick}
            className={baseItemClass}
          >
            <Image
              src={item.iconSrc}
              alt=''
              aria-hidden='true'
              width={20}
              height={20}
            />
            <span className='font-medium'>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
