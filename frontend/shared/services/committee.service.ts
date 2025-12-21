import api, { ApiResponse } from '@/shared/api/apiHandler';
import {
  DeadlineBatch,
  ApproveProjectRequest,
  RejectProjectRequest,
  CreateDeadlineBatchRequest,
  SupervisorOption,
} from '@/shared/types';
import { Project } from '@/shared/types/project.types';
import { PaginatedResponse, PaginationParams } from '@/shared/types/api.types';

const COMMITTEE_ENDPOINTS = {
  // Project Approval
  PENDING_PROJECTS: '/committee/fyp/projects/pending',
  APPROVE_PROJECT: (id: string) => `/committee/fyp/projects/${id}/approve`,
  REJECT_PROJECT: (id: string) => `/committee/fyp/projects/${id}/reject`,
  
  // Deadline Batches
  DEADLINE_BATCHES: '/committee/fyp/deadlines/batches',
  DEADLINE_BATCH: (id: string) => `/committee/fyp/deadlines/batches/${id}`,
  CURRENT_BATCH: '/committee/fyp/deadlines/batches/current',
  DEACTIVATE_BATCH: (id: string) => `/committee/fyp/deadlines/batches/${id}/deactivate`,
  
  // Supervisors
  SUPERVISORS: '/users/supervisors',
} as const;

/**
 * FYP Committee Service
 * Handles all FYP Committee related API calls
 */
export const committeeService = {
  // ============ Pending Projects ============

  /**
   * Get all pending projects awaiting approval (paginated)
   */
  getPendingProjects: async (params?: PaginationParams): Promise<PaginatedResponse<Project>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Project>>>(
      COMMITTEE_ENDPOINTS.PENDING_PROJECTS,
      { params }
    );
    return response.data.data;
  },

  // ============ Project Approval/Rejection ============

  /**
   * Approve a project with supervisor assignment
   */
  approveProject: async (id: string, data: ApproveProjectRequest): Promise<Project> => {
    const response = await api.patch<ApiResponse<Project>>(
      COMMITTEE_ENDPOINTS.APPROVE_PROJECT(id),
      data
    );
    return response.data.data;
  },

  /**
   * Reject a project with reason
   */
  rejectProject: async (id: string, data: RejectProjectRequest): Promise<Project> => {
    const response = await api.patch<ApiResponse<Project>>(
      COMMITTEE_ENDPOINTS.REJECT_PROJECT(id),
      data
    );
    return response.data.data;
  },

  // ============ Deadline Batches ============

  /**
   * Get all deadline batches (paginated)
   */
  getDeadlineBatches: async (params?: PaginationParams): Promise<PaginatedResponse<DeadlineBatch>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<DeadlineBatch>>>(
      COMMITTEE_ENDPOINTS.DEADLINE_BATCHES,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get a specific deadline batch by ID
   */
  getDeadlineBatch: async (id: string): Promise<DeadlineBatch> => {
    const response = await api.get<ApiResponse<DeadlineBatch>>(
      COMMITTEE_ENDPOINTS.DEADLINE_BATCH(id)
    );
    return response.data.data;
  },

  /**
   * Get current active deadline batch
   */
  getCurrentBatch: async (): Promise<DeadlineBatch | null> => {
    try {
      const response = await api.get<ApiResponse<DeadlineBatch>>(
        COMMITTEE_ENDPOINTS.CURRENT_BATCH
      );
      return response.data.data;
    } catch (error: any) {
      // Handle 404 or null response gracefully
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create a new deadline batch
   */
  createDeadlineBatch: async (data: CreateDeadlineBatchRequest): Promise<DeadlineBatch> => {
    const response = await api.post<ApiResponse<DeadlineBatch>>(
      COMMITTEE_ENDPOINTS.DEADLINE_BATCHES,
      data
    );
    return response.data.data;
  },

  /**
   * Deactivate a deadline batch
   */
  deactivateDeadlineBatch: async (id: string): Promise<void> => {
    await api.patch<ApiResponse<void>>(
      COMMITTEE_ENDPOINTS.DEACTIVATE_BATCH(id)
    );
  },

  // ============ Supervisors ============

  /**
   * Get available supervisors for assignment (paginated)
   */
  getSupervisors: async (params?: PaginationParams): Promise<PaginatedResponse<SupervisorOption>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<SupervisorOption>>>(
      COMMITTEE_ENDPOINTS.SUPERVISORS,
      { params }
    );
    return response.data.data;
  },
};
