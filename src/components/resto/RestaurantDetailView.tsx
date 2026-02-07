import type { RestaurantDetail } from '@/types/restaurant';
import Image from 'next/image';

type Props = {
  restaurant: RestaurantDetail;
};

export const RestaurantDetailView = ({ restaurant }: Props) => {
  return (
    <main className='p-6 space-y-6'>
      <header className='space-y-1'>
        <h1 className='text-xl font-semibold'>{restaurant.name}</h1>

        <div className='flex items-center gap-1 text-sm text-gray-600'>
          <span>{restaurant.category}</span>
          <span>·</span>

          <Image
            src='/assets/icons/star.svg'
            alt='rating'
            width={14}
            height={14}
          />
          <span>{restaurant.star}</span>
        </div>
      </header>

      <section>
        <h2 className='font-semibold'>Menus</h2>

        {restaurant.menus.length === 0 ? (
          <p>No menus.</p>
        ) : (
          <ul className='list-disc ml-5'>
            {restaurant.menus.map((menu) => (
              <li key={menu.id}>
                {menu.foodName} — Rp{menu.price}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className='font-semibold'>Reviews</h2>

        {restaurant.reviews.length === 0 ? (
          <p>No reviews.</p>
        ) : (
          <ul className='space-y-2'>
            {restaurant.reviews.map((review) => (
              <li key={review.id} className='border p-2 rounded'>
                <div className='flex items-center gap-1'>
                  <Image
                    src='/assets/icons/star.svg'
                    alt='rating'
                    width={12}
                    height={12}
                  />
                  <span>{review.star}</span>
                </div>

                <p>{review.comment}</p>
                <p className='text-xs text-gray-500'>by {review.user.name}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};
