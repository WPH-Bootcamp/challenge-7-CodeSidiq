import Image from 'next/image';

import { cn, formatCurrencyIDR } from '@/lib/utils';
import type { CartItem } from '@/types/cart';

type CartItemRowProps = {
  item: CartItem;
  disabled?: boolean;
  isActive?: boolean;
  onActivate?: () => void;

  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;

  // UI-only (optional): show subtle pending indicator on buttons
  isUpdating?: boolean;
  isDeleting?: boolean;
};

const CartItemRow = ({
  item,
  disabled = false,
  isActive = false,
  onActivate,
  onDecrease,
  onIncrease,
  onRemove,
  isUpdating = false,
  isDeleting = false,
}: CartItemRowProps) => {
  const canDecrease = item.quantity > 1;

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-2xl px-3 py-3',
        'hover:bg-muted/40',
        'focus-within:bg-muted/40',
        isActive ? 'bg-muted/40' : ''
      )}
      onClick={onActivate}
      onFocus={onActivate}
      tabIndex={0}
      role='group'
      aria-label={`${item.menu.foodName} item`}
    >
      <Image
        src={item.menu.image}
        alt={item.menu.foodName}
        width={56}
        height={56}
        className='h-14 w-14 flex-none rounded-xl bg-muted object-cover'
      />

      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-semibold'>{item.menu.foodName}</p>
        <p className='mt-0.5 text-xs text-muted-foreground'>
          {formatCurrencyIDR(item.menu.price)}
        </p>
      </div>

      {/* Qty control (compact like Figma) */}
      <div className='flex flex-none items-center gap-2'>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            onDecrease();
          }}
          disabled={disabled || !canDecrease}
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-full border bg-card text-sm font-semibold',
            'hover:bg-muted disabled:opacity-60',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
          aria-label='Decrease quantity'
          title='Decrease'
        >
          {isUpdating ? '…' : '-'}
        </button>

        <span className='w-6 text-center text-sm font-semibold'>
          {item.quantity}
        </span>

        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            onIncrease();
          }}
          disabled={disabled}
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold',
            'hover:opacity-90 disabled:opacity-60',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
          aria-label='Increase quantity'
          title='Increase'
        >
          {isUpdating ? '…' : '+'}
        </button>
      </div>

      {/* Item total (right) */}
      <div className='hidden text-sm font-semibold sm:block'>
        {formatCurrencyIDR(item.itemTotal)}
      </div>

      {/* Remove action (hidden by default = pixel match) */}
      <button
        type='button'
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        disabled={disabled}
        className={cn(
          'ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full border bg-card text-muted-foreground',
          'hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          // default hidden, revealed when active or focus-within
          isActive ? 'opacity-100' : 'opacity-0',
          'transition-opacity'
        )}
        aria-label='Remove item'
        title={isDeleting ? 'Removing...' : 'Remove'}
      >
        {isDeleting ? (
          <span className='text-xs font-semibold'>…</span>
        ) : (
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            aria-hidden='true'
          >
            <path
              d='M9 3h6m-9 4h12m-1 0-1 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7m3 4v8m6-8v8'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        )}
      </button>
    </div>
  );
};

export default CartItemRow;
