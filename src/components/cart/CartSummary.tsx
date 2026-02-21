import Link from 'next/link';

import { cn, formatCurrencyIDR } from '@/lib/utils';

type CartSummaryProps = {
  subtotal: number;

  // Visual-only preference: in figma, checkout is inside each restaurant card.
  // Keep function without changing checkout rules.
  checkoutHref?: string;

  // Optional legacy behavior
  onCheckout?: () => void;
};

const CartSummary = ({
  subtotal,
  checkoutHref = '/checkout',
  onCheckout,
}: CartSummaryProps) => {
  const isLink = typeof checkoutHref === 'string' && checkoutHref.length > 0;

  const btnClass = cn(
    'inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold',
    'bg-primary text-primary-foreground hover:opacity-90',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    // Mobile: full width inside card. Desktop: fixed-ish width like Figma.
    'w-full sm:w-44'
  );

  return (
    <div className='mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div>
        <p className='text-xs font-medium text-muted-foreground'>Total</p>
        <p className='mt-1 text-base font-semibold'>
          {formatCurrencyIDR(subtotal)}
        </p>
      </div>

      {isLink ? (
        <Link href={checkoutHref} className={btnClass}>
          Checkout
        </Link>
      ) : (
        <button type='button' onClick={onCheckout} className={btnClass}>
          Checkout
        </button>
      )}
    </div>
  );
};

export default CartSummary;
