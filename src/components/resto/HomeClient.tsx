'use client';

import {
  useBestSellerRestaurantsQuery,
  useRecommendedRestaurantsQuery,
  useRestaurantsQuery,
} from '@/services/queries/restaurants';

import {
  RecommendedSection,
  RestaurantsSection,
} from '@/components/resto/RestaurantSection';

export const HomeClient = () => {
  const restaurantsQuery = useRestaurantsQuery();
  const recommendedQuery = useRecommendedRestaurantsQuery();
  const bestSellerQuery = useBestSellerRestaurantsQuery();

  return (
    <main className='p-6 space-y-8'>
      <h1 className='text-xl font-semibold'>Restaurants</h1>

      <RestaurantsSection title='All Restaurants' query={restaurantsQuery} />
      <RecommendedSection title='Recommended' query={recommendedQuery} />
      <RestaurantsSection title='Best Seller' query={bestSellerQuery} />
    </main>
  );
};
