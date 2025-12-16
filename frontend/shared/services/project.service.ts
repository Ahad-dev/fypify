import api, { ApiResponse } from '@/shared/api/apiHandler';
import {
  Project,
  ProjectStats,
  RegisterProjectRequest,
  UpdateProjectRequest,
  ProjectDecisionRequest,
  ProjectStatus,
} from '@/shared/types';
import { PaginatedResponse, PaginationParams } from '@/shared/types/api.types';

const PROJECT_ENDPOINTS = {
  PROJECTS: '/projects',
  PENDING: '/projects/pending',
  BY_STATUS: '/projects/status',
  STATS: '/projects/stats',
} as const;

/**
 * Project Service
 * Handles all project-related API calls
 */
export const projectService = {
  // ============ Project CRUD ============

  /**
   * Get all projects (paginated)
   */
  getProjects: async (params?: PaginationParams): Promise<PaginatedResponse<Project>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Project>>>(
      PROJECT_ENDPOINTS.PROJECTS,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get pending projects (for FYP Committee)
   */
  getPendingProjects: async (params?: PaginationParams): Promise<PaginatedResponse<Project>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Project>>>(
      PROJECT_ENDPOINTS.PENDING,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get projects by status
   */
  getProjectsByStatus: async (status: ProjectStatus, params?: PaginationParams): Promise<PaginatedResponse<Project>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Project>>>(
      `${PROJECT_ENDPOINTS.BY_STATUS}/${status}`,
      { params }
    );
    return response.data.data;
  },

  /**
   * Search projects by title
   */
  searchProjects: async (search: string, params?: PaginationParams): Promise<PaginatedResponse<Project>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Project>>>(
      PROJECT_ENDPOINTS.PROJECTS,
      { params: { ...params, search } }
    );
    return response.data.data;
  },

  /**
   * Get project by ID
   */
  getProjectById: async (id: string): Promise<Project> => {
    const response = await api.get<ApiResponse<Project>>(
      `${PROJECT_ENDPOINTS.PROJECTS}/${id}`
    );
    return response.data.data;
  },

  /**
   * Get project for a group
   */
  getProjectByGroupId: async (groupId: string): Promise<Project | null> => {
    try {
      const response = await api.get<ApiResponse<Project>>(
        `${PROJECT_ENDPOINTS.PROJECTS}/groups/${groupId}`
      );
      return response.data.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Register a new project
   */
  registerProject: async (data: RegisterProjectRequest): Promise<Project> => {
    const response = await api.post<ApiResponse<Project>>(
      PROJECT_ENDPOINTS.PROJECTS,
      data
    );
    return response.data.data;
  },

  /**
   * Update a project (only while pending)
   */
  updateProject: async (id: string, data: UpdateProjectRequest): Promise<Project> => {
    const response = await api.put<ApiResponse<Project>>(
      `${PROJECT_ENDPOINTS.PROJECTS}/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Make a decision on a project (approve/reject) - FYP Committee only
   */
  makeDecision: async (id: string, data: ProjectDecisionRequest): Promise<Project> => {
    const response = await api.post<ApiResponse<Project>>(
      `${PROJECT_ENDPOINTS.PROJECTS}/${id}/decision`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete a project
   */
  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`${PROJECT_ENDPOINTS.PROJECTS}/${id}`);
  },

  // ============ Statistics ============

  /**
   * Get project statistics by status
   */
  getProjectStats: async (): Promise<ProjectStats> => {
    const response = await api.get<ApiResponse<ProjectStats>>(
      PROJECT_ENDPOINTS.STATS
    );
    return response.data.data;
  },
};

export default projectService;
