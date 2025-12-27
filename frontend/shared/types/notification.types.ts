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
  | 'GROUP_INVITE_RECEIVED'
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

export interface NotificationPayload {
  title?: string;
  message?: string;
  project_id?: string;
  project_title?: string;
  group_id?: string;
  group_name?: string;
  reason?: string;
  inviter_name?: string;
  supervisor_name?: string;
  [key: string]: any;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  typeDisplay?: string;
  title: string | null;
  message: string | null;
  payload?: NotificationPayload;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  isRead: boolean;
  readAt?: string | null;
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
