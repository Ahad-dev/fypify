/**
 * FYP Committee Types
 * Matching backend DTOs for committee operations
 */

import { User } from './auth.types';

// ============ Deadline Batch ============

export interface DeadlineBatch {
  id: string;
  name: string;
  description: string | null;
  appliesFrom: string;
  appliesUntil: string | null;
  isActive: boolean;
  createdBy: User | null;
  deadlines: ProjectDeadline[];
  createdAt: string;
  updatedAt: string;
}

// ============ Project Deadline ============

export interface ProjectDeadline {
  id: string;
  documentTypeId: string;
  documentTypeTitle: string;
  documentTypeCode: string;
  deadlineDate: string;
  sortOrder: number;
  isPast: boolean;
  isApproaching: boolean;
}

// ============ Request DTOs ============

export interface ApproveProjectRequest {
  supervisorId: string;
  deadlineBatchId?: string;
  comments?: string;
}

export interface RejectProjectRequest {
  reason: string;
}

export interface DeadlineItem {
  documentTypeId: string;
  deadlineDate: string;
}

export interface CreateDeadlineBatchRequest {
  name: string;
  description?: string;
  appliesFrom: string;
  appliesUntil?: string;
  deadlines: DeadlineItem[];
}

// ============ Supervisor for Selection ============

export interface SupervisorOption {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
}
