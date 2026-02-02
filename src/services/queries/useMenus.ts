import { api } from '@/services/api/axios';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';

export type Menu = {
  id: string | number;
  name: string;
  price: number;
};

type ApiError = {
  message: string;
  status?: number;
  details?: unknown;
};

const MENUS_QUERY_KEY = ['menus'] as const;
const MENUS_PATH = '/api/menu';

const isRecord = (v: unknown): v is Record<string, unknown> => {
  return typeof v === 'object' && v !== null;
};

const pickString = (
  obj: Record<string, unknown>,
  key: string
): string | null => {
  const value = obj[key];
  return typeof value === 'string' ? value : null;
};

const normalizeError = (err: unknown): ApiError => {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<unknown>;

    if (!axiosErr.response) {
      return {
        message:
          'Network error: gagal terhubung ke server. Cek internet/VPN/proxy.',
      };
    }

    const status = axiosErr.response.status;
    const data = axiosErr.response.data;

    let message = `Request failed with status ${status}`;

    if (isRecord(data)) {
      const m1 = pickString(data, 'message');
      const m2 = pickString(data, 'error');
      message = m1 ?? m2 ?? message;
    }

    return {
      message,
      status,
      details: data,
    };
  }

  if (err instanceof Error) {
    return { message: err.message };
  }

  return { message: 'Unknown error: terjadi kesalahan yang tidak dikenali.' };
};

const assertMenusArray = (data: unknown): Menu[] => {
  if (!Array.isArray(data)) {
    throw new Error('Invalid response: menus harus berupa array.');
  }

  return data.map((item, idx) => {
    if (!isRecord(item)) {
      throw new Error(`Invalid item at index ${idx}: bukan object.`);
    }

    const id = item.id;
    const name = item.name;
    const price = item.price;

    if (id === undefined || id === null) {
      throw new Error(`Invalid item at index ${idx}: missing id.`);
    }
    if (typeof name !== 'string') {
      throw new Error(`Invalid item at index ${idx}: name harus string.`);
    }
    if (typeof price !== 'number') {
      throw new Error(`Invalid item at index ${idx}: price harus number.`);
    }

    return { id: id as Menu['id'], name, price };
  });
};

const fetchMenus = async (): Promise<Menu[]> => {
  try {
    const res = await api.get<unknown>(MENUS_PATH);
    return assertMenusArray(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
};

export const useMenus = (): UseQueryResult<Menu[], ApiError> => {
  return useQuery<Menu[], ApiError>({
    queryKey: MENUS_QUERY_KEY,
    queryFn: fetchMenus,
    staleTime: 30_000,
    retry: (failureCount, error) => {
      const status = error.status;
      if (status && status >= 400 && status < 500) return false;
      return failureCount < 2;
    },
  });
};
