'use client';

import { useNotificationsWithToast } from '@/shared/hooks/useNotification';
import { useAuthContext } from '@/contexts';

/**
 * NotificationPoller Component
 * This invisible component handles real-time notification polling.
 * It should be placed in MainLayout to poll for notifications when user is authenticated.
 * Shows toast alerts at bottom-left when new notifications arrive.
 */
export function NotificationPoller() {
  const { isAuthenticated } = useAuthContext();
  
  // Only poll if user is authenticated
  // The hook handles polling internally at 30-second intervals
  const notificationState = useNotificationsWithToast();

  // This component renders nothing - it just activates the polling logic
  return null;
}

export default NotificationPoller;
