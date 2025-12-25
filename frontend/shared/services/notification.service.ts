import api, { ApiResponse } from '@/shared/api/apiHandler';
import {
  Notification,
  NotificationCounts,
  MarkReadRequest,
} from '@/shared/types';
import { PaginatedResponse, PaginationParams } from '@/shared/types/api.types';

const NOTIFICATION_ENDPOINTS = {
  NOTIFICATIONS: '/notifications',
  UNREAD: '/notifications/unread',
  UNREAD_COUNT: '/notifications/unread/count',
  MARK_READ: '/notifications/mark-read',
  MARK_ALL_READ: '/notifications/mark-all-read',
} as const;

/**
 * Notification Service
 * Handles all notification-related API calls
 */
export const notificationService = {
  /**
   * Get all notifications (paginated)
   */
  getNotifications: async (params?: PaginationParams): Promise<PaginatedResponse<Notification>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Notification>>>(
      NOTIFICATION_ENDPOINTS.NOTIFICATIONS,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get unread notifications
   */
  getUnreadNotifications: async (): Promise<Notification[]> => {
    const response = await api.get<ApiResponse<Notification[]>>(
      NOTIFICATION_ENDPOINTS.UNREAD
    );
    return response.data.data;
  },

  /**
   * Get notification counts (unread count)
   */
  getNotificationCounts: async (): Promise<NotificationCounts> => {
    const response = await api.get<ApiResponse<{ count: number }>>(
      NOTIFICATION_ENDPOINTS.UNREAD_COUNT
    );
    // Transform backend response { count: n } to NotificationCounts shape
    return {
      total: response.data.data.count,
      unread: response.data.data.count,
    };
  },

  /**
   * Mark specific notifications as read
   */
  markAsRead: async (data: MarkReadRequest): Promise<void> => {
    await api.post(NOTIFICATION_ENDPOINTS.MARK_READ, data);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    await api.post(NOTIFICATION_ENDPOINTS.MARK_ALL_READ);
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}/${id}`);
  },
};

export default notificationService;
