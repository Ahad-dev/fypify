'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user, isAdmin, isSupervisor, isStudent, isFypCommittee, isEvalCommittee, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect to role-specific dashboard
      if (isAdmin) {
        router.replace('/admin/dashboard');
      } else if (isFypCommittee) {
        router.replace('/committee/fyp/dashboard');
      } else if (isEvalCommittee) {
        router.replace('/committee/eval/dashboard');
      } else if (isSupervisor) {
        router.replace('/supervisor/dashboard');
      } else if (isStudent) {
        router.replace('/student/dashboard');
      }
    }
  }, [user, isAdmin, isSupervisor, isStudent, isFypCommittee, isEvalCommittee, isLoading, router]);

  // Return null while redirecting - no flash of content
  return null;
}
