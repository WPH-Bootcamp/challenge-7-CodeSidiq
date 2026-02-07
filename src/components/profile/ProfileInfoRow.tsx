type ProfileInfoRowProps = {
  label: string;
  value?: string | null;
};

export const ProfileInfoRow = ({ label, value }: ProfileInfoRowProps) => {
  const displayValue = value && value.trim().length > 0 ? value : '-';

  return (
    <div className='flex items-center justify-between gap-10 py-2'>
      <span className='text-sm text-muted-foreground'>{label}</span>
      <span className='text-sm font-semibold text-foreground'>
        {displayValue}
      </span>
    </div>
  );
};
