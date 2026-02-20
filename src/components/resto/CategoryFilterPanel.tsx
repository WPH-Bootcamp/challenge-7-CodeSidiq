// src/components/resto/CategoryFilterPanel.tsx
import Image from 'next/image';

import { Checkbox } from '@/components/ui/checkbox';
import type { SortBy } from '@/features/filters/filtersSlice';

type Props = {
  // Distance (UI-only)
  range: number | null;
  onChangeRange: (v: number | null) => void;

  // Search & sort (client-side)
  searchQuery: string;
  onChangeSearch: (v: string) => void;

  sortBy: SortBy;
  onChangeSort: (v: SortBy) => void;

  // Price (server-side, committed only on Enter/Apply)
  priceMin: number | null;
  priceMax: number | null;
  onChangePriceMin: (v: number | null) => void;
  onChangePriceMax: (v: number | null) => void;

  // Rating (server-side)
  ratingMin: number | null;
  onChangeRatingMin: (v: number | null) => void;

  // commit price only on Enter / Apply
  onSubmitPrice?: () => void;
};

const DISTANCE_OPTIONS = [
  { label: 'Nearby', value: 0 },
  { label: 'Within 1 km', value: 1 },
  { label: 'Within 3 km', value: 3 },
  { label: 'Within 5 km', value: 5 },
] as const;

export const CategoryFilterPanel = ({
  range,
  onChangeRange,
  searchQuery,
  onChangeSearch,
  sortBy,
  onChangeSort,
  priceMin,
  priceMax,
  onChangePriceMin,
  onChangePriceMax,
  ratingMin,
  onChangeRatingMin,
  onSubmitPrice,
}: Props) => {
  const toggleRange = (v: number) => {
    // single-select behavior (mutually exclusive)
    onChangeRange(range === v ? null : v);
  };

  const toggleRating = (v: number) => {
    // single-select behavior
    onChangeRatingMin(ratingMin === v ? null : v);
  };

  return (
    <aside className='rounded-xl border border-border bg-card p-4'>
      <div className='mb-4 flex items-center justify-between'>
        <p className='text-sm font-semibold text-foreground'>FILTER</p>
      </div>

      {/* Distance */}
      <div className='mb-5'>
        <p className='mb-2 text-sm font-semibold text-foreground'>Distance</p>

        <div className='space-y-2'>
          {DISTANCE_OPTIONS.map((opt) => (
            <label
              key={`${opt.label}-${opt.value}`}
              className='flex items-center gap-2 text-sm text-foreground'
            >
              <Checkbox
                checked={range === opt.value}
                onCheckedChange={() => toggleRange(opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className='mb-5'>
        <p className='mb-2 text-sm font-semibold text-foreground'>Price</p>

        <div className='grid grid-cols-1 gap-2'>
          <div className='flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2'>
            <span className='text-sm text-muted-foreground'>Rp</span>
            <input
              inputMode='numeric'
              value={priceMin ?? ''}
              onChange={(e) =>
                onChangePriceMin(
                  e.target.value === '' ? null : Number(e.target.value)
                )
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSubmitPrice?.();
              }}
              className='w-full bg-transparent text-sm text-foreground outline-none'
              placeholder='Minimum Price'
            />
          </div>

          <div className='flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2'>
            <span className='text-sm text-muted-foreground'>Rp</span>
            <input
              inputMode='numeric'
              value={priceMax ?? ''}
              onChange={(e) =>
                onChangePriceMax(
                  e.target.value === '' ? null : Number(e.target.value)
                )
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSubmitPrice?.();
              }}
              className='w-full bg-transparent text-sm text-foreground outline-none'
              placeholder='Maximum Price'
            />
          </div>
        </div>
      </div>

      {/* Rating */}
      <div>
        <p className='mb-2 text-sm font-semibold text-foreground'>Rating</p>

        <div className='space-y-2'>
          {[5, 4, 3, 2, 1].map((v) => (
            <label
              key={v}
              className='flex items-center gap-2 text-sm text-foreground'
            >
              <Checkbox
                checked={ratingMin === v}
                onCheckedChange={() => toggleRating(v)}
              />

              <span className='inline-flex items-center gap-2'>
                <Image
                  src='/assets/icons/star.svg'
                  alt=''
                  aria-hidden='true'
                  width={14}
                  height={14}
                />
                <span>{v}</span>
              </span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
};
