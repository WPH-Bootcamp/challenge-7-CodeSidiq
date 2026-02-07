// src/components/cart/EmptyCartState.tsx

import Link from 'next/link';

const EmptyCartState = () => {
  return (
    <div className='rounded-xl border bg-white p-6 text-center'>
      <p className='text-sm font-medium'>Your cart is empty</p>
      <p className='mt-1 text-sm text-gray-600'>
        Add some food first. Humans need calories to keep making decisions.
      </p>

      <Link
        href='/'
        className='mt-4 inline-flex h-10 items-center justify-center rounded-full bg-gray-900 px-5 text-sm font-medium text-white'
      >
        Back to Home
      </Link>
    </div>
  );
};

export default EmptyCartState;
