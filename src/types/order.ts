// src/types/order.ts

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: string[];
};

export type Pricing = {
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  totalPrice: number;
};

export type OrderMenuItem = {
  menuId: number;
  menuName: string;
  price: number;
  image?: string; // exists in GET /api/order/my-order response
  quantity: number;
  itemTotal: number;
};

export type OrderRestaurantInfo = {
  id: number;
  name: string;
  logo: string;
};

export type OrderRestaurantGroup = {
  restaurant: OrderRestaurantInfo;
  items: OrderMenuItem[];
  subtotal: number;
};

export type TransactionStatus =
  | 'preparing'
  | 'on_the_way'
  | 'delivered'
  | 'done'
  | 'canceled'
  | string;

export type Transaction = {
  id: number;
  transactionId: string;
  paymentMethod: string;
  status: TransactionStatus;
  deliveryAddress: string;
  phone: string;
  pricing: Pricing;
  restaurants: OrderRestaurantGroup[];
  createdAt: string;
  updatedAt?: string; // exists in GET /api/order/my-order
};

export type CheckoutRequest = {
  restaurants: Array<{
    restaurantId: number;
    items: Array<{
      menuId: number;
      quantity: number;
    }>;
  }>;
  deliveryAddress: string;
  phone: string;
  paymentMethod: string;
  notes?: string;
};

export type CheckoutResponse = {
  success: true;
  message: string;
  data: {
    transaction: Transaction;
  };
};

export type OrdersQueryParams = {
  status?: string;
  page?: number;
  limit?: number;
};

export type OrdersResponse = {
  success: true;
  data: {
    orders: Transaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filter: {
      status: string;
    };
  };
};
