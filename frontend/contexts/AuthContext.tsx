'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { gsap } from 'gsap';
import Image from 'next/image';
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
  isFypCommittee: boolean;
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
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state after hydration to avoid SSR mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch current user query - only enable after mounting to avoid hydration issues
  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: QUERY_KEYS.auth.me(),
    queryFn: authService.getCurrentUser,
    enabled: isMounted && tokenStorage.hasToken(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Helper function to get role-based dashboard path
  const getRoleDashboardPath = (role: string) => {
    switch (role) {
      case 'ADMIN': return '/admin/dashboard';
      case 'SUPERVISOR': return '/supervisor/dashboard';
      case 'STUDENT': return '/student/dashboard';
      case 'FYP_COMMITTEE': return '/committee/fyp/dashboard';
      default: return '/dashboard';
    }
  };

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.auth.me(), data.user);
      toast.success('Welcome back!');
      router.push(getRoleDashboardPath(data.user.role));
    },
    onError: (error: Error) => {
      console.log(error);
      toast.error(error.message || 'Login failed. Please try again.');
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.auth.me(), data.user);
      toast.success('Account created successfully!');
      router.push(getRoleDashboardPath(data.user.role));
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
    // Don't run until mounted to avoid hydration issues
    if (!isMounted) return;

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
      router.push(getRoleDashboardPath(user.role));
      return;
    }
  }, [user, userError, isUserLoading, pathname, router, queryClient, isInitialized, isMounted]);

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
    (roles: string[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  // Computed values
  const isAuthenticated = !!user;
  const isLoading = isUserLoading || loginMutation.isPending || registerMutation.isPending;
  const isAdmin = user?.role === 'ADMIN';
  const isSupervisor = user?.role === 'SUPERVISOR' || isAdmin;
  const isStudent = user?.role === 'STUDENT';
  const isFypCommittee = user?.role === 'FYP_COMMITTEE';

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
      isFypCommittee,
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
      isFypCommittee,
    ]
  );

  // Show nothing until mounted and initialized to prevent hydration mismatch
  if (!isMounted || (!isInitialized && tokenStorage.hasToken())) {
    return <LoadingScreen />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Enhanced Loading Screen Component with GSAP animations
function LoadingScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial setup
      gsap.set([logoRef.current, titleRef.current, subtitleRef.current], {
        opacity: 0,
        y: 20,
      });

      // Main timeline
      const tl = gsap.timeline();

      // Animate logo
      tl.to(logoRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
      })
        // Animate title
        .to(
          titleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power3.out',
          },
          '-=0.3'
        )
        // Animate subtitle
        .to(
          subtitleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power3.out',
          },
          '-=0.2'
        );

      // Floating animation for logo
      gsap.to(logoRef.current, {
        y: -8,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay: 0.6,
      });

      // Animate loading dots
      if (dotsRef.current) {
        const dots = dotsRef.current.children;
        gsap.to(dots, {
          y: -6,
          duration: 0.4,
          stagger: 0.15,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-neutral-50 via-primary-extra-light to-secondary-light overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center">
        {/* Logo */}
        <div
          ref={logoRef}
          className="inline-flex items-center justify-center w-24 h-24 mb-6"
        >
          <Image
            src="/Logo.png"
            alt="FYPIFY Logo"
            width={96}
            height={96}
            className="drop-shadow-xl"
            priority
          />
        </div>

        {/* Title */}
        <h1
          ref={titleRef}
          className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-dark to-secondary bg-clip-text text-transparent mb-3"
        >
          FYPIFY
        </h1>

        {/* Subtitle */}
        <p ref={subtitleRef} className="text-neutral-500 mb-6">
          Final Year Project Management
        </p>

        {/* Loading dots */}
        <div ref={dotsRef} className="flex items-center justify-center gap-2">
          <span className="w-2.5 h-2.5 bg-primary rounded-full" />
          <span className="w-2.5 h-2.5 bg-primary/70 rounded-full" />
          <span className="w-2.5 h-2.5 bg-primary/40 rounded-full" />
        </div>
      </div>
    </div>
  );
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
