import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Simple hook to get current user and role info.
 * Wrapper around useAuthContext for convenience.
 */
export function useUser() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    isAdmin, 
    isSupervisor, 
    isStudent,
    hasRole,
  } = useAuthContext();

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    isSupervisor,
    isStudent,
    hasRole,
    // Convenience getters
    userId: user?.id,
    userRole: user?.role,
    userEmail: user?.email,
    userName: user?.fullName,
  };
}

export default useUser;
