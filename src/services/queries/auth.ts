// src/services/queries/auth.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';

import { api, AUTH_TOKEN_EVENT, authTokenStorage } from '@/services/api/axios';
import type {
  ApiErrorResponse,
  LoginRequest,
  LoginResponse,
  ProfileResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from '@/types/auth';

export const authQueryKeys = {
  profile: ['auth', 'profile'] as const,
};

const CART_QUERY_KEY = ['cart'] as const;

// ---------------- error helpers ----------------
export const getApiErrorMessage = (err: unknown): string => {
  const fallback = 'Something went wrong. Please try again.';
  if (!axios.isAxiosError(err)) return fallback;

  const data = err.response?.data as ApiErrorResponse | undefined;

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if (Array.isArray(data?.errors) && typeof data.errors[0] === 'string') {
    const first = data.errors[0].trim();
    if (first) return first;
  }

  return fallback;
};

export const getApiErrorList = (err: unknown): string[] => {
  if (!axios.isAxiosError(err)) return [];

  const data = err.response?.data as ApiErrorResponse | undefined;
  if (!data) return [];

  if (Array.isArray(data.errors)) {
    return data.errors
      .filter((x): x is string => typeof x === 'string')
      .map((x) => x.trim())
      .filter(Boolean);
  }

  return [];
};

// Backward-compatible helper (dipakai ProfileForm.tsx)
export const authQueryHelpers = {
  authQueryKeys,
  getApiErrorMessage,
  getApiErrorList,
};

// ---------------- API calls ----------------
export const fetchProfile = async (): Promise<ProfileResponse> => {
  const res = await api.get<ProfileResponse>('/api/auth/profile');
  return res.data;
};

const loginApi = async (payload: LoginRequest): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>('/api/auth/login', payload);
  return res.data;
};

const registerApi = async (
  payload: RegisterRequest
): Promise<RegisterResponse> => {
  const res = await api.post<RegisterResponse>('/api/auth/register', payload);
  return res.data;
};

const appendIfString = (fd: FormData, key: string, value: unknown) => {
  if (typeof value === 'string' && value.trim()) {
    fd.append(key, value);
  }
};

const appendIfFiniteNumber = (fd: FormData, key: string, value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    fd.append(key, String(value));
  }
};

const buildUpdateProfileFormData = (
  payload: UpdateProfileRequest
): FormData => {
  const fd = new FormData();

  appendIfString(fd, 'name', payload.name);
  appendIfString(fd, 'email', payload.email);
  appendIfString(fd, 'phone', payload.phone);

  if (payload.avatar instanceof File) {
    fd.append('avatar', payload.avatar);
  }

  // coordinates (multipart expects string)
  appendIfFiniteNumber(fd, 'latitude', payload.latitude);
  appendIfFiniteNumber(fd, 'longitude', payload.longitude);

  return fd;
};

const ensureNonEmptyFormData = (fd: FormData) => {
  // If nothing appended, stop early with consistent message.
  if ([...fd.keys()].length === 0) {
    throw new Error(
      'No fields to update. Please provide name, email, phone, or avatar file.'
    );
  }
};

const updateProfileApi = async (
  payload: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
  const formData = buildUpdateProfileFormData(payload);
  ensureNonEmptyFormData(formData);

  const res = await api.put<UpdateProfileResponse>(
    '/api/auth/profile',
    formData,
    {
      // keep explicit for safety; axios will set boundary properly
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );

  return res.data;
};

// ---------------- token extraction (NO any) ----------------
const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

const pickString = (
  obj: Record<string, unknown>,
  key: string
): string | null => {
  const v = obj[key];
  return typeof v === 'string' && v.trim() ? v : null;
};

/**
 * Extract token from auth response defensively.
 * Because different backends love different field names.
 */
const extractTokenFromAuthResponse = (res: unknown): string | null => {
  if (!isObject(res)) return null;

  const direct =
    pickString(res, 'token') ??
    pickString(res, 'accessToken') ??
    pickString(res, 'access_token');

  if (direct) return direct;

  const data = res['data'];
  if (!isObject(data)) return null;

  return (
    pickString(data, 'token') ??
    pickString(data, 'accessToken') ??
    pickString(data, 'access_token')
  );
};

// ---------------- Reactive token state ----------------
const useAuthTokenState = (): boolean => {
  const [hasToken, setHasToken] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(authTokenStorage.get());
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sync = () => setHasToken(Boolean(authTokenStorage.get()));

    sync();
    window.addEventListener(AUTH_TOKEN_EVENT, sync);

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'access_token') sync();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener(AUTH_TOKEN_EVENT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return hasToken;
};

export const useProfileQuery = () => {
  const hasToken = useAuthTokenState();

  return useQuery({
    queryKey: authQueryKeys.profile,
    queryFn: fetchProfile,
    enabled: typeof window !== 'undefined' && hasToken,
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

// ---------------- MUTATIONS ----------------
export const useLoginMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      payload: LoginRequest;
      rememberMe: boolean;
    }) => {
      const res = await loginApi(vars.payload);

      const token = extractTokenFromAuthResponse(res);
      if (!token) {
        throw new Error('Login succeeded but token is missing in response.');
      }

      authTokenStorage.set(token, vars.rememberMe);
      return res;
    },
    onSuccess: () => {
      // After token set, re-enable profile & refresh server-state that needs auth
      qc.invalidateQueries({ queryKey: authQueryKeys.profile });
      qc.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

export const useRegisterMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      payload: RegisterRequest;
      rememberMe: boolean;
    }) => {
      const res = await registerApi(vars.payload);

      const token = extractTokenFromAuthResponse(res);
      if (token) {
        authTokenStorage.set(token, vars.rememberMe);
      }

      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: authQueryKeys.profile });
      qc.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

export const useUpdateProfileMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) => updateProfileApi(payload),
    onSuccess: (res) => {
      // 1) Update cache immediately (fast UI)
      qc.setQueryData<ProfileResponse>(authQueryKeys.profile, (prev) => {
        if (!prev || !prev.success) {
          return { success: true, message: res.message, data: res.data };
        }
        return { ...prev, message: res.message, data: res.data };
      });

      // 2) Also invalidate to ensure any dependent UI gets fresh data
      qc.invalidateQueries({ queryKey: authQueryKeys.profile });
    },
  });
};
