import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/shared/services';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import {
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
} from '@/shared/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

/**
 * Hook to get current user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: QUERY_KEYS.auth.me(),
    queryFn: authService.getCurrentUser,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

/**
 * Hook for login
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.auth.me(), data.user);
      toast.success('Welcome back!');
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });
}

/**
 * Hook for registration
 */
export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.auth.me(), data.user);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed');
    },
  });
}

/**
 * Hook for logout
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.clear();
      toast.success('Logged out successfully');
      router.push('/login');
    },
    onError: () => {
      // Still clear and redirect even on error
      queryClient.clear();
      router.push('/login');
    },
  });
}

/**
 * Hook for changing password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authService.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to change password');
    },
  });
}

/**
 * Hook for updating profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => authService.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(QUERY_KEYS.auth.me(), updatedUser);
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}
