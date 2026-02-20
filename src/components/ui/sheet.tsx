// src/components/ui/sheet.tsx
'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      // token-based overlay (no hard-coded colors)
      'fixed inset-0 z-50 bg-foreground/60',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
      className
    )}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

type SheetContentProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> & {
  side?: 'top' | 'bottom' | 'left' | 'right';
};

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ side = 'right', className, children, ...props }, ref) => {
  const sideClasses: Record<NonNullable<SheetContentProps['side']>, string> = {
    top: cn(
      'inset-x-0 top-0 border-b border-border',
      'data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top'
    ),
    bottom: cn(
      'inset-x-0 bottom-0 border-t border-border',
      'data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom'
    ),
    left: cn(
      'inset-y-0 left-0 h-full w-3/4 border-r border-border sm:max-w-sm',
      'data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left'
    ),
    right: cn(
      'inset-y-0 right-0 h-full w-3/4 border-l border-border sm:max-w-sm',
      'data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right'
    ),
  };

  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed z-50 bg-background text-foreground shadow-lg outline-none',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=open]:duration-300 data-[state=closed]:duration-200',
          sideClasses[side],
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </SheetPortal>
  );
});
SheetContent.displayName = DialogPrimitive.Content.displayName;

const SheetTitle = DialogPrimitive.Title;
const SheetDescription = DialogPrimitive.Description;

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
};
