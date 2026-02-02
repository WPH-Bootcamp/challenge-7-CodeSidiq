'use client';

// src/app/category/[slug]/CategoryClient.tsx
import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from '@/lib/store';
import { useRestaurantsQuery } from '@/services/queries/restaurants';
import type { RestaurantListItem } from '@/types/restaurant';

import {
  resetFilters,
  setCategorySlug,
  setLocation,
  setPriceMax,
  setPriceMin,
  setRange,
  setRatingMin,
  setSearchQuery,
  setSortBy,
  type SortBy,
} from '@/features/filters/filtersSlice';

import { NotAvailableYet } from '@/components/common/NotAvailableYet';
import { CategoryFilterPanel } from '@/components/resto/CategoryFilterPanel';
import { RestaurantList } from '@/components/resto/RestaurantList';

const SUPPORTED_SLUGS = new Set(['all', 'nearby']);
const UNSUPPORTED_SLUGS = new Set([
  'discount',
  'best-seller',
  'delivery',
  'lunch',
]);

const normalizeSlug = (slug?: string | null) =>
  (slug ?? 'all').trim().toLowerCase();

const EMPTY_RESTAURANTS: RestaurantListItem[] = [];

type Props = {
  slug: string;
};

export default function CategoryClient({ slug }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector((s: RootState) => s.filters);

  const categorySlug = useMemo(() => normalizeSlug(slug), [slug]);

  // Route-driven: keep redux in sync with route
  useEffect(() => {
    dispatch(setCategorySlug(categorySlug));

    if (categorySlug === 'nearby' && (!filters.range || filters.range > 5)) {
      dispatch(setRange(1));
    }
  }, [categorySlug, dispatch, filters.range]);

  // feature gating
  const isSupported = SUPPORTED_SLUGS.has(categorySlug);
  const isUnsupported = UNSUPPORTED_SLUGS.has(categorySlug);

  // Distance = server-side query param (location/range)
  const restaurantsQuery = useRestaurantsQuery({
    location: filters.location,
    range: filters.range,
    page: 1,
    limit: 50,
  });

  const baseRestaurants =
    restaurantsQuery.data?.restaurants ?? EMPTY_RESTAURANTS;

  // Derived filtering: search/sort/price/rating
  const filteredRestaurants = useMemo(() => {
    if (!isSupported) return [];

    const q = filters.searchQuery.trim().toLowerCase();
    const ratingMin = filters.ratingMin;
    const priceMin = filters.priceMin;
    const priceMax = filters.priceMax;

    let items = baseRestaurants.slice();

    // slug-based derived filter (minimal for MVP)
    // 'all' -> no extra filter
    // 'nearby' -> data already range-filtered server-side, no extra filter needed
    // If later you want category cuisine mapping, do it here (derived, not fetch).
    if (q.length > 0) {
      items = items.filter((r) => r.name.toLowerCase().includes(q));
    }

    if (typeof ratingMin === 'number') {
      items = items.filter((r) => r.star >= ratingMin);
    }

    if (typeof priceMin === 'number' || typeof priceMax === 'number') {
      items = items.filter((r) => {
        const min = r.priceRange?.min;
        const max = r.priceRange?.max;

        // If backend doesn't provide priceRange, we cannot safely include it in price filtering
        if (typeof min !== 'number' || typeof max !== 'number') return false;

        if (typeof priceMin === 'number' && max < priceMin) return false;
        if (typeof priceMax === 'number' && min > priceMax) return false;
        return true;
      });
    }

    const sortBy = filters.sortBy;
    items.sort((a, b) => compareRestaurants(a, b, sortBy));

    return items;
  }, [
    baseRestaurants,
    filters.priceMax,
    filters.priceMin,
    filters.ratingMin,
    filters.searchQuery,
    filters.sortBy,
    isSupported,
  ]);

  if (isUnsupported || !isSupported) {
    return (
      <div className='mx-auto w-full max-w-6xl px-4 py-8'>
        <NotAvailableYet
          title='Category not available yet'
          description='Kategori ini belum didukung oleh backend/roadmap saat ini. Jadi jangan pura-pura list kosong itu normal.'
          primaryCta={{ label: 'Back to Home', href: '/' }}
          secondaryCta={{ label: 'All Restaurant', href: '/category/all' }}
        />
      </div>
    );
  }

  if (restaurantsQuery.isLoading) {
    return (
      <div className='mx-auto w-full max-w-6xl px-4 py-8'>
        <p className='text-sm text-muted-foreground'>Loading restaurants...</p>
      </div>
    );
  }

  if (restaurantsQuery.isError) {
    return (
      <div className='mx-auto w-full max-w-6xl px-4 py-8'>
        <p className='text-sm text-red-600'>
          Error: {restaurantsQuery.error?.message}
        </p>
        <div className='mt-4'>
          <Link className='text-sm underline' href='/'>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto w-full max-w-6xl px-4 py-8'>
      <div className='mb-6 flex items-center justify-between gap-4'>
        <h1 className='text-2xl font-semibold'>
          {categorySlug === 'nearby' ? 'Nearby Restaurants' : 'All Restaurant'}
        </h1>

        <button
          type='button'
          onClick={() => dispatch(resetFilters())}
          className='rounded-md border px-3 py-2 text-sm'
        >
          Reset Filters
        </button>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr]'>
        <CategoryFilterPanel
          // distance (server params)
          location={filters.location}
          range={filters.range}
          onChangeLocation={(v) => dispatch(setLocation(v))}
          onChangeRange={(v) => dispatch(setRange(v))}
          // derived
          searchQuery={filters.searchQuery}
          onChangeSearch={(v) => dispatch(setSearchQuery(v))}
          sortBy={filters.sortBy}
          onChangeSort={(v) => dispatch(setSortBy(v))}
          priceMin={filters.priceMin}
          priceMax={filters.priceMax}
          onChangePriceMin={(v) => dispatch(setPriceMin(v))}
          onChangePriceMax={(v) => dispatch(setPriceMax(v))}
          ratingMin={filters.ratingMin}
          onChangeRatingMin={(v) => dispatch(setRatingMin(v))}
        />

        <div className='min-w-0'>
          <RestaurantList restaurants={filteredRestaurants} />
        </div>
      </div>
    </div>
  );
}

const compareRestaurants = (
  a: RestaurantListItem,
  b: RestaurantListItem,
  sortBy: SortBy
) => {
  if (sortBy === 'rating-desc') return b.star - a.star;
  if (sortBy === 'name-asc') return a.name.localeCompare(b.name);

  const aMin = a.priceRange?.min;
  const bMin = b.priceRange?.min;

  // missing priceRange should go last in price sorting
  const aVal = typeof aMin === 'number' ? aMin : Number.POSITIVE_INFINITY;
  const bVal = typeof bMin === 'number' ? bMin : Number.POSITIVE_INFINITY;

  if (sortBy === 'price-asc') return aVal - bVal;
  return bVal - aVal; // price-desc
};
