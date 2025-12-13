'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { UserRole } from '@/shared/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

/**
 * Role-based access guard component.
 * Redirects to fallback path if user doesn't have required role.
 */
export function RoleGuard({
  children,
  allowedRoles,
  fallbackPath = '/dashboard',
}: RoleGuardProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (!allowedRoles.includes(user.role)) {
        router.push(fallbackPath);
      }
    }
  }, [user, isLoading, isAuthenticated, allowedRoles, fallbackPath, router]);

  // Show nothing while checking
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render if user doesn't have role
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Higher-order component for role-based page protection
 */
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[],
  fallbackPath?: string
) {
  return function GuardedComponent(props: P) {
    return (
      <RoleGuard allowedRoles={allowedRoles} fallbackPath={fallbackPath}>
        <Component {...props} />
      </RoleGuard>
    );
  };
}
