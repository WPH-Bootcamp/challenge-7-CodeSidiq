// src/components/resto/CategoryFilterPanel.tsx
import type { SortBy } from '@/features/filters/filtersSlice';

type Props = {
  location: string;
  range: number;
  onChangeLocation: (v: string) => void;
  onChangeRange: (v: number) => void;

  searchQuery: string;
  onChangeSearch: (v: string) => void;

  sortBy: SortBy;
  onChangeSort: (v: SortBy) => void;

  priceMin: number | null;
  priceMax: number | null;
  onChangePriceMin: (v: number | null) => void;
  onChangePriceMax: (v: number | null) => void;

  ratingMin: number | null;
  onChangeRatingMin: (v: number | null) => void;
};

export const CategoryFilterPanel = ({
  location,
  range,
  onChangeLocation,
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
}: Props) => {
  return (
    <aside className='rounded-xl border bg-white p-4'>
      <div className='mb-4'>
        <p className='text-sm font-semibold'>FILTER</p>
      </div>

      {/* Search */}
      <div className='mb-5'>
        <label className='mb-2 block text-sm font-medium'>Search</label>
        <input
          value={searchQuery}
          onChange={(e) => onChangeSearch(e.target.value)}
          placeholder='Search restaurants...'
          className='w-full rounded-md border px-3 py-2 text-sm'
        />
      </div>

      {/* Sort */}
      <div className='mb-5'>
        <label className='mb-2 block text-sm font-medium'>Sort</label>
        <select
          value={sortBy}
          onChange={(e) => onChangeSort(e.target.value as SortBy)}
          className='w-full rounded-md border px-3 py-2 text-sm'
        >
          <option value='rating-desc'>Rating (high → low)</option>
          <option value='name-asc'>Name (A → Z)</option>
          <option value='price-asc'>Price (low → high)</option>
          <option value='price-desc'>Price (high → low)</option>
        </select>
      </div>

      {/* Distance (server-side) */}
      <div className='mb-5'>
        <label className='mb-2 block text-sm font-medium'>Distance</label>

        <div className='mb-3'>
          <label className='mb-1 block text-xs text-muted-foreground'>
            Location
          </label>
          <input
            value={location}
            onChange={(e) => onChangeLocation(e.target.value)}
            className='w-full rounded-md border px-3 py-2 text-sm'
            placeholder='e.g. jakarta pusat'
          />
        </div>

        <div className='space-y-2 text-sm'>
          <label className='flex items-center gap-2'>
            <input
              type='radio'
              checked={range === 1}
              onChange={() => onChangeRange(1)}
            />
            Nearby (1 km)
          </label>

          <label className='flex items-center gap-2'>
            <input
              type='radio'
              checked={range === 3}
              onChange={() => onChangeRange(3)}
            />
            Within 3 km
          </label>

          <label className='flex items-center gap-2'>
            <input
              type='radio'
              checked={range === 5}
              onChange={() => onChangeRange(5)}
            />
            Within 5 km
          </label>

          <label className='flex items-center gap-2'>
            <input
              type='radio'
              checked={range === 10}
              onChange={() => onChangeRange(10)}
            />
            Within 10 km
          </label>
        </div>
      </div>

      {/* Price */}
      <div className='mb-5'>
        <label className='mb-2 block text-sm font-medium'>Price</label>

        <div className='grid grid-cols-2 gap-2'>
          <div>
            <label className='mb-1 block text-xs text-muted-foreground'>
              Min
            </label>
            <input
              inputMode='numeric'
              value={priceMin ?? ''}
              onChange={(e) =>
                onChangePriceMin(
                  e.target.value === '' ? null : Number(e.target.value)
                )
              }
              className='w-full rounded-md border px-3 py-2 text-sm'
              placeholder='Rp'
            />
          </div>

          <div>
            <label className='mb-1 block text-xs text-muted-foreground'>
              Max
            </label>
            <input
              inputMode='numeric'
              value={priceMax ?? ''}
              onChange={(e) =>
                onChangePriceMax(
                  e.target.value === '' ? null : Number(e.target.value)
                )
              }
              className='w-full rounded-md border px-3 py-2 text-sm'
              placeholder='Rp'
            />
          </div>
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className='mb-2 block text-sm font-medium'>Rating</label>

        <div className='space-y-2 text-sm'>
          {[5, 4, 3, 2, 1].map((v) => (
            <label key={v} className='flex items-center gap-2'>
              <input
                type='radio'
                checked={ratingMin === v}
                onChange={() => onChangeRatingMin(v)}
              />
              {v}+
            </label>
          ))}

          <button
            type='button'
            onClick={() => onChangeRatingMin(null)}
            className='mt-2 text-xs underline'
          >
            Clear rating
          </button>
        </div>
      </div>
    </aside>
  );
};
