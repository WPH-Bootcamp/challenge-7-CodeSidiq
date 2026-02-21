// src/components/resto/RestaurantList.tsx
import Image from 'next/image';
import Link from 'next/link';

import type { RestaurantListItem } from '@/types/restaurant';

type Props = {
  restaurants: RestaurantListItem[];
};

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

const getInitial = (name: string) => {
  const trimmed = name.trim();
  return trimmed ? trimmed.slice(0, 1).toUpperCase() : 'R';
};

const normalizeLogoUrl = (raw?: string | null) => {
  const value = (raw ?? '').trim();
  if (!value) return null;
  if (value.startsWith('/')) return value;
  if (isAbsoluteUrl(value)) return value;
  return null;
};

const formatDistanceKm = (distance: unknown) => {
  if (typeof distance !== 'number' || Number.isNaN(distance)) return '';
  return `${distance.toFixed(1)} km`;
};

const RestaurantLogo = ({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl: string | null;
}) => {
  if (!logoUrl) {
    return (
      <div className='flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground'>
        {getInitial(name)}
      </div>
    );
  }

  return (
    <Image
      src={logoUrl}
      alt={`${name} logo`}
      fill
      sizes='64px'
      className='object-cover'
      unoptimized={isAbsoluteUrl(logoUrl)}
    />
  );
};

export const RestaurantList = ({ restaurants }: Props) => {
  if (restaurants.length === 0) {
    return (
      <div className='rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground'>
        No restaurants found.
      </div>
    );
  }

  return (
    <ul className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
      {restaurants.map((resto) => {
        const logoUrl = normalizeLogoUrl(resto.logo);
        const distanceText = formatDistanceKm(resto.distance);

        return (
          <li key={resto.id}>
            <Link
              href={`/resto/${resto.id}`}
              className={[
                'block rounded-2xl border border-border bg-card p-4 shadow-sm',
                'transition hover:shadow-md',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              ].join(' ')}
            >
              <div className='flex items-center gap-4'>
                <div className='relative h-16 w-16 overflow-hidden rounded-xl bg-muted'>
                  <RestaurantLogo name={resto.name} logoUrl={logoUrl} />
                </div>

                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-semibold text-foreground'>
                    {resto.name}
                  </p>

                  <div className='mt-1 flex items-center gap-2 text-xs text-muted-foreground'>
                    <span className='inline-flex items-center gap-1 text-foreground'>
                      <Image
                        src='/assets/icons/star.svg'
                        alt=''
                        aria-hidden='true'
                        width={14}
                        height={14}
                      />
                      <span>{resto.star}</span>
                    </span>

                    <span className='text-muted-foreground'></span>

                    <span className='truncate'>
                      {resto.place}
                      {distanceText ? `  ${distanceText}` : ''}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
