'use client';

type NotAvailableYetProps = {
  label?: string;
  description?: string;
};

export const NotAvailableYet = ({
  label = 'Not available yet',
  description,
}: NotAvailableYetProps) => {
  return (
    <div className='rounded-2xl border bg-card p-6 text-center'>
      <p className='text-sm font-semibold'>{label}</p>
      {description ? (
        <p className='mt-1 text-xs text-muted-foreground'>{description}</p>
      ) : null}
    </div>
  );
};

export default NotAvailableYet;
