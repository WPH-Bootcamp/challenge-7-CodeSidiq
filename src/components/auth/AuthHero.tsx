// src/components/auth/AuthHero.tsx
import Image from 'next/image';

export const AuthHero = () => {
  return (
    <section className='relative hidden md:block'>
      <Image
        src='/assets/images/hero.svg'
        alt='Food hero'
        fill
        priority
        className='object-cover'
      />
    </section>
  );
};
