import api, { ApiResponse } from '@/shared/api/apiHandler';
import {
  Group,
  GroupInvite,
  CreateGroupRequest,
  UpdateGroupRequest,
  SendInviteRequest,
  AvailableStudent,
} from '@/shared/types';
import { PaginatedResponse, PaginationParams } from '@/shared/types/api.types';

const GROUP_ENDPOINTS = {
  GROUPS: '/groups',
  MY_GROUP: '/groups/my-group',
  AVAILABLE_STUDENTS: '/groups/available-students',
  INVITES: '/groups/invites',
  MY_INVITES: '/groups/invites/my-invites',
} as const;

/**
 * Group Service
 * Handles all group-related API calls
 */
export const groupService = {
  // ============ Group CRUD ============

  /**
   * Get all groups (paginated)
   */
  getGroups: async (params?: PaginationParams): Promise<PaginatedResponse<Group>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Group>>>(
      GROUP_ENDPOINTS.GROUPS,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get group by ID
   */
  getGroupById: async (id: string): Promise<Group> => {
    const response = await api.get<ApiResponse<Group>>(
      `${GROUP_ENDPOINTS.GROUPS}/${id}`
    );
    return response.data.data;
  },

  /**
   * Get current user's group
   */
  getMyGroup: async (): Promise<Group | null> => {
    try {
      const response = await api.get<ApiResponse<Group>>(GROUP_ENDPOINTS.MY_GROUP);
      return response.data.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create a new group
   */
  createGroup: async (data: CreateGroupRequest): Promise<Group> => {
    const response = await api.post<ApiResponse<Group>>(
      GROUP_ENDPOINTS.GROUPS,
      data
    );
    return response.data.data;
  },

  /**
   * Update group
   */
  updateGroup: async (id: string, data: UpdateGroupRequest): Promise<Group> => {
    const response = await api.put<ApiResponse<Group>>(
      `${GROUP_ENDPOINTS.GROUPS}/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete group
   */
  deleteGroup: async (id: string): Promise<void> => {
    await api.delete(`${GROUP_ENDPOINTS.GROUPS}/${id}`);
  },

  /**
   * Leave a group
   */
  leaveGroup: async (id: string): Promise<void> => {
    await api.post(`${GROUP_ENDPOINTS.GROUPS}/${id}/leave`);
  },

  // ============ Member Management ============

  /**
   * Remove a member from group
   */
  removeMember: async (groupId: string, memberId: string): Promise<Group> => {
    const response = await api.delete<ApiResponse<Group>>(
      `${GROUP_ENDPOINTS.GROUPS}/${groupId}/members/${memberId}`
    );
    return response.data.data;
  },

  /**
   * Transfer leadership
   */
  transferLeadership: async (groupId: string, newLeaderId: string): Promise<Group> => {
    const response = await api.post<ApiResponse<Group>>(
      `${GROUP_ENDPOINTS.GROUPS}/${groupId}/transfer-leadership`,
      { newLeaderId }
    );
    return response.data.data;
  },

  // ============ Invites ============

  /**
   * Send invite to a student
   */
  sendInvite: async (groupId: string, data: SendInviteRequest): Promise<GroupInvite> => {
    const response = await api.post<ApiResponse<GroupInvite>>(
      `${GROUP_ENDPOINTS.GROUPS}/${groupId}/invites`,
      data
    );
    return response.data.data;
  },

  /**
   * Get pending invites sent by the group
   */
  getGroupInvites: async (groupId: string): Promise<GroupInvite[]> => {
    const response = await api.get<ApiResponse<GroupInvite[]>>(
      `${GROUP_ENDPOINTS.GROUPS}/${groupId}/invites`
    );
    return response.data.data;
  },

  /**
   * Cancel an invite
   */
  cancelInvite: async (inviteId: string): Promise<void> => {
    await api.delete(`${GROUP_ENDPOINTS.INVITES}/${inviteId}`);
  },

  /**
   * Get current user's pending invites
   */
  getMyInvites: async (): Promise<GroupInvite[]> => {
    const response = await api.get<ApiResponse<GroupInvite[]>>(
      GROUP_ENDPOINTS.MY_INVITES
    );
    return response.data.data;
  },

  /**
   * Respond to an invite (accept or decline)
   */
  respondToInvite: async (inviteId: string, accept: boolean): Promise<GroupInvite> => {
    const response = await api.post<ApiResponse<GroupInvite>>(
      `${GROUP_ENDPOINTS.INVITES}/${inviteId}/respond`,
      { accept }
    );
    return response.data.data;
  },

  // ============ Search ============

  /**
   * Search for available students (not in any group)
   */
  searchAvailableStudents: async (search?: string, params?: PaginationParams): Promise<PaginatedResponse<AvailableStudent>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<AvailableStudent>>>(
      GROUP_ENDPOINTS.AVAILABLE_STUDENTS,
      { params: { ...params, search } }
    );
    return response.data.data;
  },
};

export default groupService;
