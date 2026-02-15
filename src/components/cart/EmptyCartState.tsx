import Link from 'next/link';

const EmptyCartState = () => {
  return (
    <div className='rounded-3xl border bg-card p-8 text-center shadow-sm'>
      <p className='text-base font-semibold'>Your cart is empty</p>
      <p className='mt-2 text-sm text-muted-foreground'>
        Add some items to continue.
      </p>

      <Link
        href='/'
        className='mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      >
        Back to Home
      </Link>
    </div>
  );
};

export default EmptyCartState;
