// src/components/cart/CartErrorState.tsx

type CartErrorStateProps = {
  message: string;
  onRetry: () => void;
};

const CartErrorState = ({ message, onRetry }: CartErrorStateProps) => {
  return (
    <div className='rounded-xl border bg-white p-6'>
      <p className='text-sm font-semibold text-red-600'>Failed to load cart</p>
      <p className='mt-1 text-sm text-gray-700'>{message}</p>

      <button
        type='button'
        onClick={onRetry}
        className='mt-4 h-10 rounded-full bg-gray-900 px-5 text-sm font-medium text-white'
      >
        Retry
      </button>
    </div>
  );
};

export default CartErrorState;
