// src/types/review.ts

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: string[];
};

export type ReviewMenuItem = {
  menuId: number;
  menuName: string;
  price: number;
  type: 'food' | 'drink' | string;
  image: string;
  quantity: number;
};

export type ReviewUserSummary = {
  id: number;
  name: string;
  avatar?: string;
};

export type ReviewRestaurantSummary = {
  id: number;
  name: string;
  logo?: string;
};

export type ReviewEntity = {
  id: number;
  star: number;
  comment: string;
  transactionId: string;
  createdAt?: string;
  updatedAt?: string;

  user?: ReviewUserSummary; // when getting restaurant reviews
  restaurant?: ReviewRestaurantSummary; // when creating / updating
  menus: ReviewMenuItem[];
};

export type CreateReviewRequest = {
  transactionId: string;
  restaurantId: number;
  star: number;
  comment: string;
  menuIds: number[];
};

export type CreateReviewResponse = {
  success: true;
  message: string;
  data: {
    review: ReviewEntity;
  };
};

export type UpdateReviewRequest = {
  star: number;
  comment: string;
};

export type UpdateReviewResponse = {
  success: true;
  data: {
    review: {
      id: number;
      star: number;
      comment: string;
      updatedAt: string;
      restaurant: {
        id: number;
        name: string;
      };
    };
  };
};

export type DeleteReviewResponse = {
  success: true;
  message: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type MyReviewItem = {
  id: number;
  star: number;
  comment: string;
  createdAt: string;
  transactionId: string;
  restaurant: {
    id: number;
    name: string;
    logo: string;
  };
  menus: ReviewMenuItem[];
};

export type MyReviewsResponse = {
  success: true;
  data: {
    reviews: MyReviewItem[];
    pagination: Pagination;
  };
};

export type RestaurantReviewItem = {
  id: number;
  star: number;
  comment: string;
  transactionId: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    avatar: string;
  };
  menus: ReviewMenuItem[];
};

export type RestaurantReviewsResponse = {
  success: true;
  data: {
    reviews: RestaurantReviewItem[];
    pagination: Pagination;
  };
};
