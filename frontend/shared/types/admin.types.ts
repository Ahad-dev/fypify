/**
 * Admin Types
 */

import { User, UserRole } from './auth.types';

// ============ Document Types ============

export interface DocumentType {
  id: string;
  code: string;
  title: string;
  description?: string;
  weightSupervisor: number;
  weightCommittee: number;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateDocumentTypeRequest {
  code: string;
  title: string;
  description?: string;
  weightSupervisor: number;
  weightCommittee: number;
  displayOrder?: number;
}

export interface UpdateDocumentTypeRequest {
  code?: string;
  title?: string;
  description?: string;
  weightSupervisor?: number;
  weightCommittee?: number;
  displayOrder?: number;
  isActive?: boolean;
}

// ============ Users (Admin) ============

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}

// ============ Audit Logs ============

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  action: string;
  details: Record<string, unknown>;
  entityType: string;
  entityId: string;
  ipAddress?: string;
  createdAt: string;
}

// ============ System Settings ============

export interface SystemSetting {
  key: string;
  value: Record<string, unknown>;
  updatedAt: string;
}

export interface UpdateSystemSettingRequest {
  key: string;
  value: Record<string, unknown>;
}

// Common setting keys
export const SYSTEM_SETTING_KEYS = {
  GROUP_MIN_SIZE: 'group_min_size',
  GROUP_MAX_SIZE: 'group_max_size',
  MAX_PROPOSALS_PER_GROUP: 'max_proposals_per_group',
  PROPOSAL_DEADLINE: 'proposal_deadline',
  CURRENT_SEMESTER: 'current_semester',
  SUBMISSION_ENABLED: 'submission_enabled',
  PROPOSALS_VISIBLE: 'proposals_visible',
  RESULTS_RELEASED: 'results_released',
} as const;

// Re-export User for admin user management
export type { User, UserRole };
