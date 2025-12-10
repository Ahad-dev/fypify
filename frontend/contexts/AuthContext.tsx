'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '@/shared/services';
import { tokenStorage } from '@/shared/api/apiHandler';
import { User, LoginRequest, RegisterRequest, AuthState } from '@/shared/types';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';

// Context value type
interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
  isAdmin: boolean;
  isSupervisor: boolean;
  isStudent: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

// Routes accessible only when NOT authenticated
const AUTH_ROUTES = ['/login', '/register'];

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch current user query
  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: QUERY_KEYS.auth.me(),
    queryFn: authService.getCurrentUser,
    enabled: tokenStorage.hasToken(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.auth.me(), data.user);
      toast.success('Welcome back!');
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed. Please try again.');
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.auth.me(), data.user);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed. Please try again.');
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.clear();
      router.push('/login');
      toast.success('Logged out successfully');
    },
    onError: () => {
      // Still clear local state even if API call fails
      queryClient.clear();
      router.push('/login');
    },
  });

  // Listen for auth:logout events from interceptor
  useEffect(() => {
    const handleLogout = () => {
      queryClient.clear();
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [queryClient]);

  // Handle authentication state and redirects
  useEffect(() => {
    const hasToken = tokenStorage.hasToken();
    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

    // Mark as initialized once we've checked
    if (!isInitialized && !isUserLoading) {
      setIsInitialized(true);
    }

    // If no token and trying to access protected route
    if (!hasToken && !isPublicRoute && isInitialized) {
      router.push('/login');
      return;
    }

    // If has token and error fetching user (token invalid)
    if (hasToken && userError && isInitialized) {
      tokenStorage.clearTokens();
      queryClient.clear();
      if (!isPublicRoute) {
        router.push('/login');
      }
      return;
    }

    // If authenticated and trying to access auth routes
    if (user && isAuthRoute) {
      router.push('/dashboard');
      return;
    }
  }, [user, userError, isUserLoading, pathname, router, queryClient, isInitialized]);

  // Auth actions
  const login = useCallback(
    async (credentials: LoginRequest) => {
      await loginMutation.mutateAsync(credentials);
    },
    [loginMutation]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      await registerMutation.mutateAsync(data);
    },
    [registerMutation]
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const refreshUser = useCallback(async () => {
    await refetchUser();
  }, [refetchUser]);

  const hasRole = useCallback(
    (roles: string[]) => authService.hasRole(user ?? null, roles),
    [user]
  );

  // Computed values
  const isAuthenticated = !!user;
  const isLoading = isUserLoading || loginMutation.isPending || registerMutation.isPending;
  const isAdmin = authService.isAdmin(user ?? null);
  const isSupervisor = authService.isSupervisor(user ?? null);
  const isStudent = authService.isStudent(user ?? null);

  // Memoized context value
  const value = useMemo<AuthContextType>(
    () => ({
      user: user ?? null,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
      hasRole,
      isAdmin,
      isSupervisor,
      isStudent,
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
      hasRole,
      isAdmin,
      isSupervisor,
      isStudent,
    ]
  );

  // Show nothing until initialized to prevent flash
  if (!isInitialized && tokenStorage.hasToken()) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-extra-light to-secondary-light">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white mb-4 shadow-xl animate-pulse">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">FYPIFY</h1>
          <p className="text-neutral-500">Loading...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuthContext() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
}

// Export types
export type { AuthContextType };
