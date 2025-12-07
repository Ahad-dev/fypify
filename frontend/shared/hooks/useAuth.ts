"use client";

import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { LoginRequest, AuthResponse, ApiResponse } from "../types/api.types";
import { useAuth } from "@/contexts/AuthContext";

export const useLogin = (): UseMutationResult<
  ApiResponse<AuthResponse>,
  Error,
  LoginRequest
> => {
  const { login: authLogin } = useAuth();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      const { accessToken, refreshToken, userId, name, email, role } = data.data;
        
      // Store tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // Update auth context
      authLogin({
        id: userId,
        name,
        email,
        role,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },
  });
};

export const useLogout = () => {
  const { logout: authLogout } = useAuth();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      authLogout();
    },
  });
};
