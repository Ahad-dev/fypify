import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/shared/services';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { PaginationParams } from '@/shared/types/api.types';
import { Notification } from '@/shared/types';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

// ============ Notification Queries ============

/**
 * Hook to get all notifications (paginated)
 */
export function useNotifications(params?: PaginationParams) {
  return useQuery({
    queryKey: QUERY_KEYS.notifications.list(params as Record<string, unknown>),
    queryFn: () => notificationService.getNotifications(params),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to get unread notifications with faster polling
 */
export function useUnreadNotifications() {
  return useQuery({
    queryKey: QUERY_KEYS.notifications.unread(),
    queryFn: notificationService.getUnreadNotifications,
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000, // Poll every 30 seconds for faster updates
  });
}

/**
 * Hook to get notification counts with faster polling
 */
export function useNotificationCounts() {
  return useQuery({
    queryKey: QUERY_KEYS.notifications.count(),
    queryFn: notificationService.getNotificationCounts,
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000, // Poll every 30 seconds
  });
}

/**
 * Hook to get notifications with toast alerts for new notifications.
 * Shows a toast at bottom-left when a new notification arrives.
 */
export function useNotificationsWithToast() {
  const queryClient = useQueryClient();
  const previousCountRef = useRef<number | null>(null);
  const previousNotificationIdsRef = useRef<Set<string>>(new Set());

  const { data: counts, ...countQuery } = useNotificationCounts();
  const { data: notificationsData, ...notificationQuery } = useUnreadNotifications();

  // Safely extract array from response (handles both array and paginated response)
  const notifications = Array.isArray(notificationsData) 
    ? notificationsData 
    : (notificationsData as any)?.content || [];

  // Track new notifications and show toast
  useEffect(() => {
    if (!notifications || !Array.isArray(notifications) || notifications.length === 0) return;

    const currentIds = new Set(notifications.map((n: Notification) => n.id));
    
    // Check for new notifications (IDs not seen before)
    const newNotifications = notifications.filter(
      (n: Notification) => !previousNotificationIdsRef.current.has(n.id)
    );

    // Only show toast if we had previous data (not on initial load)
    if (previousNotificationIdsRef.current.size > 0 && newNotifications.length > 0) {
      // Show toast for each new notification
      newNotifications.forEach((notification: Notification) => {
        toast(notification.title, {
          description: notification.message,
          position: 'bottom-left',
          duration: 5000,
          action: {
            label: 'View',
            onClick: () => {
              // Navigate to notifications or mark as read
              queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
            },
          },
        });
      });

      // Also invalidate related queries to refresh status
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.submissions.all });
    }

    // Update previous IDs ref
    previousNotificationIdsRef.current = currentIds;
    previousCountRef.current = counts?.unread || 0;
  }, [notifications, counts, queryClient]);

  return {
    counts,
    notifications,
    unreadCount: counts?.unread || 0,
    isLoading: countQuery.isLoading || notificationQuery.isLoading,
    refetch: () => {
      countQuery.refetch();
      notificationQuery.refetch();
    },
  };
}

// ============ Notification Mutations ============

/**
 * Hook to mark notifications as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationIds: string[]) =>
      notificationService.markAsRead({ notificationIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || 'Failed to mark as read';
      toast.error(message);
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
      toast.success('All notifications marked as read');
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || 'Failed to mark all as read';
      toast.error(message);
    },
  });
}

/**
 * Hook to delete a notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || 'Failed to delete notification';
      toast.error(message);
    },
  });
}

