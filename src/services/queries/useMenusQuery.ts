import { api } from '@/services/api/axios';
import { isApiSuccessResponse } from '@/types/auth';
import type { ApiResponse, RestaurantDetail } from '@/types/restaurant';
import { useQuery } from '@tanstack/react-query';

type Params = {
  id: number;
  limitMenu?: number;
  limitReview?: number;
};

const fetchRestaurantDetail = async ({
  id,
  limitMenu,
  limitReview,
}: Params) => {
  const res = await api.get<ApiResponse<RestaurantDetail>>(`/api/resto/${id}`, {
    params: {
      limitMenu,
      limitReview,
    },
  });

  const payload = res.data;

  if (!isApiSuccessResponse(payload)) {
    // Normalisasi error agar React Query error boundary bisa handle
    throw new Error(payload.message ?? 'Failed to fetch restaurant detail');
  }

  return payload.data;
};

export const useMenusQuery = ({ id, limitMenu, limitReview }: Params) => {
  return useQuery({
    queryKey: ['restaurant-detail', id, limitMenu ?? null, limitReview ?? null],
    queryFn: () => fetchRestaurantDetail({ id, limitMenu, limitReview }),
    enabled: Number.isFinite(id),
  });
};
