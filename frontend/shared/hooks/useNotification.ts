import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/shared/services';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { PaginationParams } from '@/shared/types/api.types';
import { toast } from 'sonner';

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
 * Hook to get unread notifications
 */
export function useUnreadNotifications() {
  return useQuery({
    queryKey: QUERY_KEYS.notifications.unread(),
    queryFn: notificationService.getUnreadNotifications,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Poll every minute
  });
}

/**
 * Hook to get notification counts
 */
export function useNotificationCounts() {
  return useQuery({
    queryKey: QUERY_KEYS.notifications.count(),
    queryFn: notificationService.getNotificationCounts,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Poll every minute
  });
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
