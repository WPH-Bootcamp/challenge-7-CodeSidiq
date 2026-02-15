'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

import { ShowMoreButton } from '@/components/common/ShowMoreButton';
import { Card } from '@/components/ui/card';
import type { RestaurantDetail } from '@/types/restaurant';

type Props = {
  restaurant: RestaurantDetail;
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d);
};

// UI helper (presentation only)
const Stars = ({ value }: { value: number }) => {
  const safeValue = Math.max(0, Math.min(5, value));

  return (
    <div
      className='flex items-center gap-1'
      aria-label={`Rating ${safeValue} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const active = i < safeValue;
        return (
          <Image
            key={i}
            src='/assets/icons/star.svg'
            alt=''
            aria-hidden='true'
            width={14}
            height={14}
            className={active ? 'opacity-100' : 'opacity-30'}
          />
        );
      })}
    </div>
  );
};

const INITIAL_VISIBLE = 6;
const STEP = 6;

export const ReviewSection = ({ restaurant }: Props) => {
  const reviews = restaurant.reviews ?? [];
  const loaded = reviews.length;

  const totalFromServer = restaurant.totalReviews;
  const hasServerTotal =
    typeof totalFromServer === 'number' && Number.isFinite(totalFromServer);

  const total = hasServerTotal ? totalFromServer : loaded;
  const hasMoreOnServer = hasServerTotal && totalFromServer > loaded;

  const rating = restaurant.averageRating ?? restaurant.star;

  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE);

  const visibleReviews = useMemo(
    () => reviews.slice(0, visibleCount),
    [reviews, visibleCount]
  );

  const canShowMoreClient = visibleCount < loaded;
  const canShowMore = canShowMoreClient;

  const handleShowMore = () => {
    if (!canShowMoreClient) return;
    setVisibleCount((prev) => Math.min(prev + STEP, loaded));
  };

  const totalLabel = hasMoreOnServer ? `${loaded}/${total}` : `${total}`;

  return (
    <section className='space-y-5'>
      {/* Header */}
      <div className='space-y-1.5'>
        <h2 className='text-xl font-semibold tracking-tight md:text-2xl'>
          Review
        </h2>

        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <div className='flex items-center gap-1'>
            <Image
              src='/assets/icons/star.svg'
              alt=''
              aria-hidden='true'
              width={16}
              height={16}
            />
            <span className='font-semibold text-foreground'>{rating}</span>
          </div>
          <span>({totalLabel} Ulasan)</span>
        </div>

        {/* NOTE: Debug paragraph dihapus (bukan bagian Figma / UI production) */}
      </div>

      {/* Body */}
      {loaded === 0 ? (
        <p className='text-sm text-muted-foreground'>No reviews.</p>
      ) : (
        <div className='grid gap-5 lg:grid-cols-2'>
          {visibleReviews.map((review) => (
            <Card
              key={review.id}
              className='rounded-2xl border p-5 shadow-sm md:p-6'
            >
              <div className='flex items-start gap-4'>
                {/* Avatar */}
                <div className='relative h-10 w-10 shrink-0 overflow-hidden rounded-full border bg-white'>
                  <Image
                    src={review.user.avatar || '/assets/icons/avatar.svg'}
                    alt={`${review.user.name} avatar`}
                    fill
                    className='object-cover'
                    sizes='40px'
                  />
                </div>

                {/* Content */}
                <div className='min-w-0 flex-1 space-y-3'>
                  <div className='space-y-1'>
                    <p className='truncate text-sm font-semibold text-foreground'>
                      {review.user.name}
                    </p>

                    <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
                      <Stars value={review.star} />
                      <p className='text-xs text-muted-foreground'>
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>

                  <p className='text-sm leading-relaxed text-foreground'>
                    {review.comment ?? ''}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className='flex justify-center pt-3'>
        <ShowMoreButton
          canShowMore={canShowMore}
          isLoadingMore={false}
          onClickAction={handleShowMore}
        />
      </div>
    </section>
  );
};
