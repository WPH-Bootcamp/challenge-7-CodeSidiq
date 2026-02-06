// src/components/resto/HomeClient.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';

import { RecommendedSection } from '@/components/resto/RestaurantSection';
import { Input } from '@/components/ui/input';
import { setSearchQuery } from '@/features/filters/filtersSlice';
import type { AppDispatch, RootState } from '@/lib/store';
import { useRecommendedRestaurantsQuery } from '@/services/queries/restaurants';

const shortcuts = [
  {
    label: 'All Restaurant',
    icon: '/assets/icons/all-restaurant.svg',
    href: '#',
  },
  { label: 'Nearby', icon: '/assets/icons/nearby.svg', href: '#' },
  { label: 'Discount', icon: '/assets/icons/discount.svg', href: '#' },
  { label: 'Best Seller', icon: '/assets/icons/best-seller.svg', href: '#' },
  { label: 'Delivery', icon: '/assets/icons/delivery.svg', href: '#' },
  { label: 'Lunch', icon: '/assets/icons/lunch.svg', href: '#' },
] as const;

export const HomeClient = () => {
  const recommendedQuery = useRecommendedRestaurantsQuery();

  const dispatch = useDispatch<AppDispatch>();
  const searchQuery = useSelector(
    (state: RootState) => state.filters.searchQuery
  );

  return (
    <main>
      {/* Hero */}
      <section className='relative'>
        <div className='relative h-105 w-full overflow-hidden sm:h-130'>
          <Image
            src='/assets/images/hero-home.svg'
            alt=''
            aria-hidden='true'
            fill
            priority
            className='object-cover'
          />
          <div className='absolute inset-0 bg-black/55' />
        </div>

        {/* Hero content */}
        <div className='pointer-events-none absolute inset-0'>
          <div className='mx-auto flex h-full max-w-360 flex-col items-center justify-center px-6 lg:px-16 xl:px-30 text-center'>
            <h1 className='text-3xl font-semibold tracking-tight text-white sm:text-4xl'>
              Explore Culinary Experiences
            </h1>

            <p className='mt-2 max-w-xl text-sm text-white/85 sm:text-base'>
              Search and refine your choice to discover the perfect restaurant.
            </p>

            {/* Search pill */}
            <div className='pointer-events-auto mx-auto mt-6 w-full max-w-xl'>
              <div className='relative rounded-full bg-white px-4 py-2 shadow-sm'>
                <Image
                  src='/assets/icons/search.svg'
                  alt=''
                  aria-hidden='true'
                  width={18}
                  height={18}
                  className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 opacity-60'
                />
                <Input
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                  className='h-10 border-0 bg-transparent pl-10 pr-1 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0'
                  placeholder='Search restaurants, food and drink'
                  aria-label='Search restaurants'
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shortcuts row */}
      <section className='mx-auto mt-12 max-w-360 px-6 lg:px-16 xl:px-30'>
        <div className='rounded-3xl bg-white p-5 shadow-sm'>
          <div className='grid grid-cols-3 gap-4 sm:grid-cols-6'>
            {shortcuts.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className='group flex flex-col items-center gap-2 rounded-2xl p-3 transition hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              >
                <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/30'>
                  <Image
                    src={item.icon}
                    alt=''
                    aria-hidden='true'
                    width={28}
                    height={28}
                    className='transition group-hover:scale-[1.02]'
                  />
                </div>
                <span className='text-xs font-medium text-foreground'>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended */}
      <section className='mx-auto mt-12 max-w-360 px-6 lg:px-16 xl:px-30 pb-10'>
        <RecommendedSection
          title='Recommended'
          actionLabel='See All'
          actionHref='#'
          query={recommendedQuery}
        />

        {/* Show more (visual only) */}
        <div className='mt-8 flex justify-center'>
          <button
            type='button'
            className='rounded-full border bg-white px-6 py-2 text-xs font-medium text-foreground shadow-sm transition hover:bg-muted'
          >
            Show More
          </button>
        </div>
      </section>
    </main>
  );
};
