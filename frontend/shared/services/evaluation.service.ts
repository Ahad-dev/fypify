import api, { ApiResponse } from '@/shared/api/apiHandler';
import {
  EvaluationRequest,
  EvaluationMarks,
  EvaluationSummary,
  LockedSubmission,
} from '@/shared/types/evaluation.types';
import { PaginatedResponse, PaginationParams } from '@/shared/types/api.types';

const EVAL_ENDPOINTS = {
  BASE: '/eval',
  SUBMISSIONS: '/eval/submissions',
} as const;

/**
 * Evaluation Service
 * Handles evaluation committee API calls
 */
export const evaluationService = {
  /**
   * Get locked submissions for evaluation
   */
  getLockedSubmissions: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<LockedSubmission>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<LockedSubmission>>>(
      EVAL_ENDPOINTS.SUBMISSIONS,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get all evaluation marks for a submission
   */
  getEvaluationMarks: async (submissionId: string): Promise<EvaluationMarks[]> => {
    const response = await api.get<ApiResponse<EvaluationMarks[]>>(
      `${EVAL_ENDPOINTS.SUBMISSIONS}/${submissionId}/marks`
    );
    return response.data.data;
  },

  /**
   * Get my evaluation for a submission
   */
  getMyEvaluation: async (submissionId: string): Promise<EvaluationMarks | null> => {
    const response = await api.get<ApiResponse<EvaluationMarks>>(
      `${EVAL_ENDPOINTS.SUBMISSIONS}/${submissionId}/my-evaluation`
    );
    return response.data.data;
  },

  /**
   * Submit or update evaluation marks
   */
  evaluateSubmission: async (
    submissionId: string,
    data: EvaluationRequest
  ): Promise<EvaluationMarks> => {
    const response = await api.post<ApiResponse<EvaluationMarks>>(
      `${EVAL_ENDPOINTS.SUBMISSIONS}/${submissionId}/evaluate`,
      data
    );
    return response.data.data;
  },

  /**
   * Finalize evaluation
   */
  finalizeEvaluation: async (submissionId: string): Promise<EvaluationMarks> => {
    const response = await api.patch<ApiResponse<EvaluationMarks>>(
      `${EVAL_ENDPOINTS.SUBMISSIONS}/${submissionId}/finalize`
    );
    return response.data.data;
  },

  /**
   * Get evaluation summary for a submission
   */
  getEvaluationSummary: async (submissionId: string): Promise<EvaluationSummary> => {
    const response = await api.get<ApiResponse<EvaluationSummary>>(
      `${EVAL_ENDPOINTS.SUBMISSIONS}/${submissionId}/summary`
    );
    return response.data.data;
  },
};

export default evaluationService;
