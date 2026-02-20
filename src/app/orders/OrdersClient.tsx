// src/app/orders/OrdersClient.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import OrdersSidebar from '@/components/orders/OrdersSidebar';
import ReviewModal from '@/components/orders/ReviewModal';
import { cn } from '@/lib/utils';
import { useProfileQuery } from '@/services/queries/auth';
import { useOrdersQuery } from '@/services/queries/orders';
import { useMyReviewsQuery } from '@/services/queries/reviews';
import type { TransactionStatus } from '@/types/order';
import type { MyReviewItem } from '@/types/review';

const ICONS = {
  search: '/assets/icons/search.svg',
} as const;

const statusTabs = [
  { label: 'Preparing', value: 'preparing' },
  { label: 'On the Way', value: 'on_the_way' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Done', value: 'done' },
  { label: 'Canceled', value: 'canceled' },
] as const;

type StatusTabValue = (typeof statusTabs)[number]['value'];

const moneyIdr = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
    value
  );

const normalizeText = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '');

type ReviewModalState =
  | { open: false }
  | {
      open: true;
      transactionId: string;
      restaurantName: string;
      restaurantId: number;
      menuIds: number[];
      existingReview: MyReviewItem | null;
    };

const OrdersClient = () => {
  const [status, setStatus] = useState<StatusTabValue>('done');
  const [search, setSearch] = useState<string>('');
  const [reviewModal, setReviewModal] = useState<ReviewModalState>({
    open: false,
  });

  // Figma-feel: jangan kebanyakan card numpuk
  const page = 1;
  const limit = 5;

  // Single source of truth for user name + avatar (to match the Header).
  const { data: profileResponse } = useProfileQuery();
  const user = profileResponse?.data ?? null;

  const userName = user?.name?.trim() ? user.name : 'Guest';
  const avatarUrl = user?.avatar ?? null;

  const { data, isLoading, isError, error } = useOrdersQuery({
    status,
    page,
    limit,
  });

  // Reviews (needed for Edit mode & 409 avoidance)
  const myReviewsPage = 1;
  const myReviewsLimit = 50; // enough for matching current list
  const { data: myReviewsRes } = useMyReviewsQuery(
    { page: myReviewsPage, limit: myReviewsLimit },
    {
      enabled: typeof window !== 'undefined', // token gating handled by axios/auth in practice
    }
  );

  const reviewByTransactionId = useMemo(() => {
    const list = myReviewsRes?.data.reviews ?? [];
    const map = new Map<string, MyReviewItem>();
    for (const r of list) map.set(r.transactionId, r);
    return map;
  }, [myReviewsRes]);

  const normalized = useMemo(() => {
    const orders = data?.data.orders ?? [];

    return orders.map((tx) => {
      const firstGroup = tx.restaurants?.[0];
      const firstItem = firstGroup?.items?.[0];

      const restaurantName = firstGroup?.restaurant.name ?? 'Restaurant';
      const restaurantLogo = firstGroup?.restaurant.logo;
      const restaurantId = firstGroup?.restaurant.id ?? 0;

      const itemName = firstItem?.menuName ?? 'Menu';
      const qty = firstItem?.quantity ?? 0;
      const price = firstItem?.price ?? 0;

      // Prefer food image (thumbnail), fallback to restaurant logo
      const thumb = firstItem?.image || restaurantLogo || '';

      const qtyText =
        qty && price ? `${qty}  ${moneyIdr(price)}` : qty ? `${qty} item` : '';

      const menuIdsRaw = (firstGroup?.items ?? []).map((i) => i.menuId);
      const menuIds = Array.from(new Set(menuIdsRaw)).filter(
        (x) => typeof x === 'number' && Number.isFinite(x)
      );

      const transactionId = tx.transactionId;

      return {
        id: tx.id,
        transactionId,
        status: tx.status as TransactionStatus,
        restaurantName,
        restaurantLogo,
        restaurantId,
        menuIds,
        thumb,
        itemName,
        qtyText,
        total: tx.pricing?.totalPrice ?? 0,
        existingReview: reviewByTransactionId.get(transactionId) ?? null,
      };
    });
  }, [data, reviewByTransactionId]);

  const filtered = useMemo(() => {
    const q = normalizeText(search);
    if (!q) return normalized;

    return normalized.filter((o) => {
      const haystack = normalizeText(
        `${o.restaurantName} ${o.itemName} ${o.transactionId}`
      );
      return haystack.includes(q);
    });
  }, [normalized, search]);

  const isUnauthorized =
    error instanceof Error &&
    normalizeText(error.message).includes(
      normalizeText('access token required')
    );

  const openReviewModal = (args: {
    transactionId: string;
    restaurantName: string;
    restaurantId: number;
    menuIds: number[];
    existingReview: MyReviewItem | null;
  }) => {
    setReviewModal({ open: true, ...args });
  };

  const closeReviewModal = () => setReviewModal({ open: false });

  return (
    <main className='mx-auto w-full max-w-[1200px] px-4 pb-16 pt-10 sm:px-6 lg:px-8'>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr] lg:items-start'>
        {/* Sidebar (desktop only) */}
        <div className='hidden lg:block'>
          <OrdersSidebar userName={userName} avatarUrl={avatarUrl} />
        </div>

        {/* Content */}
        <section>
          <h1 className='text-3xl font-semibold tracking-tight'>My Orders</h1>

          <div className='mt-6 rounded-2xl border bg-card p-5 shadow-sm sm:p-6'>
            {/* Search */}
            <div className='flex items-center gap-3 rounded-full border bg-background px-4 py-3'>
              <Image
                src={ICONS.search}
                alt=''
                width={18}
                height={18}
                className='opacity-70'
                aria-hidden='true'
              />
              <input
                className='w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground'
                placeholder='Search'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label='Search orders'
              />
            </div>

            {/* Status tabs */}
            <div className='mt-5'>
              <div className='text-sm font-medium'>Status</div>

              <div className='mt-3 flex flex-wrap gap-2'>
                {statusTabs.map((t) => (
                  <button
                    key={t.value}
                    type='button'
                    onClick={() => setStatus(t.value)}
                    className={cn(
                      'h-9 rounded-full border px-4 text-xs font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      status === t.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'bg-background hover:bg-muted'
                    )}
                    aria-pressed={status === t.value}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className='mt-6 space-y-4'>
              {isLoading ? (
                <p className='text-sm text-muted-foreground'>
                  Loading orders...
                </p>
              ) : isError ? (
                <div className='rounded-xl border bg-background p-4'>
                  <p className='text-sm text-destructive'>
                    {error instanceof Error
                      ? error.message
                      : 'Failed to load orders'}
                  </p>

                  {isUnauthorized ? (
                    <p className='mt-2 text-sm text-muted-foreground'>
                      Please login to view your orders.{' '}
                      <Link
                        href='/auth/login'
                        className='font-medium text-primary underline-offset-4 hover:underline'
                      >
                        Go to Login
                      </Link>
                    </p>
                  ) : null}
                </div>
              ) : filtered.length === 0 ? (
                <p className='text-sm text-muted-foreground'>
                  No orders found.
                </p>
              ) : (
                filtered.map((o) => {
                  const isEdit = Boolean(o.existingReview?.id);

                  return (
                    <article
                      key={o.transactionId}
                      className='rounded-2xl border bg-background px-4 py-4 sm:px-5 sm:py-4'
                    >
                      {/* Top: restaurant */}
                      <div className='flex items-center gap-3'>
                        <div className='relative h-9 w-9 overflow-hidden rounded-xl bg-muted'>
                          {o.restaurantLogo ? (
                            <Image
                              src={o.restaurantLogo}
                              alt={o.restaurantName}
                              fill
                              sizes='36px'
                              className='object-cover'
                            />
                          ) : null}
                        </div>

                        <div className='min-w-0'>
                          <div className='truncate text-sm font-semibold'>
                            {o.restaurantName}
                          </div>
                        </div>
                      </div>

                      {/* Middle: item */}
                      <div className='mt-3 flex items-center gap-4'>
                        <div className='relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted'>
                          {o.thumb ? (
                            <Image
                              src={o.thumb}
                              alt={o.itemName}
                              fill
                              sizes='56px'
                              className='object-cover'
                            />
                          ) : null}
                        </div>

                        <div className='min-w-0'>
                          <div className='truncate text-sm font-medium'>
                            {o.itemName}
                          </div>
                          <div className='mt-1 text-sm font-semibold'>
                            {o.qtyText || ''}
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className='mt-3 h-px w-full bg-border' />

                      {/* Bottom */}
                      <div className='mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                        <div>
                          <div className='text-xs text-muted-foreground'>
                            Total
                          </div>
                          <div className='text-sm font-semibold'>
                            {moneyIdr(o.total)}
                          </div>
                        </div>

                        <button
                          type='button'
                          onClick={() =>
                            openReviewModal({
                              transactionId: o.transactionId,
                              restaurantName: o.restaurantName,
                              restaurantId: o.restaurantId,
                              menuIds: o.menuIds,
                              existingReview: o.existingReview,
                            })
                          }
                          className={cn(
                            'h-11 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground',
                            'hover:opacity-90 active:opacity-95',
                            'w-full sm:w-auto',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                          )}
                        >
                          {isEdit ? 'Edit Review' : 'Give Review'}
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Modal (key ensures clean initial state without effect reset) */}
      {reviewModal.open ? (
        <ReviewModal
          key={`${reviewModal.transactionId}-${reviewModal.existingReview?.id ?? 'new'}`}
          open={reviewModal.open}
          onClose={closeReviewModal}
          transactionId={reviewModal.transactionId}
          restaurantId={reviewModal.restaurantId}
          restaurantName={reviewModal.restaurantName}
          menuIds={reviewModal.menuIds}
          existingReview={reviewModal.existingReview}
        />
      ) : null}
    </main>
  );
};

export default OrdersClient;
