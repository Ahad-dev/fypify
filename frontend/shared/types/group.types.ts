/**
 * Group Types
 * Matching backend DTOs for groups, invites, and members
 */

import { User } from './auth.types';

// ============ Group Member ============

export interface GroupMember {
  studentId: string;
  studentName: string;
  studentEmail: string;
  isLeader: boolean;
  joinedAt: string;
}

// ============ Group ============

export interface Group {
  id: string;
  name: string;
  leader: User | null;
  members: GroupMember[];
  memberCount: number;
  hasProject: boolean;
  projectId: string | null;
  createdAt: string;
}

// ============ Group Invite ============

export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED';

export interface GroupInvite {
  id: string;
  groupId: string;
  groupName: string;
  inviterId: string;
  inviterName: string;
  inviteeId: string;
  inviteeName: string;
  inviteeEmail: string;
  status: InviteStatus;
  message: string | null;
  createdAt: string;
  respondedAt: string | null;
  expiresAt: string;
}

// ============ Request DTOs ============

export interface CreateGroupRequest {
  name: string;
  inviteMemberIds?: string[];
}

export interface UpdateGroupRequest {
  name?: string;
}

export interface SendInviteRequest {
  inviteeEmail: string;
  message?: string;
}

export interface InviteResponseRequest {
  accept: boolean;
}

// ============ Available Student (for invite search) ============

export interface AvailableStudent {
  id: string;
  fullName: string;
  email: string;
}
