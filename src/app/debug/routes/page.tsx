import Link from 'next/link';

export default function DebugPage() {
  return (
    <div className='space-y-2 p-6'>
      <h1 className='text-lg font-semibold'>Debug Routes</h1>

      <ul className='list-disc pl-5 text-sm'>
        <li>
          <Link href='/' target='_blank' rel='noopener noreferrer'>
            Home
          </Link>
        </li>

        <li>
          <Link href='/category/all' target='_blank' rel='noopener noreferrer'>
            Category – All
          </Link>
        </li>

        <li>
          <Link
            href='/category/nearby'
            target='_blank'
            rel='noopener noreferrer'
          >
            Category – Nearby
          </Link>
        </li>

        <li>
          <Link href='/cart' target='_blank' rel='noopener noreferrer'>
            Cart
          </Link>
        </li>

        <li>
          <Link href='/profile' target='_blank' rel='noopener noreferrer'>
            Profile
          </Link>
        </li>
      </ul>
    </div>
  );
}
