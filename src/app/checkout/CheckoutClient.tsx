// src/app/checkout/CheckoutClient.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import {
  mapCartToCheckoutPayload,
  type CheckoutFormValues,
} from '@/services/adapters/checkout';
import { useProfileQuery } from '@/services/queries/auth';
import {
  useCartQuery,
  useDeleteCartItemMutation,
  useUpdateCartItemMutation,
} from '@/services/queries/cart';
import {
  ordersQueryHelpers,
  useCheckoutMutation,
} from '@/services/queries/orders';

// ✅ adjust these imports if your toast component path/name differs
import { Toast } from '@/components/common/Toast';
import { ToastViewport } from '@/components/common/ToastViewport';

const paymentOptions = [
  {
    value: 'BNI Bank Negara Indonesia',
    label: 'Bank Negara Indonesia',
    icon: '/assets/icons/bni.svg',
  },
  {
    value: 'BRI Bank Rakyat Indonesia',
    label: 'Bank Rakyat Indonesia',
    icon: '/assets/icons/bri.svg',
  },
  {
    value: 'BCA Bank Central Asia',
    label: 'Bank Central Asia',
    icon: '/assets/icons/bca.svg',
  },
  {
    value: 'Mandiri',
    label: 'Mandiri',
    icon: '/assets/icons/mandiri.svg',
  },
] as const;

const formSchema = z.object({
  deliveryAddress: z
    .string()
    .trim()
    .min(10, 'Address is required (min 10 chars).'),
  phone: z.string().trim().min(8, 'Phone is required.'),
  paymentMethod: z.string().trim().min(1, 'Payment method is required.'),
  notes: z.string().trim().optional(),
});

type FieldErrors = Partial<Record<keyof CheckoutFormValues, string>>;

const moneyIdr = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
    value
  );

// Figma desktop content width: 1000px
const PAGE_CONTAINER = 'mx-auto w-full max-w-[1000px]';

// Quantity icons (from public/assets/icons/)
const QTY_ICON_ADD = '/assets/icons/add.svg';
const QTY_ICON_MINUS = '/assets/icons/minus.svg';

// Toast icon (warning/danger)
const TOAST_ICON_DANGER = '/assets/icons/danger.svg';

// Single control point to resize the +/- icons
const ICON_SIZE = 24;

type ToastState =
  | {
      open: true;
      title: string;
      message: string;
    }
  | {
      open: false;
      title?: string;
      message?: string;
    };

const CheckoutClient = () => {
  const router = useRouter();

  const { data: profileRes } = useProfileQuery();
  const profile = profileRes?.data;

  const {
    data: cartData,
    isLoading: isCartLoading,
    isError: isCartError,
    error: cartError,
  } = useCartQuery();

  const updateQty = useUpdateCartItemMutation();
  const deleteItem = useDeleteCartItemMutation();
  const checkout = useCheckoutMutation();

  const [values, setValues] = useState<CheckoutFormValues>({
    deliveryAddress: '',
    phone: '',
    paymentMethod: paymentOptions[0].value,
    notes: '',
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string>('');

  const [pendingUpdateId, setPendingUpdateId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  // Address edit mode (Change button)
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Item action reveal (Remove hidden until row clicked)
  const [activeItemId, setActiveItemId] = useState<number | null>(null);

  // ✅ Toast (component-based)
  const [toast, setToast] = useState<ToastState>({ open: false });

  const closeToast = () => setToast({ open: false });

  const showDangerToast = (message: string, title = 'There was a problem') => {
    setToast({ open: true, title, message });
  };

  const clearServerError = () => setServerError('');

  const isCartEmpty = useMemo(() => {
    const totalItems = cartData?.summary.totalItems ?? 0;
    const groups = cartData?.cart ?? [];
    return totalItems <= 0 || groups.length === 0;
  }, [cartData]);

  const summary = useMemo(() => {
    const subtotal = cartData?.summary.totalPrice ?? 0;

    // UI-only fees (backend returns real pricing after success)
    const deliveryFee = subtotal > 0 ? 10_000 : 0;
    const serviceFee = subtotal > 0 ? 1_000 : 0;

    return {
      subtotal,
      deliveryFee,
      serviceFee,
      totalPrice: subtotal + deliveryFee + serviceFee,
      totalItems: cartData?.summary.totalItems ?? 0,
    };
  }, [cartData]);

  const setField = <K extends keyof CheckoutFormValues>(
    key: K,
    val: CheckoutFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    clearServerError();
  };

  const validate = (): boolean => {
    const parsed = formSchema.safeParse(values);

    if (parsed.success) {
      setErrors({});
      return true;
    }

    const next: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof CheckoutFormValues | undefined;
      if (field) next[field] = issue.message;
    }
    setErrors(next);
    return false;
  };

  /**
   * If address/phone missing AND inputs are hidden, force show inputs + toast.
   * Returns true if it forced edit mode.
   */
  const ensureAddressInputsVisible = (): boolean => {
    const addressMissing = values.deliveryAddress.trim().length < 10;
    const phoneMissing = values.phone.trim().length < 8;

    if (addressMissing || phoneMissing) {
      setIsEditingAddress(true);
      showDangerToast(
        'Delivery address and phone number are required.',
        'Missing required fields'
      );
      return true;
    }
    return false;
  };

  const handleSubmit = async () => {
    clearServerError();

    if (!cartData || isCartEmpty) {
      const msg = 'Your cart is empty.';
      setServerError(msg);
      showDangerToast(msg, 'Cannot checkout');
      return;
    }

    // ✅ If required fields are missing and inputs are hidden, reveal + toast
    if (ensureAddressInputsVisible()) return;

    // ✅ Validate with schema
    if (!validate()) {
      showDangerToast(
        'Please fix the form errors before checkout.',
        'Invalid form'
      );
      return;
    }

    const payload = mapCartToCheckoutPayload(cartData, values);

    try {
      const res = await checkout.mutateAsync(payload);
      const txId = res.data.transaction.transactionId;

      router.push(`/payment-success?tx=${encodeURIComponent(txId)}`);
    } catch (err) {
      const msg = ordersQueryHelpers.getApiErrorMessage(err);
      setServerError(msg);
      showDangerToast(msg, 'Checkout failed');
    }
  };

  // Prefill phone from profile (best effort). Do not overwrite manual edits.
  useEffect(() => {
    if (!profile?.phone) return;

    setValues((prev) => {
      if (prev.phone.trim()) return prev;
      return { ...prev, phone: profile.phone };
    });
  }, [profile?.phone]);

  // Change/Save button behavior for address
  const handleToggleAddressEdit = () => {
    clearServerError();

    if (!isEditingAddress) {
      setIsEditingAddress(true);
      return;
    }

    const trimmed = values.deliveryAddress.trim();
    if (trimmed.length < 10) {
      setErrors((prev) => ({
        ...prev,
        deliveryAddress: 'Please enter a valid address (min 10 chars).',
      }));
      showDangerToast(
        'Please enter a valid delivery address.',
        'Invalid input'
      );
      return;
    }

    const phoneTrimmed = values.phone.trim();
    if (phoneTrimmed.length < 8) {
      setErrors((prev) => ({
        ...prev,
        phone: 'Phone is required.',
      }));
      showDangerToast('Please enter a valid phone number.', 'Invalid input');
      return;
    }

    setIsEditingAddress(false);
  };

  const runItemMutation = async (opts: {
    id: number;
    kind: 'update' | 'delete';
    nextQty?: number;
  }) => {
    clearServerError();

    if (opts.kind === 'update') setPendingUpdateId(opts.id);
    if (opts.kind === 'delete') setPendingDeleteId(opts.id);

    try {
      if (opts.kind === 'update') {
        await updateQty.mutateAsync({ id: opts.id, quantity: opts.nextQty! });
      } else {
        await deleteItem.mutateAsync({ id: opts.id });
        setActiveItemId((prev) => (prev === opts.id ? null : prev));
      }
    } catch (err) {
      const msg = ordersQueryHelpers.getApiErrorMessage(err);
      setServerError(msg);
      showDangerToast(msg, 'Update failed');
    } finally {
      if (opts.kind === 'update') setPendingUpdateId(null);
      if (opts.kind === 'delete') setPendingDeleteId(null);
    }
  };

  const handleDecrease = async (id: number, nextQty: number) =>
    runItemMutation({ id, kind: 'update', nextQty });

  const handleIncrease = async (id: number, nextQty: number) =>
    runItemMutation({ id, kind: 'update', nextQty });

  const handleRemove = async (id: number) =>
    runItemMutation({ id, kind: 'delete' });

  const displayAddress = values.deliveryAddress.trim();
  const displayPhone = values.phone.trim();

  return (
    <main className='w-full bg-muted/30 px-6 pb-16 pt-10 lg:px-16'>
      {/* ✅ Toast (component) */}
      <ToastViewport>
        <Toast
          open={toast.open}
          variant='danger'
          title={toast.open ? toast.title : ''}
          description={toast.open ? toast.message : ''}
          iconSrc={TOAST_ICON_DANGER}
          autoCloseMs={3000}
          onClose={closeToast}
        />
      </ToastViewport>

      <div className={PAGE_CONTAINER}>
        <h1 className='text-3xl font-semibold tracking-tight'>Checkout</h1>

        <div className='mt-8 grid gap-5 lg:grid-cols-[590px_1fr]'>
          {/* LEFT */}
          <div className='space-y-5'>
            {/* Delivery Address */}
            <section className='rounded-2xl border bg-card p-5 shadow-sm'>
              <div className='flex items-start'>
                <div className='min-w-0 max-w-[430px]'>
                  <div className='flex items-center gap-2'>
                    <Image
                      src='/assets/icons/marker-pin-2.svg'
                      alt=''
                      aria-hidden='true'
                      width={32}
                      height={32}
                    />
                    <span className='text-sm font-semibold'>
                      Delivery Address
                    </span>
                  </div>

                  <div className='mt-3 space-y-2 text-sm text-muted-foreground'>
                    {!isEditingAddress ? (
                      <>
                        {displayAddress ? (
                          <p className='text-foreground'>{displayAddress}</p>
                        ) : (
                          <p className='text-muted-foreground'>
                            Please enter your delivery address.
                          </p>
                        )}

                        {displayPhone ? (
                          <p className='text-foreground'>{displayPhone}</p>
                        ) : (
                          <p className='text-muted-foreground'>
                            Please enter your phone number.
                          </p>
                        )}

                        {/* show errors even when not editing */}
                        {errors.deliveryAddress ? (
                          <p className='text-xs text-destructive'>
                            {errors.deliveryAddress}
                          </p>
                        ) : null}
                        {errors.phone ? (
                          <p className='text-xs text-destructive'>
                            {errors.phone}
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <textarea
                          className={cn(
                            'w-full resize-none rounded-xl border bg-background p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring',
                            errors.deliveryAddress
                              ? 'border-destructive'
                              : 'border-input'
                          )}
                          rows={3}
                          value={values.deliveryAddress}
                          onChange={(e) =>
                            setField('deliveryAddress', e.target.value)
                          }
                          placeholder='Jl. Sudirman No. 25, Jakarta Pusat, 10220'
                        />
                        {errors.deliveryAddress ? (
                          <p className='text-xs text-destructive'>
                            {errors.deliveryAddress}
                          </p>
                        ) : null}

                        <input
                          className={cn(
                            'w-full rounded-xl border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring',
                            errors.phone ? 'border-destructive' : 'border-input'
                          )}
                          value={values.phone}
                          onChange={(e) => setField('phone', e.target.value)}
                          placeholder='0812-3456-7890'
                          inputMode='tel'
                        />
                        {errors.phone ? (
                          <p className='text-xs text-destructive'>
                            {errors.phone}
                          </p>
                        ) : null}
                      </>
                    )}
                  </div>

                  <button
                    type='button'
                    onClick={handleToggleAddressEdit}
                    className='mt-[21px] h-10 w-[120px] rounded-full border bg-background text-sm font-medium hover:bg-muted'
                    disabled={checkout.isPending}
                  >
                    {isEditingAddress ? 'Save' : 'Change'}
                  </button>
                </div>

                <div className='flex-1' />
              </div>
            </section>

            {/* Items */}
            <section className='rounded-2xl border bg-card p-5 shadow-sm'>
              <div className='mt-4'>
                {isCartLoading ? (
                  <p className='text-sm text-muted-foreground'>
                    Loading cart...
                  </p>
                ) : isCartError ? (
                  <p className='text-sm text-destructive'>
                    {cartError instanceof Error
                      ? cartError.message
                      : 'Failed to load cart'}
                  </p>
                ) : isCartEmpty ? (
                  <p className='text-sm text-muted-foreground'>
                    Your cart is empty.
                  </p>
                ) : (
                  <div className='space-y-5'>
                    {cartData?.cart.map((group) => (
                      <div key={group.restaurant.id} className='space-y-3'>
                        {/* Restaurant header */}
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <Image
                              src='/assets/icons/restaurant.svg'
                              alt=''
                              aria-hidden='true'
                              width={32}
                              height={32}
                            />
                            <span className='text-sm font-semibold'>
                              {group.restaurant.name}
                            </span>
                          </div>

                          <Link
                            href='/'
                            className='rounded-full border bg-background px-4 py-2 text-xs font-medium hover:bg-muted'
                          >
                            Add item
                          </Link>
                        </div>

                        <div className='space-y-3'>
                          {group.items.map((item) => {
                            const isUpdatingThis =
                              pendingUpdateId === item.id &&
                              updateQty.isPending;
                            const isDeletingThis =
                              pendingDeleteId === item.id &&
                              deleteItem.isPending;

                            const disableItemActions =
                              checkout.isPending ||
                              isUpdatingThis ||
                              isDeletingThis;

                            const isActive = activeItemId === item.id;

                            const toggleActive = () =>
                              setActiveItemId((prev) =>
                                prev === item.id ? null : item.id
                              );

                            return (
                              <div
                                key={item.id}
                                role='button'
                                tabIndex={0}
                                onClick={toggleActive}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    toggleActive();
                                  }
                                }}
                                className={cn(
                                  'flex items-center justify-between gap-4 rounded-2xl bg-background p-3',
                                  'cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring'
                                )}
                              >
                                <div className='flex items-center gap-3'>
                                  <div className='relative h-16 w-16 overflow-hidden rounded-xl bg-muted'>
                                    <Image
                                      src={item.menu.image}
                                      alt={item.menu.foodName}
                                      fill
                                      sizes='64px'
                                      className='object-cover'
                                    />
                                  </div>

                                  <div className='min-w-0'>
                                    <p className='truncate text-sm font-medium'>
                                      {item.menu.foodName}
                                    </p>
                                    <p className='text-sm font-semibold'>
                                      {moneyIdr(item.menu.price)}
                                    </p>
                                  </div>
                                </div>

                                <div className='flex items-center gap-2'>
                                  <button
                                    type='button'
                                    className='inline-flex h-9 w-9 items-center justify-center rounded-full border hover:bg-muted disabled:opacity-60'
                                    disabled={
                                      disableItemActions || item.quantity <= 1
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDecrease(
                                        item.id,
                                        item.quantity - 1
                                      );
                                    }}
                                    aria-label='Decrease quantity'
                                  >
                                    {isUpdatingThis ? (
                                      '…'
                                    ) : (
                                      <Image
                                        src={QTY_ICON_MINUS}
                                        alt=''
                                        aria-hidden='true'
                                        width={ICON_SIZE}
                                        height={ICON_SIZE}
                                      />
                                    )}
                                  </button>

                                  <span className='min-w-6 text-center text-sm font-semibold'>
                                    {item.quantity}
                                  </span>

                                  <button
                                    type='button'
                                    className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60'
                                    disabled={disableItemActions}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleIncrease(
                                        item.id,
                                        item.quantity + 1
                                      );
                                    }}
                                    aria-label='Increase quantity'
                                  >
                                    {isUpdatingThis ? (
                                      '…'
                                    ) : (
                                      <Image
                                        src={QTY_ICON_ADD}
                                        alt=''
                                        aria-hidden='true'
                                        width={ICON_SIZE}
                                        height={ICON_SIZE}
                                      />
                                    )}
                                  </button>

                                  {/* Remove: hidden by default, reveal on row click */}
                                  <button
                                    type='button'
                                    className={cn(
                                      'ml-2 text-xs transition',
                                      'text-muted-foreground hover:text-destructive hover:underline disabled:opacity-60',
                                      isActive
                                        ? 'visible opacity-100'
                                        : 'invisible opacity-0'
                                    )}
                                    aria-hidden={!isActive}
                                    disabled={disableItemActions}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemove(item.id);
                                    }}
                                  >
                                    {isDeletingThis ? 'Removing...' : 'Remove'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <aside>
            <section className='rounded-2xl border bg-card p-5 shadow-sm'>
              <h2 className='text-sm font-semibold'>Payment Method</h2>

              <div className='mt-4 space-y-3'>
                {paymentOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-2xl border bg-background px-4 py-3',
                      values.paymentMethod === opt.value
                        ? 'border-primary'
                        : 'border-input'
                    )}
                  >
                    <div className='flex items-center gap-3'>
                      <div className='relative h-8 w-8 overflow-hidden rounded-lg bg-muted'>
                        <Image
                          src={opt.icon}
                          alt={opt.label}
                          fill
                          sizes='32px'
                          className='object-contain p-1'
                        />
                      </div>
                      <span className='text-sm font-medium'>{opt.label}</span>
                    </div>

                    <input
                      type='radio'
                      name='paymentMethod'
                      value={opt.value}
                      checked={values.paymentMethod === opt.value}
                      onChange={() => setField('paymentMethod', opt.value)}
                      className='h-4 w-4 accent-primary'
                      disabled={checkout.isPending}
                    />
                  </label>
                ))}
              </div>

              <div className='mt-4'>
                <label className='block text-xs font-medium text-muted-foreground'>
                  Notes (optional)
                </label>
                <textarea
                  className='mt-1 w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring'
                  rows={3}
                  value={values.notes ?? ''}
                  onChange={(e) => setField('notes', e.target.value)}
                  placeholder='Please ring the doorbell'
                  disabled={checkout.isPending}
                />
              </div>

              <div className='mt-5 border-t border-dashed pt-5'>
                <h2 className='text-sm font-semibold'>Payment Summary</h2>

                <div className='mt-4 space-y-3 text-sm'>
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground'>
                      Price ( {summary.totalItems} items)
                    </span>
                    <span className='font-medium'>
                      {moneyIdr(summary.subtotal)}
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground'>Delivery Fee</span>
                    <span className='font-medium'>
                      {moneyIdr(summary.deliveryFee)}
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground'>Service Fee</span>
                    <span className='font-medium'>
                      {moneyIdr(summary.serviceFee)}
                    </span>
                  </div>

                  <div className='mt-2 pt-3'>
                    <div className='flex items-center justify-between'>
                      <span className='font-semibold'>Total</span>
                      <span className='text-lg font-semibold'>
                        {moneyIdr(summary.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {serverError ? (
                  <p className='mt-3 text-sm text-destructive'>{serverError}</p>
                ) : null}

                <button
                  type='button'
                  onClick={handleSubmit}
                  disabled={checkout.isPending || isCartLoading || isCartEmpty}
                  className='mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60'
                >
                  {checkout.isPending ? 'Processing...' : 'Buy'}
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default CheckoutClient;
