import { httpPost } from "@/shared/api/http";
import { ApiResponse, LoginRequest, AuthResponse, RefreshTokenRequest } from "@/shared/types/api.types";

export const authService = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    return httpPost<ApiResponse<AuthResponse>, LoginRequest>("/auth/login", credentials);
  },

  refresh: async (refreshToken: string): Promise<ApiResponse<AuthResponse>> => {
    return httpPost<ApiResponse<AuthResponse>, RefreshTokenRequest>("/auth/refresh", {
      refreshToken,
    });
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem("refreshToken");
    await httpPost<void, { refreshToken: string }>("/auth/logout", {
      refreshToken: refreshToken || "",
    });
  },
};
