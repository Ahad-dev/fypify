import api, { ApiResponse } from '@/shared/api/apiHandler';
import {
  DocumentSubmission,
  CreateSubmissionRequest,
  SupervisorReviewRequest,
  DocumentType,
  ProjectDeadline,
} from '@/shared/types';
import { PaginatedResponse, PaginationParams } from '@/shared/types/api.types';

const SUBMISSION_ENDPOINTS = {
  SUBMISSIONS: '/submissions',
  PROJECTS: '/projects',
} as const;

/**
 * Submission Service
 * Handles document submission API calls
 */
export const submissionService = {
  // ============ Project Submissions ============

  /**
   * Create a new submission for a project
   */
  createSubmission: async (
    projectId: string,
    data: CreateSubmissionRequest
  ): Promise<DocumentSubmission> => {
    const response = await api.post<ApiResponse<DocumentSubmission>>(
      `${SUBMISSION_ENDPOINTS.PROJECTS}/${projectId}/submissions`,
      data
    );
    return response.data.data;
  },

  /**
   * Get all submissions for a project
   */
  getSubmissionsByProject: async (projectId: string): Promise<DocumentSubmission[]> => {
    const response = await api.get<ApiResponse<DocumentSubmission[]>>(
      `${SUBMISSION_ENDPOINTS.PROJECTS}/${projectId}/submissions`
    );
    return response.data.data;
  },

  /**
   * Get submissions by project and document type
   */
  getSubmissionsByType: async (
    projectId: string,
    docTypeId: string
  ): Promise<DocumentSubmission[]> => {
    const response = await api.get<ApiResponse<DocumentSubmission[]>>(
      `${SUBMISSION_ENDPOINTS.PROJECTS}/${projectId}/submissions/by-type`,
      { params: { docTypeId } }
    );
    return response.data.data;
  },

  /**
   * Get the latest submission for a project and document type
   */
  getLatestSubmission: async (
    projectId: string,
    docTypeId: string
  ): Promise<DocumentSubmission | null> => {
    try {
      const response = await api.get<ApiResponse<DocumentSubmission>>(
        `${SUBMISSION_ENDPOINTS.PROJECTS}/${projectId}/submissions/latest`,
        { params: { docTypeId } }
      );
      return response.data.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // ============ Individual Submission Operations ============

  /**
   * Get submission by ID
   */
  getSubmissionById: async (id: string): Promise<DocumentSubmission> => {
    const response = await api.get<ApiResponse<DocumentSubmission>>(
      `${SUBMISSION_ENDPOINTS.SUBMISSIONS}/${id}`
    );
    return response.data.data;
  },

  /**
   * Mark submission as final
   */
  markAsFinal: async (id: string): Promise<DocumentSubmission> => {
    const response = await api.patch<ApiResponse<DocumentSubmission>>(
      `${SUBMISSION_ENDPOINTS.SUBMISSIONS}/${id}/mark-final`
    );
    return response.data.data;
  },

  // ============ Supervisor Operations ============

  /**
   * Get pending submissions for supervisor review
   */
  getPendingSubmissions: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<DocumentSubmission>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<DocumentSubmission>>>(
      `${SUBMISSION_ENDPOINTS.SUBMISSIONS}/pending`,
      { params }
    );
    return response.data.data;
  },

  /**
   * Review a submission (approve or request revision)
   */
  reviewSubmission: async (
    id: string,
    data: SupervisorReviewRequest
  ): Promise<DocumentSubmission> => {
    const response = await api.post<ApiResponse<DocumentSubmission>>(
      `${SUBMISSION_ENDPOINTS.SUBMISSIONS}/${id}/review`,
      data
    );
    return response.data.data;
  },

  // ============ Committee Operations ============

  /**
   * Lock a submission for evaluation
   */
  lockForEvaluation: async (id: string): Promise<DocumentSubmission> => {
    const response = await api.post<ApiResponse<DocumentSubmission>>(
      `${SUBMISSION_ENDPOINTS.SUBMISSIONS}/${id}/lock`
    );
    return response.data.data;
  },

  // ============ Document Types ============

  /**
   * Get active document types
   */
  getActiveDocumentTypes: async (): Promise<DocumentType[]> => {
    const response = await api.get<ApiResponse<DocumentType[]>>(
      '/admin/document-types/active'
    );
    return response.data.data;
  },

  /**
   * Get project deadlines
   */
  getProjectDeadlines: async (projectId: string): Promise<ProjectDeadline[]> => {
    const response = await api.get<ApiResponse<ProjectDeadline[]>>(
      `${SUBMISSION_ENDPOINTS.PROJECTS}/${projectId}/deadlines`
    );
    return response.data.data;
  },
};

export default submissionService;

