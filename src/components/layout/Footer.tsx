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

const Footer = ({ className }: FooterProps) => {
  return (
    <footer className={cn('w-full bg-foreground text-background', className)}>
      <div
        className={cn(
          'mx-auto w-full max-w-360 px-6 xl:px-30',
          // vertical spacing: clamp(min, fluid, max) in rem
          'py-[clamp(2.5rem,6vw,5rem)]'
        )}
      >
        {/* Desktop: 3 columns. Mobile: brand on top, links as 2-column grid */}
        <div className='grid gap-[clamp(2rem,5vw,3rem)] lg:grid-cols-3 lg:items-start'>
          {/* Brand */}
          <div className='max-w-[24rem]'>
            <div className='flex items-center gap-3'>
              <Image
                src='/assets/icons/logo.svg'
                alt='Foody logo'
                width={32}
                height={32}
              />
              <span className='text-2xl font-semibold leading-none'>Foody</span>
            </div>

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
                  <Image src={item.src} alt={item.alt} width={40} height={40} />
                </Link>
              ))}
            </div>
          </div>

          {/* Links wrapper:
              - Mobile: 2 columns (Explore + Help) on sm and up
              - Very small screens (< sm): stack 1 column
              - Desktop: these occupy col 2 and 3 naturally */}
          <div className='grid gap-[clamp(1.5rem,4vw,2rem)] min-[420px]:grid-cols-2 lg:col-span-2 lg:grid-cols-2'>
            {/* Explore */}
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

            {/* Help */}
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
