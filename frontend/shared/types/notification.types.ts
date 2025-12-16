/**
 * Notification Types
 * Matching backend DTOs for notifications
 */

// ============ Notification Type ============

export type NotificationType = 
  | 'PROJECT_REGISTERED'
  | 'PROJECT_APPROVED'
  | 'PROJECT_REJECTED'
  | 'GROUP_INVITE'
  | 'GROUP_INVITE_ACCEPTED'
  | 'GROUP_INVITE_DECLINED'
  | 'SUPERVISOR_ASSIGNED'
  | 'MILESTONE_DUE'
  | 'TASK_ASSIGNED'
  | 'MEETING_SCHEDULED'
  | 'SUBMISSION_REMINDER'
  | 'ANNOUNCEMENT'
  | 'SYSTEM';

// ============ Notification ============

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

// ============ Request DTOs ============

export interface MarkReadRequest {
  notificationIds: string[];
}

// ============ Notification Counts ============

export interface NotificationCounts {
  total: number;
  unread: number;
}
