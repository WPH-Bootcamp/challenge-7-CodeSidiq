// src/components/resto/RestaurantSection.tsx
import type { UseQueryResult } from '@tanstack/react-query';

import type {
  BestSellerRestaurantsData,
  RecommendedRestaurantsData,
  RestaurantsListData,
} from '@/types/restaurant';

import { RestaurantList } from './RestaurantList';

type RestaurantsLike = RestaurantsListData | BestSellerRestaurantsData;

type BaseProps = {
  title: string;
};

type RestaurantsSectionProps = BaseProps & {
  query: UseQueryResult<RestaurantsLike, Error>;
};

export const RestaurantsSection = ({
  title,
  query,
}: RestaurantsSectionProps) => {
  if (query.isLoading) return <p>Loading {title}...</p>;
  if (query.isError) return <p>Error: {query.error?.message}</p>;

  const list = query.data?.restaurants ?? [];
  if (list.length === 0) return <p>No {title.toLowerCase()} found.</p>;

  return (
    <section>
      <h2 className='font-semibold mb-2'>{title}</h2>
      <RestaurantList restaurants={list} />
    </section>
  );
};

type RecommendedSectionProps = BaseProps & {
  query: UseQueryResult<RecommendedRestaurantsData, Error>;
};

export const RecommendedSection = ({
  title,
  query,
}: RecommendedSectionProps) => {
  if (query.isLoading) return <p>Loading {title}...</p>;
  if (query.isError) return <p>Error: {query.error?.message}</p>;

  const list = query.data?.recommendations ?? [];
  if (list.length === 0) return <p>No {title.toLowerCase()} found.</p>;

  return (
    <section>
      <h2 className='font-semibold mb-2'>{title}</h2>
      <RestaurantList restaurants={list} />
    </section>
  );
};
