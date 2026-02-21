// src/types/restaurant.ts

import type { ApiErrorResponse, ApiSuccessResponse } from '@/types/auth';

/**
 * Common / shared domain pieces
 */
export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PriceRange = {
  min: number;
  max: number;
};

export type RestaurantFilters = {
  range: number | null;
  priceMin: number | null;
  priceMax: number | null;
  rating: number | null;
  category: string | null;
};

export type RestaurantListItem = {
  id: number;
  name: string;
  star: number;
  place: string;
  logo: string;
  images: string[];
  category: string;
  reviewCount: number;

  /**
   * Present in GET /api/resto list, but NOT always present in recommended endpoints.
   *  Make optional to support schema variance across endpoints.
   */
  menuCount?: number;

  /**
   * Present in some endpoints (list/search/best-seller), but NOT returned in recommendations.
   *  Optional to avoid forcing fake defaults like {min:0,max:0}.
   */
  priceRange?: PriceRange;

  /**
   * Present in some endpoints (best-seller/search schema) but not always returned
   * in the GET /api/resto sample response. Optional by Swagger behavior variance.
   */
  distance?: number;
};

export type RestaurantsListData = {
  restaurants: RestaurantListItem[];
  pagination: Pagination;
  filters: RestaurantFilters;
};

export type BestSellerRestaurantsData = {
  restaurants: RestaurantListItem[];
  pagination: Pagination;
};

export type SearchRestaurantsData = {
  restaurants: RestaurantListItem[];
  pagination: Pagination;
  searchQuery: string;
};

/**
 * Menu (for detail + sample menus in recommendations)
 */
export type Menu = {
  id: number;
  foodName: string;
  price: number;
  type: string;
  image: string;
};

export type ReviewUserSummary = {
  id: number;
  name: string;
  avatar: string;
};

/**
 * ReviewSummary as requested (used in restaurant detail)
 */
export type ReviewSummary = {
  id: number;
  star: number;
  comment: string;
  createdAt: string; // ISO string
  user: ReviewUserSummary;
};

export type RestaurantCoordinates = {
  lat: number;
  long: number;
};

export type RestaurantDetail = {
  id: number;
  name: string;
  star: number;
  averageRating: number;
  place: string;
  coordinates: RestaurantCoordinates;
  distance: number;
  logo: string;
  images: string[];
  category: string;
  totalMenus: number;
  totalReviews: number;
  menus: Menu[];
  reviews: ReviewSummary[];
};

export type RecommendedRestaurant = {
  id: number;
  name: string;
  star: number;
  place: string;
  lat: number;
  long: number;
  logo: string;
  images: string[];
  category: string;
  reviewCount: number;
  sampleMenus: Menu[];
  isFrequentlyOrdered: boolean;
  distance: number;
};

export type RecommendedRestaurantsData = {
  recommendations: RecommendedRestaurant[];
  message: string;
};

/**
 * API responses (Swagger wrapper)
 */
export type RestaurantsResponse =
  | ApiSuccessResponse<RestaurantsListData>
  | ApiErrorResponse;
export type RestaurantDetailResponse =
  | ApiSuccessResponse<RestaurantDetail>
  | ApiErrorResponse;
export type RecommendedRestaurantsResponse =
  | ApiSuccessResponse<RecommendedRestaurantsData>
  | ApiErrorResponse;
export type BestSellerRestaurantsResponse =
  | ApiSuccessResponse<BestSellerRestaurantsData>
  | ApiErrorResponse;
export type SearchRestaurantsResponse =
  | ApiSuccessResponse<SearchRestaurantsData>
  | ApiErrorResponse;

/**
 * Query params typing (for hooks)
 * Note: Keep types narrow and aligned with Swagger
 */
export type GetRestaurantsParams = {
  location?: string;
  range?: number;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  category?: string;
  page?: number;
  limit?: number;
};

export type GetBestSellerRestaurantsParams = {
  page?: number;
  limit?: number;
};

export type SearchRestaurantsParams = {
  q: string;
  page?: number;
  limit?: number;
};

export type GetRestaurantDetailParams = {
  id: number;
  limitMenu?: number;
  limitReview?: number;
};
// Generic API response helper (for queries)
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
