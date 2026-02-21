'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import CartErrorState from '@/components/cart/CartErrorState';
import CartItemRow from '@/components/cart/CartItemRow';
import CartSummary from '@/components/cart/CartSummary';
import { cn } from '@/lib/utils';
import {
  useCartQuery,
  useClearCartMutation,
  useDeleteCartItemMutation,
  useUpdateCartItemMutation,
} from '@/services/queries/cart';
import type { CartRestaurantGroup } from '@/types/cart';

const PAGE_BG = 'w-full bg-muted/30';

// Figma desktop: container 800px, top spacing 48px
const PAGE_CONTAINER = 'mx-auto w-full max-w-[800px] px-4 pb-16 pt-12 sm:px-6';
const PAGE_CONTAINER_CENTER = 'mx-auto w-full max-w-[800px] px-4 py-12 sm:px-6';

const CartClient = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch: refetchCart,
  } = useCartQuery();

  const updateQty = useUpdateCartItemMutation();
  const deleteItem = useDeleteCartItemMutation();
  const clearCart = useClearCartMutation();

  const [pendingUpdateId, setPendingUpdateId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [serverError, setServerError] = useState<string>('');

  // UI-only: reveal actions for the selected item (pixel match figma by default)
  const [activeItemId, setActiveItemId] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;

      const root = rootRef.current;
      if (!root) return;

      // click outside cart area closes action reveal
      if (!root.contains(target)) setActiveItemId(null);
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const isEmpty = useMemo(() => {
    return (
      !data || data.cart.length === 0 || (data.summary.totalItems ?? 0) <= 0
    );
  }, [data]);

  const handleDecrease = async (cartItemId: number, nextQty: number) => {
    setServerError('');
    setPendingUpdateId(cartItemId);

    try {
      await updateQty.mutateAsync({ id: cartItemId, quantity: nextQty });
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Failed to update cart.'
      );
    } finally {
      setPendingUpdateId(null);
    }
  };

  const handleIncrease = async (cartItemId: number, nextQty: number) => {
    setServerError('');
    setPendingUpdateId(cartItemId);

    try {
      await updateQty.mutateAsync({ id: cartItemId, quantity: nextQty });
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Failed to update cart.'
      );
    } finally {
      setPendingUpdateId(null);
    }
  };

  const handleRemove = async (cartItemId: number) => {
    setServerError('');
    setPendingDeleteId(cartItemId);

    try {
      await deleteItem.mutateAsync({ id: cartItemId });
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Failed to remove item.'
      );
    } finally {
      setPendingDeleteId(null);
      setActiveItemId((prev) => (prev === cartItemId ? null : prev));
    }
  };

  const handleClear = async () => {
    setServerError('');
    try {
      await clearCart.mutateAsync();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Failed to clear cart.'
      );
    }
  };

  if (isLoading) {
    return (
      <section className={PAGE_BG}>
        <div className={PAGE_CONTAINER_CENTER}>
          <p className='text-sm text-muted-foreground'>Loading cart...</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className={PAGE_BG}>
        <div className={PAGE_CONTAINER_CENTER}>
          <CartErrorState
            message={error instanceof Error ? error.message : 'Failed to load.'}
            onRetry={() => refetchCart()}
          />

          <div className='mt-6'>
            <Link className='text-sm font-medium underline' href='/'>
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className={PAGE_BG}>
        <div className={PAGE_CONTAINER_CENTER}>
          <CartErrorState
            message='Cart data is unavailable. Please retry.'
            onRetry={() => refetchCart()}
          />

          <div className='mt-6'>
            <Link className='text-sm font-medium underline' href='/'>
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (isEmpty) {
    return (
      <section className={PAGE_BG}>
        <div className={PAGE_CONTAINER_CENTER}>
          <div className='rounded-3xl border bg-card p-8 text-center shadow-sm'>
            <p className='text-base font-semibold'>Your cart is empty</p>
            <p className='mt-2 text-sm text-muted-foreground'>
              Add some items to continue.
            </p>

            <Link
              href='/'
              className='mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const groups: CartRestaurantGroup[] = data.cart;

  return (
    <section className={PAGE_BG}>
      <div ref={rootRef} className={PAGE_CONTAINER}>
        {/* Page header */}
        <div className='flex items-center justify-between gap-4'>
          <h1 className='text-2xl font-semibold tracking-tight'>My Cart</h1>

          {/* Clear: keep function, hide visual dominance (pixel match) */}
          <button
            type='button'
            onClick={handleClear}
            disabled={clearCart.isPending}
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-full border bg-card',
              'hover:bg-muted disabled:opacity-60',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
            aria-label='Clear cart'
            title='Clear cart'
          >
            <svg
              width='18'
              height='18'
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
          </button>
        </div>

        {/* Server error banner (visual only) */}
        {serverError ? (
          <div className='mt-5 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3'>
            <p className='text-sm text-destructive'>{serverError}</p>
          </div>
        ) : null}

        {/* Restaurant groups */}
        <div className='mt-6 space-y-6'>
          {groups.map((group) => (
            <section
              key={group.restaurant.id}
              className={cn('rounded-3xl border bg-card p-6 shadow-sm')}
            >
              {/* Restaurant header row (Figma: chevron sticks to title) */}
              <div className='flex items-center'>
                <div className='flex min-w-0 items-center gap-3'>
                  {/* Restaurant icon */}
                  <span className='inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted'>
                    <Image
                      src='/assets/icons/restaurant.svg'
                      alt=''
                      aria-hidden='true'
                      width={32}
                      height={32}
                      className='shrink-0'
                    />
                  </span>

                  {/* Title + Chevron (adjacent) */}
                  <div className='flex min-w-0 items-center gap-2'>
                    <p className='truncate text-base font-semibold'>
                      {group.restaurant.name}
                    </p>

                    <Image
                      src='/assets/icons/chevron.svg'
                      alt=''
                      aria-hidden='true'
                      width={24}
                      height={24}
                      className='shrink-0'
                    />
                  </div>
                </div>
              </div>

              {/* Items */}
              <ul className='mt-4 space-y-2'>
                {group.items.map((item) => {
                  const isUpdatingThis =
                    pendingUpdateId === item.id && updateQty.isPending;
                  const isDeletingThis =
                    pendingDeleteId === item.id && deleteItem.isPending;

                  const disabled =
                    isUpdatingThis || isDeletingThis || clearCart.isPending;

                  return (
                    <li key={item.id} className='rounded-2xl'>
                      <CartItemRow
                        item={item}
                        disabled={disabled}
                        isActive={activeItemId === item.id}
                        onActivate={() => setActiveItemId(item.id)}
                        onDecrease={() =>
                          handleDecrease(item.id, item.quantity - 1)
                        }
                        onIncrease={() =>
                          handleIncrease(item.id, item.quantity + 1)
                        }
                        onRemove={() => handleRemove(item.id)}
                        isUpdating={isUpdatingThis}
                        isDeleting={isDeletingThis}
                      />
                    </li>
                  );
                })}
              </ul>

              {/* Divider dashed */}
              <div className='mt-5 border-t border-dashed border-border/70' />

              {/* Summary per restaurant */}
              <CartSummary subtotal={group.subtotal} checkoutHref='/checkout' />
            </section>
          ))}
        </div>

        {/* Secondary navigation */}
        <div className='mt-10 flex items-center justify-center'>
          <Link
            href='/'
            className='text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground'
          >
            Add more items
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CartClient;
