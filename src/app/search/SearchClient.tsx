'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { ShowMoreButton } from '@/components/common/ShowMoreButton';
import { RestaurantList } from '@/components/resto/RestaurantList';
import { useInfiniteSearchRestaurantsQuery } from '@/services/queries/restaurants';

type Props = {
  q: string;
};

export const SearchClient = ({ q }: Props) => {
  const query = useInfiniteSearchRestaurantsQuery({ q, limit: 20 });

  const restaurants = useMemo(() => {
    const pages = query.data?.pages ?? [];
    return pages.flatMap((p) => p.restaurants ?? []);
  }, [query.data]);

  const normalizedQ = q.trim();
  const isEmptyQuery = normalizedQ.length === 0;

  const canShowMore = Boolean(query.hasNextPage);
  const isLoadingMore = query.isFetchingNextPage;

  return (
    <main className='mx-auto max-w-360 px-6 pb-12 pt-10 lg:px-16 xl:px-30'>
      <div className='mb-6 flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold text-foreground'>
            Search Results
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            {isEmptyQuery ? (
              'Type something on Home search and press Enter.'
            ) : (
              <>
                Showing results for{' '}
                <span className='font-medium text-foreground'>
                  &quot;{normalizedQ}&quot;
                </span>
              </>
            )}
          </p>
        </div>

        <Link
          href='/'
          className='text-sm font-medium text-primary hover:opacity-90'
        >
          Back to Home
        </Link>
      </div>

      {isEmptyQuery ? (
        <div className='rounded-2xl border bg-card p-6 text-sm text-muted-foreground'>
          No search query provided.
        </div>
      ) : query.isLoading ? (
        <div className='rounded-2xl border bg-card p-6 text-sm text-muted-foreground'>
          Loading search results...
        </div>
      ) : query.isError ? (
        <div className='rounded-2xl border bg-card p-6 text-sm text-destructive'>
          Error: {query.error?.message ?? 'Unknown error'}
        </div>
      ) : (
        <>
          <RestaurantList restaurants={restaurants} />

          <div className='mt-8 flex justify-center'>
            <ShowMoreButton
              canShowMore={canShowMore}
              isLoadingMore={isLoadingMore}
              onClickAction={() => query.fetchNextPage()}
            />
          </div>
        </>
      )}
    </main>
  );
};
