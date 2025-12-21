/**
 * Project Types
 * Matching backend DTOs for projects
 */

import { User } from './auth.types';
import { Group } from './group.types';

// ============ Project Status ============

export type ProjectStatus = 
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'ARCHIVED';

// ============ Project ============

export interface Project {
  id: string;
  title: string;
  projectAbstract: string;
  domain: string | null;
  proposedSupervisors: string[] | null;
  proposedSupervisorDetails?: User[];
  supervisor: User | null;
  status: ProjectStatus;
  statusDisplay: string;
  approvedBy: User | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  groupId: string | null;
  groupName: string | null;
  group?: Group;
  createdAt: string;
  updatedAt: string;
}

// ============ Request DTOs ============

export interface RegisterProjectRequest {
  groupId: string;
  title: string;
  projectAbstract: string;
  domain?: string;
  proposedSupervisors?: string[];
}

export interface UpdateProjectRequest {
  title?: string;
  projectAbstract?: string;
  domain?: string;
  proposedSupervisors?: string[];
}

export interface ProjectDecisionRequest {
  approve: boolean;
  supervisorId?: string;
  rejectionReason?: string;
}

// ============ Project Statistics ============

export interface ProjectStats {
  [status: string]: number;
}

// ============ Proposed Supervisors  ============
export interface ProposedSupervisor {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}