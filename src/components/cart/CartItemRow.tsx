// src/components/cart/CartItemRow.tsx

import { cn, formatCurrencyIDR } from '@/lib/utils';
import type { CartItem } from '@/types/cart';
import Image from 'next/image';

type CartItemRowProps = {
  item: CartItem;
  disabled?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
};

const CartItemRow = ({
  item,
  disabled = false,
  onDecrease,
  onIncrease,
  onRemove,
}: CartItemRowProps) => {
  return (
    <div className='flex items-center gap-3 py-3'>
      <Image
        src={item.menu.image}
        alt={item.menu.foodName}
        width={56}
        height={56}
        className='h-14 w-14 rounded-lg object-cover bg-gray-100'
      />

      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium'>{item.menu.foodName}</p>
        <p className='text-sm text-gray-600'>
          {formatCurrencyIDR(item.menu.price)}
        </p>
      </div>

      <div className='flex items-center gap-2'>
        <button
          type='button'
          onClick={onDecrease}
          disabled={disabled}
          className={cn(
            'h-8 w-8 rounded-full border text-sm',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          aria-label='Decrease quantity'
        >
          -
        </button>

        <span className='w-6 text-center text-sm'>{item.quantity}</span>

        <button
          type='button'
          onClick={onIncrease}
          disabled={disabled}
          className={cn(
            'h-8 w-8 rounded-full bg-red-600 text-white text-sm',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          aria-label='Increase quantity'
        >
          +
        </button>
      </div>

      <button
        type='button'
        onClick={onRemove}
        disabled={disabled}
        className={cn(
          'ml-2 text-xs text-gray-600 underline',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        Remove
      </button>
    </div>
  );
};

export default CartItemRow;
