// src/components/cart/CartSummary.tsx

import { formatCurrencyIDR } from '@/lib/utils';

type CartSummaryProps = {
  subtotal: number;
  onCheckout?: () => void;
};

const CartSummary = ({ subtotal, onCheckout }: CartSummaryProps) => {
  return (
    <div className='mt-3 flex items-center justify-between gap-3 border-t pt-3'>
      <div>
        <p className='text-xs text-gray-500'>Total</p>
        <p className='text-sm font-semibold'>{formatCurrencyIDR(subtotal)}</p>
      </div>

      <button
        type='button'
        onClick={onCheckout}
        className='h-10 w-40 rounded-full bg-red-600 text-white text-sm font-medium'
      >
        Checkout
      </button>
    </div>
  );
};

export default CartSummary;
