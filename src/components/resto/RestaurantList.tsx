import Image from 'next/image';
import Link from 'next/link';

import { formatCurrencyIDR } from '@/lib/utils';
import type { RestaurantListItem } from '@/types/restaurant';

type Props = {
  restaurants: RestaurantListItem[];
};

export const RestaurantList = ({ restaurants }: Props) => {
  if (restaurants.length === 0) {
    return (
      <div className='rounded-md border p-4 text-sm text-muted-foreground'>
        No restaurants found.
      </div>
    );
  }

  return (
    <ul className='space-y-2'>
      {restaurants.map((resto) => {
        const priceRange = resto.priceRange;
        const distance = resto.distance;

        const hasPrice =
          typeof priceRange?.min === 'number' &&
          typeof priceRange?.max === 'number';

        const hasDistance = typeof distance === 'number';

        return (
          <li key={resto.id} className='rounded-md border p-3'>
            <Link
              href={`/resto/${resto.id}`}
              className='block space-y-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2'
            >
              <p className='font-medium'>{resto.name}</p>

              <div className='flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600'>
                <span>{resto.category}</span>

                <Dot />

                <span className='inline-flex items-center gap-1'>
                  <Image
                    src='/assets/icons/star.svg'
                    alt=''
                    aria-hidden='true'
                    width={14}
                    height={14}
                  />
                  <span>{resto.star}</span>
                </span>

                {typeof resto.menuCount === 'number' && (
                  <>
                    <Dot />
                    <span>{resto.menuCount} menus</span>
                  </>
                )}

                {hasPrice && (
                  <span>
                    {formatCurrencyIDR(resto.priceRange!.min)}–
                    {formatCurrencyIDR(resto.priceRange!.max)}
                  </span>
                )}

                {hasDistance && <span>{resto.distance!.toFixed(2)} km</span>}

                {hasDistance && (
                  <>
                    <Dot />
                    <span>{distance.toFixed(2)} km</span>
                  </>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

const Dot = () => <span aria-hidden='true'>·</span>;
