// src/types/auth.ts

export type ApiSuccessResponse<TData> = {
  success: true;
  message: string;
  data: TData;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: string[];
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  latitude: number;
  longitude: number;
  createdAt: string; // ISO string
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = ApiSuccessResponse<{
  user: AuthUser;
  token: string;
}>;

export type RegisterRequest = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

export type RegisterResponse = ApiSuccessResponse<{
  user: AuthUser;
  token: string;
}>;

/**
 * Swagger: GET /api/auth/profile
 * data: { id, name, email, phone, avatar, latitude, longitude, createdAt }
 */
export type ProfileResponse = ApiSuccessResponse<AuthUser>;

/**
 * Swagger: PUT /api/auth/profile (multipart/form-data)
 */
export type UpdateProfileRequest = {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: File | null;
};

export type UpdateProfileResponse = ApiSuccessResponse<AuthUser>;

export const isApiSuccessResponse = <T>(
  res: ApiSuccessResponse<T> | ApiErrorResponse
): res is ApiSuccessResponse<T> => {
  return (res as ApiSuccessResponse<T>).data !== undefined;
};
