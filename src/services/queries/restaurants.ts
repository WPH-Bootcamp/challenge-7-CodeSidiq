// src/services/queries/restaurants.ts
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { api } from '@/services/api/axios';
import type { ApiErrorResponse, ApiSuccessResponse } from '@/types/auth';
import type {
  BestSellerRestaurantsData,
  GetBestSellerRestaurantsParams,
  GetRestaurantDetailParams,
  GetRestaurantsParams,
  RecommendedRestaurantsData,
  RestaurantDetail,
  RestaurantsListData,
  SearchRestaurantsData,
  SearchRestaurantsParams,
} from '@/types/restaurant';

export const restaurantQueryKeys = {
  restaurants: (params?: GetRestaurantsParams) =>
    [
      'restaurants',
      params?.location ?? '',
      params?.range ?? null,
      params?.priceMin ?? null,
      params?.priceMax ?? null,
      params?.rating ?? null,
      params?.category ?? '',
      params?.page ?? 1,
      params?.limit ?? 20,
    ] as const,

  // ✅ key khusus infinite (tanpa page supaya stable)
  restaurantsInfinite: (params?: Omit<GetRestaurantsParams, 'page'>) =>
    [
      'restaurants',
      'infinite',
      params?.location ?? '',
      params?.range ?? null,
      params?.priceMin ?? null,
      params?.priceMax ?? null,
      params?.rating ?? null,
      params?.category ?? '',
      params?.limit ?? 20,
    ] as const,

  restaurantDetail: (id: number) => ['restaurant', id] as const,
  recommended: () => ['restaurants', 'recommended'] as const,

  bestSeller: (params?: GetBestSellerRestaurantsParams) =>
    [
      'restaurants',
      'best-seller',
      params?.page ?? 1,
      params?.limit ?? 20,
    ] as const,

  search: (params: SearchRestaurantsParams) =>
    [
      'restaurants',
      'search',
      params.q,
      params.page ?? 1,
      params.limit ?? 20,
    ] as const,
};

const getApiErrorMessage = (error: unknown): string => {
  const fallback = 'Unexpected error. Please try again.';
  if (!error || typeof error !== 'object') return fallback;

  const axiosErr = error as AxiosError<ApiErrorResponse>;
  const messageFromServer = axiosErr.response?.data?.message;

  if (
    typeof messageFromServer === 'string' &&
    messageFromServer.trim().length > 0
  ) {
    return messageFromServer;
  }
  if (axiosErr.message && axiosErr.message.trim().length > 0) {
    return axiosErr.message;
  }
  return fallback;
};

const assertSuccess = <TData>(
  response: ApiSuccessResponse<TData> | ApiErrorResponse
): ApiSuccessResponse<TData> => {
  if (response.success) return response;
  throw new Error(response.message || 'Request failed');
};

// ✅ penting: jangan kirim query param kosong yang bikin backend 400
const sanitizeRestaurantsParams = (
  params?: GetRestaurantsParams
): GetRestaurantsParams | undefined => {
  if (!params) return undefined;

  const clean: GetRestaurantsParams = { ...params };

  // location: kalau kosong -> hapus
  if (
    typeof clean.location === 'string' &&
    clean.location.trim().length === 0
  ) {
    delete (clean as Partial<GetRestaurantsParams>).location;
  }

  // category: kalau kosong -> hapus
  if (
    typeof clean.category === 'string' &&
    clean.category.trim().length === 0
  ) {
    delete (clean as Partial<GetRestaurantsParams>).category;
  }

  // range: kalau bukan number valid -> hapus
  if (typeof clean.range !== 'number' || Number.isNaN(clean.range)) {
    delete (clean as Partial<GetRestaurantsParams>).range;
  }

  // page/limit defaults
  if (!clean.page || clean.page < 1) clean.page = 1;
  if (!clean.limit || clean.limit < 1) clean.limit = 20;

  return clean;
};

const fetchRestaurants = async (
  params?: GetRestaurantsParams
): Promise<RestaurantsListData> => {
  try {
    const res = await api.get<
      ApiSuccessResponse<RestaurantsListData> | ApiErrorResponse
    >('/api/resto', { params: sanitizeRestaurantsParams(params) });
    return assertSuccess(res.data).data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
};

const fetchRestaurantDetail = async (
  params: GetRestaurantDetailParams
): Promise<RestaurantDetail> => {
  const { id, limitMenu, limitReview } = params;
  try {
    const res = await api.get<
      ApiSuccessResponse<RestaurantDetail> | ApiErrorResponse
    >(`/api/resto/${id}`, { params: { limitMenu, limitReview } });
    return assertSuccess(res.data).data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
};

const fetchRecommendedRestaurants =
  async (): Promise<RecommendedRestaurantsData> => {
    try {
      const res = await api.get<
        ApiSuccessResponse<RecommendedRestaurantsData> | ApiErrorResponse
      >('/api/resto/recommended');
      return assertSuccess(res.data).data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  };

const fetchBestSellerRestaurants = async (
  params?: GetBestSellerRestaurantsParams
): Promise<BestSellerRestaurantsData> => {
  try {
    const res = await api.get<
      ApiSuccessResponse<BestSellerRestaurantsData> | ApiErrorResponse
    >('/api/resto/best-seller', { params });
    return assertSuccess(res.data).data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
};

const fetchSearchRestaurants = async (
  params: SearchRestaurantsParams
): Promise<SearchRestaurantsData> => {
  try {
    const res = await api.get<
      ApiSuccessResponse<SearchRestaurantsData> | ApiErrorResponse
    >('/api/resto/search', { params });
    return assertSuccess(res.data).data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
};

export const useRestaurantsQuery = (params?: GetRestaurantsParams) => {
  return useQuery({
    queryKey: restaurantQueryKeys.restaurants(params),
    queryFn: () => fetchRestaurants(params),
  });
};

// ✅ NEW: Infinite query buat Show More (pagination)
export const useInfiniteRestaurantsQuery = (
  params?: Omit<GetRestaurantsParams, 'page'>
) => {
  return useInfiniteQuery({
    queryKey: restaurantQueryKeys.restaurantsInfinite(params),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchRestaurants({
        ...params,
        page: Number(pageParam),
      }),
    getNextPageParam: (lastPage) => {
      const current = lastPage.pagination?.page ?? 1;
      const totalPages = lastPage.pagination?.totalPages ?? 1;
      if (current < totalPages) return current + 1;
      return undefined;
    },
  });
};

export const useRestaurantDetailQuery = (params: GetRestaurantDetailParams) => {
  return useQuery({
    queryKey: restaurantQueryKeys.restaurantDetail(params.id),
    queryFn: () => fetchRestaurantDetail(params),
    enabled: Number.isFinite(params.id) && params.id > 0,
  });
};

export const useRecommendedRestaurantsQuery = () => {
  return useQuery({
    queryKey: restaurantQueryKeys.recommended(),
    queryFn: fetchRecommendedRestaurants,
  });
};

export const useBestSellerRestaurantsQuery = (
  params?: GetBestSellerRestaurantsParams
) => {
  return useQuery({
    queryKey: restaurantQueryKeys.bestSeller(params),
    queryFn: () => fetchBestSellerRestaurants(params),
  });
};

export const useSearchRestaurantsQuery = (params: SearchRestaurantsParams) => {
  return useQuery({
    queryKey: restaurantQueryKeys.search(params),
    queryFn: () => fetchSearchRestaurants(params),
    enabled: params.q.trim().length > 0,
  });
};
