// src/components/common/ToastViewport.tsx
'use client';

import { cn } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  /**
   * Default: below navbar (top-24)
   */
  className?: string;
};

export const ToastViewport = ({ children, className }: Props) => {
  return (
    <div
      className={cn(
        'fixed right-6 top-24 z-50',
        'flex flex-col items-end gap-3',
        className
      )}
    >
      {children}
    </div>
  );
};
