// src/components/common/NotAvailableYet.tsx
import Link from 'next/link';

type Cta = {
  label: string;
  href: string;
};

type Props = {
  title: string;
  description: string;
  primaryCta: Cta;
  secondaryCta?: Cta;
};

export const NotAvailableYet = ({
  title,
  description,
  primaryCta,
  secondaryCta,
}: Props) => {
  return (
    <div className='rounded-xl border bg-white p-8'>
      <h2 className='text-lg font-semibold'>{title}</h2>
      <p className='mt-2 text-sm text-muted-foreground'>{description}</p>

      <div className='mt-6 flex flex-wrap gap-3'>
        <Link
          className='rounded-md border px-4 py-2 text-sm'
          href={primaryCta.href}
        >
          {primaryCta.label}
        </Link>

        {secondaryCta ? (
          <Link
            className='rounded-md border px-4 py-2 text-sm'
            href={secondaryCta.href}
          >
            {secondaryCta.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
};
