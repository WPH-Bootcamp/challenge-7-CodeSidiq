// src/services/queries/cart.ts

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { api } from '@/services/api/axios';
import type { AddToCartPayload, CartData, GetCartResponse } from '@/types/cart';
import { isApiSuccess } from '@/types/cart';

export const cartQueryKeys = {
  all: ['cart'] as const,
};

const CART_QUERY_KEY = cartQueryKeys.all;

// ---------- helpers (pure) ----------
const recomputeCart = (cartGroups: CartData['cart']): CartData => {
  const restaurantCount = cartGroups.length;

  const totalItems = cartGroups.reduce((acc, group) => {
    const groupItems = group.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    return acc + groupItems;
  }, 0);

  const totalPrice = cartGroups.reduce((acc, group) => acc + group.subtotal, 0);

  return {
    cart: cartGroups,
    summary: {
      restaurantCount,
      totalItems,
      totalPrice,
    },
  };
};

const updateItemInCache = (
  prev: CartData,
  itemId: number,
  newQuantity: number
): CartData => {
  const nextGroups = prev.cart.map((group) => {
    const nextItems = group.items.map((item) => {
      if (item.id !== itemId) return item;

      const itemTotal = item.menu.price * newQuantity;

      return {
        ...item,
        quantity: newQuantity,
        itemTotal,
      };
    });

    const subtotal = nextItems.reduce((acc, item) => acc + item.itemTotal, 0);

    return {
      ...group,
      items: nextItems,
      subtotal,
    };
  });

  return recomputeCart(nextGroups);
};

const removeItemFromCache = (prev: CartData, itemId: number): CartData => {
  const nextGroups = prev.cart
    .map((group) => {
      const nextItems = group.items.filter((item) => item.id !== itemId);
      const subtotal = nextItems.reduce((acc, item) => acc + item.itemTotal, 0);
      return { ...group, items: nextItems, subtotal };
    })
    .filter((group) => group.items.length > 0);

  return recomputeCart(nextGroups);
};

// ✅ Exported single source of truth for "cart kosong"
export const EMPTY_CART: CartData = recomputeCart([]);

// ---------- shared react-query helpers ----------
const invalidateCart = (qc: ReturnType<typeof useQueryClient>) =>
  qc.invalidateQueries({ queryKey: CART_QUERY_KEY });

const optimisticUpdate = async (
  qc: ReturnType<typeof useQueryClient>,
  updater: (prev: CartData) => CartData
) => {
  await qc.cancelQueries({ queryKey: CART_QUERY_KEY });
  const previous = qc.getQueryData<CartData>(CART_QUERY_KEY);

  if (previous) {
    qc.setQueryData<CartData>(CART_QUERY_KEY, updater(previous));
  }

  return { previous };
};

// ---------- API ----------
const fetchCart = async (): Promise<CartData> => {
  const res = await api.get<GetCartResponse>('/api/cart');
  const body = res.data;

  if (!isApiSuccess(body)) {
    throw new Error(body.message ?? 'Failed to fetch cart');
  }

  return body.data;
};

// ---------- hooks ----------
export const useCartQuery = (
  options?: Omit<
    UseQueryOptions<CartData, Error, CartData, typeof CART_QUERY_KEY>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: fetchCart,
    ...options,
  });
};

export const useAddToCartMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddToCartPayload) => {
      const res = await api.post('/api/cart', payload);
      const body = res.data;

      if (!isApiSuccess(body)) {
        throw new Error(body.message ?? 'Failed to add to cart');
      }

      return body;
    },
    onSuccess: () => {
      invalidateCart(qc);
    },
  });
};

export const useUpdateCartItemMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { id: number; quantity: number }) => {
      const res = await api.put(`/api/cart/${vars.id}`, {
        quantity: vars.quantity,
      });
      const body = res.data;

      if (!isApiSuccess(body)) {
        throw new Error(body.message ?? 'Failed to update cart item');
      }

      return body;
    },
    onMutate: (vars) =>
      optimisticUpdate(qc, (prev) =>
        updateItemInCache(prev, vars.id, vars.quantity)
      ),
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous)
        qc.setQueryData<CartData>(CART_QUERY_KEY, ctx.previous);
    },
    onSuccess: () => {
      invalidateCart(qc);
    },
  });
};

export const useDeleteCartItemMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { id: number }) => {
      const res = await api.delete(`/api/cart/${vars.id}`);
      const body = res.data;

      if (!isApiSuccess(body)) {
        throw new Error(body.message ?? 'Failed to delete cart item');
      }

      return body;
    },
    onMutate: (vars) =>
      optimisticUpdate(qc, (prev) => removeItemFromCache(prev, vars.id)),
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous)
        qc.setQueryData<CartData>(CART_QUERY_KEY, ctx.previous);
    },
    onSuccess: () => {
      invalidateCart(qc);
    },
  });
};

export const useClearCartMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.delete('/api/cart');
      const body = res.data;

      if (!isApiSuccess(body)) {
        throw new Error(body.message ?? 'Failed to clear cart');
      }

      return body;
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previous = qc.getQueryData<CartData>(CART_QUERY_KEY);

      qc.setQueryData<CartData>(CART_QUERY_KEY, EMPTY_CART);

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous)
        qc.setQueryData<CartData>(CART_QUERY_KEY, ctx.previous);
    },
    onSuccess: () => {
      invalidateCart(qc);
    },
  });
};
