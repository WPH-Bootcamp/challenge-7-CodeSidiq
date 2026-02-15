// src/components/layout/Footer.tsx
import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

type FooterProps = {
  className?: string;
};

const exploreLinks = [
  { label: 'All Food', href: '#' },
  { label: 'Nearby', href: '#' },
  { label: 'Discount', href: '#' },
  { label: 'Best Seller', href: '#' },
  { label: 'Delivery', href: '#' },
  { label: 'Lunch', href: '#' },
];

const helpLinks = [
  { label: 'How to Order', href: '#' },
  { label: 'Payment Methods', href: '#' },
  { label: 'Track My Order', href: '#' },
  { label: 'FAQ', href: '#' },
  { label: 'Contact Us', href: '#' },
];

const socialIcons = [
  { alt: 'Facebook', src: '/assets/icons/facebook.svg', href: '#' },
  { alt: 'Instagram', src: '/assets/icons/instagram.svg', href: '#' },
  { alt: 'LinkedIn', src: '/assets/icons/linkedin.svg', href: '#' },
  { alt: 'TikTok', src: '/assets/icons/tiktok.svg', href: '#' },
];

const FOOTER_CONTAINER = cn(
  'mx-auto w-full max-w-[1000px]',
  'px-6 sm:px-6 lg:px-16',
  'py-[clamp(2.5rem,6vw,5rem)]'
);

const Footer = ({ className }: FooterProps) => {
  return (
    <footer
      className={cn(
        // stable paint layer
        'relative isolate w-full bg-foreground text-background',
        // GPU/compositing stability
        'transform-gpu will-change-transform',
        className
      )}
    >
      {/* seam masks */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 top-0 h-3 bg-foreground'
      />
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 bottom-0 h-3 bg-foreground'
      />

      <div className={FOOTER_CONTAINER}>
        <div className='grid gap-[clamp(2rem,5vw,3rem)] lg:grid-cols-3 lg:items-start'>
          {/* Brand */}
          <div className='max-w-[24rem]'>
            <Link
              href='/'
              aria-label='Go to home'
              className={cn(
                'inline-flex items-center gap-3 cursor-pointer select-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-foreground'
              )}
            >
              <Image
                src='/assets/icons/logo.svg'
                alt='Foody logo'
                width={32}
                height={32}
              />
              <span className='text-2xl font-semibold leading-none'>Foody</span>
            </Link>

            <p className='mt-4 text-sm leading-6 text-background/70'>
              Enjoy homemade flavors &amp; chef&apos;s signature dishes, freshly
              prepared every day. Order online or visit our nearest branch.
            </p>

            <p className='mt-8 text-sm font-semibold'>Follow on Social Media</p>

            <div className='mt-4 flex items-center gap-3'>
              {socialIcons.map((item) => (
                <Link
                  key={item.alt}
                  href={item.href}
                  aria-label={item.alt}
                  className='inline-flex h-11 w-11 items-center justify-center rounded-full bg-background/10 hover:bg-background/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-foreground'
                >
                  <Image
                    src={item.src}
                    alt=''
                    aria-hidden='true'
                    width={40}
                    height={40}
                    className='block'
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className='grid gap-[clamp(1.5rem,4vw,2rem)] min-[420px]:grid-cols-2 lg:col-span-2 lg:grid-cols-2'>
            <div className='lg:mx-auto lg:w-full lg:max-w-50'>
              <h3 className='text-sm font-semibold'>Explore</h3>
              <ul className='mt-4 space-y-3 text-sm text-background/70'>
                {exploreLinks.map((item) => (
                  <li key={item.label}>
                    <Link className='hover:text-background' href={item.href}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className='lg:ml-auto lg:w-full lg:max-w-50'>
              <h3 className='text-sm font-semibold'>Help</h3>
              <ul className='mt-4 space-y-3 text-sm text-background/70'>
                {helpLinks.map((item) => (
                  <li key={item.label}>
                    <Link className='hover:text-background' href={item.href}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
