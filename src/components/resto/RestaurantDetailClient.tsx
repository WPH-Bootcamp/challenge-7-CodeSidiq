'use client';

import { useParams } from 'next/navigation';

import { RestaurantDetailView } from '@/components/resto/RestaurantDetailView';
import { useRestaurantDetailQuery } from '@/services/queries/restaurants';

export const RestaurantDetailClient = () => {
  const params = useParams();
  const id = Number(params.id);

  const query = useRestaurantDetailQuery({ id });

  if (Number.isNaN(id)) return <p className='p-6'>Invalid restaurant id.</p>;

  if (query.isLoading) {
    return <p className='p-6'>Loading restaurant...</p>;
  }

  if (query.isError) {
    return (
      <p className='p-6'>
        Error: {query.error instanceof Error ? query.error.message : 'Unknown'}
      </p>
    );
  }

  if (!query.data) return <p className='p-6'>Restaurant not found.</p>;

  return <RestaurantDetailView restaurant={query.data} />;
};
