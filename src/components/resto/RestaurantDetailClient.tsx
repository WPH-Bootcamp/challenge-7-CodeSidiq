'use client';

import { useParams } from 'next/navigation';

import { RestaurantDetailView } from '@/components/resto/RestaurantDetailView';
import { useRestaurantDetailQuery } from '@/services/queries/restaurants';

export const RestaurantDetailClient = () => {
  const params = useParams();
  const id = Number(params.id);

  const query = useRestaurantDetailQuery({ id });

  if (query.isLoading) return <p>Loading restaurant...</p>;
  if (query.isError) return <p>Error: {query.error?.message}</p>;
  if (!query.data) return <p>Restaurant not found.</p>;

  return <RestaurantDetailView restaurant={query.data} />;
};
