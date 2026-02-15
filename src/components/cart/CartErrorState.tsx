type CartErrorStateProps = {
  message: string;
  onRetry: () => void;
};

const CartErrorState = ({ message, onRetry }: CartErrorStateProps) => {
  return (
    <div className='rounded-3xl border bg-card p-8 shadow-sm'>
      <p className='text-base font-semibold text-destructive'>
        Failed to load cart
      </p>
      <p className='mt-2 text-sm text-muted-foreground'>{message}</p>

      <button
        type='button'
        onClick={onRetry}
        className='mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      >
        Retry
      </button>
    </div>
  );
};

export default CartErrorState;
