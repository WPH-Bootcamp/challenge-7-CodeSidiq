// src/types/cart.ts

import type { Menu } from '@/types/restaurant';

// Generic API response types (local to cart domain)
export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export const isApiSuccess = <T>(
  res: ApiResponse<T>
): res is ApiSuccessResponse<T> => {
  return res.success === true;
};

export type CartRestaurant = {
  id: number;
  name: string;
  logo: string;
};

export type CartItem = {
  id: number; // cart item id for PUT/DELETE /api/cart/{id}
  menu: Menu;
  quantity: number;
  itemTotal: number;
};

export type CartRestaurantGroup = {
  restaurant: CartRestaurant;
  items: CartItem[];
  subtotal: number;
};

export type CartSummary = {
  totalItems: number;
  totalPrice: number;
  restaurantCount: number;
};

export type CartData = {
  cart: CartRestaurantGroup[];
  summary: CartSummary;
};

// Endpoints
export type GetCartResponse = ApiResponse<CartData>;

export type AddToCartPayload = {
  restaurantId: number;
  menuId: number;
  quantity: number;
};

export type AddToCartResponse = ApiResponse<{
  cartItem: CartItem & { restaurant: CartRestaurant };
}>;

export type UpdateCartItemPayload = {
  quantity: number;
};

export type UpdateCartItemResponse = ApiResponse<{
  cartItem: CartItem & { restaurant: CartRestaurant };
}>;

export type DeleteCartItemResponse = ApiResponse<unknown>;
export type ClearCartResponse = ApiResponse<unknown>;
