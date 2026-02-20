// src/components/resto/RestaurantSection.tsx
'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import type {
  BestSellerRestaurantsData,
  RecommendedRestaurantsData,
  RestaurantListItem,
  RestaurantsListData,
} from '@/types/restaurant';

import { RestaurantList } from './RestaurantList';

type BaseProps = {
  title: string;
  actionLabel?: string;
  actionHref?: string;
  showMoreLabel?: string;
};

const SectionHeader = ({
  title,
  actionLabel,
  actionHref,
}: {
  title: string;
  actionLabel?: string;
  actionHref?: string;
}) => {
  return (
    <div className='mb-6 flex items-center justify-between'>
      <h2 className='text-lg font-semibold text-foreground'>{title}</h2>

      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className='text-sm font-medium text-primary hover:opacity-90'
        >
          {actionLabel}
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
};

const normalize = (value: string) => value.trim().toLowerCase();

const parseStar = (star: RestaurantListItem['star']): number => {
  if (typeof star === 'number') return Number.isFinite(star) ? star : 0;
  if (typeof star === 'string') {
    const n = Number(star);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const filterByQuery = (list: RestaurantListItem[], searchQuery: string) => {
  const q = normalize(searchQuery);
  if (!q) return list;

  return list.filter((r) => {
    const name = normalize(r.name);
    const place = normalize(r.place);
    return name.includes(q) || place.includes(q);
  });
};

const sortByMode = (
  list: RestaurantListItem[],
  sortBy: RootState['filters']['sortBy']
) => {
  const sorted = [...list];

  switch (sortBy) {
    case 'name-asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      return sorted;

    case 'rating-desc':
      sorted.sort((a, b) => parseStar(b.star) - parseStar(a.star));
      return sorted;

    // price sort: belum ada field harga yang jelas di RestaurantListItem.
    // Jadi jangan halu. Kita biarkan stable order.
    case 'price-asc':
    case 'price-desc':
    default:
      return sorted;
  }
};

const useDerivedList = (rawList: RestaurantListItem[]) => {
  const { searchQuery, sortBy } = useSelector((s: RootState) => s.filters);

  // Hooks must stay at the top, not after an early return.
  return useMemo(() => {
    const filtered = filterByQuery(rawList, searchQuery);
    return sortByMode(filtered, sortBy);
  }, [rawList, searchQuery, sortBy]);
};

// -------------------- RestaurantsSection --------------------
type RestaurantsSectionProps = BaseProps & {
  query: UseQueryResult<RestaurantsListData | BestSellerRestaurantsData, Error>;
};

export const RestaurantsSection = ({
  title,
  query,
  actionLabel,
  actionHref,
}: RestaurantsSectionProps) => {
  const rawList = query.data?.restaurants ?? [];
  const list = useDerivedList(rawList);

  if (query.isLoading) {
    return (
      <section>
        <SectionHeader
          title={title}
          actionLabel={actionLabel}
          actionHref={actionHref}
        />
        <div className='rounded-2xl border bg-card p-6 text-sm text-muted-foreground'>
          Loading {title}...
        </div>
      </section>
    );
  }

  if (query.isError) {
    return (
      <section>
        <SectionHeader
          title={title}
          actionLabel={actionLabel}
          actionHref={actionHref}
        />
        <div className='rounded-2xl border bg-card p-6 text-sm text-destructive'>
          Error: {query.error?.message}
        </div>
      </section>
    );
  }

  if (rawList.length === 0) {
    return (
      <section>
        <SectionHeader
          title={title}
          actionLabel={actionLabel}
          actionHref={actionHref}
        />
        <div className='rounded-2xl border bg-card p-6 text-sm text-muted-foreground'>
          No {title.toLowerCase()} found.
        </div>
      </section>
    );
  }

  if (list.length === 0) {
    return (
      <section>
        <SectionHeader
          title={title}
          actionLabel={actionLabel}
          actionHref={actionHref}
        />
        <div className='rounded-2xl border bg-card p-6 text-sm text-muted-foreground'>
          No results match your search.
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader
        title={title}
        actionLabel={actionLabel}
        actionHref={actionHref}
      />
      <RestaurantList restaurants={list} />
    </section>
  );
};

// -------------------- RecommendedSection --------------------
type RecommendedSectionProps = BaseProps & {
  query: UseQueryResult<RecommendedRestaurantsData, Error>;
};

export const RecommendedSection = ({
  title,
  query,
  actionLabel,
  actionHref,
  showMoreLabel,
}: RecommendedSectionProps) => {
  const rawList = query.data?.recommendations ?? [];
  const list = useDerivedList(rawList);

  if (query.isLoading) {
    return (
      <section>
        <SectionHeader
          title={title}
          actionLabel={actionLabel}
          actionHref={actionHref}
        />
        <div className='rounded-2xl border bg-card p-6 text-sm text-muted-foreground'>
          Loading {title}...
        </div>
      </section>
    );
  }

  if (query.isError) {
    return (
      <section>
        <SectionHeader
          title={title}
          actionLabel={actionLabel}
          actionHref={actionHref}
        />
        <div className='rounded-2xl border bg-card p-6 text-sm text-destructive'>
          Error: {query.error?.message}
        </div>
      </section>
    );
  }

  if (rawList.length === 0) {
    return (
      <section>
        <SectionHeader
          title={title}
          actionLabel={actionLabel}
          actionHref={actionHref}
        />
        <div className='rounded-2xl border bg-card p-6 text-sm text-muted-foreground'>
          No {title.toLowerCase()} found.
        </div>
      </section>
    );
  }

  if (list.length === 0) {
    return (
      <section>
        <SectionHeader
          title={title}
          actionLabel={actionLabel}
          actionHref={actionHref}
        />
        <div className='rounded-2xl border bg-card p-6 text-sm text-muted-foreground'>
          No results match your search.
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader
        title={title}
        actionLabel={actionLabel}
        actionHref={actionHref}
      />
      <RestaurantList restaurants={list} />

      {showMoreLabel ? (
        <div className='mt-8 flex justify-center'>
          <button
            type='button'
            className='rounded-full border bg-card px-6 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            {showMoreLabel}
          </button>
        </div>
      ) : null}
    </section>
  );
};
