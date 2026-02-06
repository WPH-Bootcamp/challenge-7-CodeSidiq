// src/services/queries/auth.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { api, authTokenStorage } from '@/services/api/axios';
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

/**
 * IMPORTANT:
 * Keep backward-compatible exports used by existing auth UI:
 * - authQueryKeys
 * - fetchProfile
 * - getApiErrorMessage
 */

// -------------------- Query Keys (exported) --------------------
export const authQueryKeys = {
  profile: ['auth', 'profile'] as const,
};

// -------------------- Error helpers (exported) --------------------
export function getApiErrorMessage(err: unknown): string {
  const fallback = 'Something went wrong. Please try again.';
  if (!axios.isAxiosError(err)) return fallback;

  const data = err.response?.data as ApiErrorResponse | undefined;

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message;
  }

  // fallback to first error item if present
  if (Array.isArray(data?.errors) && typeof data.errors[0] === 'string') {
    const first = data.errors[0].trim();
    if (first) return first;
  }

  return fallback;
}

export function getApiErrorList(err: unknown): string[] {
  if (!axios.isAxiosError(err)) return [];
  const data = err.response?.data as ApiErrorResponse | undefined;
  return Array.isArray(data?.errors) ? data.errors : [];
}

// -------------------- API functions (exported where needed) --------------------
export async function fetchProfile(): Promise<ProfileResponse> {
  const res = await api.get<ProfileResponse>('/api/auth/profile');
  return res.data;
}

async function loginApi(payload: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/api/auth/login', payload);
  return res.data;
}

async function registerApi(
  payload: RegisterRequest
): Promise<RegisterResponse> {
  const res = await api.post<RegisterResponse>('/api/auth/register', payload);
  return res.data;
}

async function updateProfileApi(
  payload: UpdateProfileRequest
): Promise<UpdateProfileResponse> {
  const formData = new FormData();

  if (typeof payload.name === 'string') formData.append('name', payload.name);
  if (typeof payload.email === 'string')
    formData.append('email', payload.email);
  if (typeof payload.phone === 'string')
    formData.append('phone', payload.phone);

  if (payload.avatar instanceof File) {
    formData.append('avatar', payload.avatar);
  }

  const res = await api.put<UpdateProfileResponse>(
    '/api/auth/profile',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return res.data;
}

// -------------------- Hooks --------------------
export function useProfileQuery() {
  const token = authTokenStorage.get();

  return useQuery({
    queryKey: authQueryKeys.profile,
    queryFn: fetchProfile,
    enabled: typeof window !== 'undefined' && Boolean(token),
    staleTime: 30_000,

    // stop request spam while debugging / token invalid
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: (payload: LoginRequest) => loginApi(payload),

    /**
     * IMPORTANT (A2.5):
     * Do NOT store token here because:
     * - "Remember Me" lives in UI
     * - Token storage should be single-source in LoginForm (MVP)
     */
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterRequest) => registerApi(payload),
    onSuccess: (data) => {
      // NOTE: This is A3 behavior (auto-login after register)
      authTokenStorage.set(data.data.token, true);
    },
  });
}

export function useUpdateProfileMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) => updateProfileApi(payload),
    onSuccess: (res) => {
      qc.setQueryData<ProfileResponse>(authQueryKeys.profile, (prev) => {
        if (!prev || !prev.success) {
          return { success: true, message: res.message, data: res.data };
        }
        return { ...prev, message: res.message, data: res.data };
      });
    },
  });
}

// Optional convenience export (so you can use both styles)
export const authQueryHelpers = {
  getApiErrorMessage,
  getApiErrorList,
};
