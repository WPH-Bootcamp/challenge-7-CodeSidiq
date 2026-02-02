// src/app/cart/CartClient.tsx
'use client';

import Link from 'next/link';

import { formatCurrencyIDR } from '@/lib/utils';
import { useCartQuery } from '@/services/queries/cart';

const CartClient = () => {
  const { data, isLoading, isError, error } = useCartQuery();

  if (isLoading) return <p>Loading cart...</p>;
  if (isError) return <p>Error: {error?.message}</p>;

  if (!data || data.cart.length === 0) {
    return (
      <div className='rounded-xl border bg-white p-6'>
        <h1 className='text-lg font-semibold'>My Cart</h1>
        <p className='mt-2 text-sm text-muted-foreground'>
          Your cart is empty.
        </p>

        <div className='mt-6'>
          <Link className='text-sm underline' href='/'>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-xl border bg-white p-6'>
      <h1 className='text-lg font-semibold'>My Cart</h1>

      <div className='mt-4 space-y-4'>
        {data.cart.map((group) => (
          <section key={group.restaurant.id} className='rounded-lg border p-4'>
            <p className='font-medium'>{group.restaurant.name}</p>

            <ul className='mt-3 space-y-2 text-sm text-muted-foreground'>
              {group.items.map((item) => (
                <li key={item.id} className='flex items-center justify-between'>
                  <span>
                    {getMenuLabel(item.menu)} × {item.quantity}
                  </span>
                  <span>{formatCurrencyIDR(item.itemTotal)}</span>
                </li>
              ))}
            </ul>

            <div className='mt-3 flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>Subtotal</span>
              <span className='font-medium'>
                {formatCurrencyIDR(group.subtotal)}
              </span>
            </div>
          </section>
        ))}
      </div>

      <div className='mt-6 flex items-center justify-between border-t pt-4 text-sm'>
        <span className='text-muted-foreground'>Total</span>
        <span className='font-semibold'>
          {formatCurrencyIDR(data.summary.totalPrice)}
        </span>
      </div>
    </div>
  );
};

export default CartClient;

/**
 * getMenuLabel
 * - We avoid accessing menu.name because your `Menu` type doesn't have it.
 * - This is a safe fallback until we align with the exact backend field.
 */
const getMenuLabel = (menu: unknown) => {
  const m = menu as Record<string, unknown>;

  const candidates = [m.name, m.title, m.menuName, m.menu_name, m.label];

  const hit = candidates.find((v) => typeof v === 'string');
  return hit ?? 'Menu';
};
