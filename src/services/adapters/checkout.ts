// src/services/adapters/checkout.ts

import type { CartData } from '@/types/cart';
import type { CheckoutRequest } from '@/types/order';

export type CheckoutFormValues = {
  deliveryAddress: string;
  phone: string;
  paymentMethod: string;
  notes?: string;
};

/**
 * cartData + formValues -> checkout payload (Swagger contract)
 *
 * Why adapter:
 * - isolates API contract mapping
 * - keeps component clean
 * - testable & traceable
 */
export const mapCartToCheckoutPayload = (
  cartData: CartData,
  form: CheckoutFormValues
): CheckoutRequest => {
  const restaurants = cartData.cart.map((group) => ({
    restaurantId: group.restaurant.id,
    items: group.items.map((item) => ({
      menuId: item.menu.id,
      quantity: item.quantity,
    })),
  }));

  return {
    restaurants,
    deliveryAddress: form.deliveryAddress,
    phone: form.phone,
    paymentMethod: form.paymentMethod,
    ...(form.notes?.trim() ? { notes: form.notes.trim() } : {}),
  };
};
