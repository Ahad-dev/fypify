import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { submissionService } from '@/shared/services';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { CreateSubmissionRequest, SupervisorReviewRequest, SupervisorMarksRequest } from '@/shared/types';
import { toast } from 'sonner';

// ============ Submission Queries ============

/**
 * Hook to get all submissions for a project
 */
export function useProjectSubmissions(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.submissions.byProject(projectId),
    queryFn: () => submissionService.getSubmissionsByProject(projectId),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to get submissions by project and document type
 */
export function useSubmissionsByType(projectId: string, docTypeId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.submissions.byProjectAndType(projectId, docTypeId),
    queryFn: () => submissionService.getSubmissionsByType(projectId, docTypeId),
    enabled: !!projectId && !!docTypeId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to get the latest submission for a project and document type
 */
export function useLatestSubmission(projectId: string, docTypeId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.submissions.latest(projectId, docTypeId),
    queryFn: () => submissionService.getLatestSubmission(projectId, docTypeId),
    enabled: !!projectId && !!docTypeId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to get submission by ID
 */
export function useSubmission(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.submissions.detail(id),
    queryFn: () => submissionService.getSubmissionById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to get pending submissions for supervisor
 */
export function usePendingSubmissions(page = 0, size = 10) {
  return useQuery({
    queryKey: [...QUERY_KEYS.submissions.pending(), { page, size }],
    queryFn: () => submissionService.getPendingSubmissions({ page, size }),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to get active document types
 */
export function useActiveDocumentTypes() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.documentTypes.active(),
    queryFn: () => submissionService.getActiveDocumentTypes(),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to get project deadlines
 */
export function useProjectDeadlines(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.submissions.deadlines(projectId),
    queryFn: () => submissionService.getProjectDeadlines(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}

// ============ Submission Mutations ============

/**
 * Hook to create a new submission
 */
export function useCreateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: CreateSubmissionRequest;
    }) => submissionService.createSubmission(projectId, data),
    onSuccess: (submission) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.submissions.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.submissions.byProject(submission.projectId),
      });
      toast.success(
        `Document submitted successfully! (Version ${submission.version})`
      );
    },
    onError: (error: any) => {
      const message =
        error?.message ||
        error?.response?.data?.message ||
        'Failed to create submission';
      toast.error(message);
    },
  });
}

/**
 * Hook to mark a submission as final
 */
export function useMarkAsFinal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => submissionService.markAsFinal(id),
    onSuccess: (submission) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.submissions.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.submissions.detail(submission.id),
      });
      toast.success('Submission marked as final');
    },
    onError: (error: any) => {
      const message =
        error?.message ||
        error?.response?.data?.message ||
        'Failed to mark submission as final';
      toast.error(message);
    },
  });
}

/**
 * Hook for supervisor to review a submission
 */
export function useReviewSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SupervisorReviewRequest }) =>
      submissionService.reviewSubmission(id, data),
    onSuccess: (submission, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.submissions.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.submissions.pending(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.submissions.detail(submission.id),
      });
      const message = variables.data.approve
        ? 'Submission approved successfully'
        : 'Revision requested successfully';
      toast.success(message);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error?.message ||
        'Failed to review submission';
      toast.error(message);
    },
  });
}

/**
 * Hook to lock a submission for evaluation
 */
export function useLockForEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => submissionService.lockForEvaluation(id),
    onSuccess: (submission) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.submissions.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.submissions.detail(submission.id),
      });
      toast.success('Submission locked for evaluation');
    },
    onError: (error: any) => {
      const message =
        error?.message ||
        error?.response?.data?.message ||
        'Failed to lock submission';
      toast.error(message);
    },
  });
}

// ============ Supervisor Evaluation Hooks ============

/**
 * Hook to get locked submissions for supervisor's projects
 */
export function useSupervisorLockedSubmissions(page = 0, size = 10) {
  return useQuery({
    queryKey: QUERY_KEYS.submissions.supervisorLocked({ page, size }),
    queryFn: () => submissionService.getLockedSubmissionsForSupervisor({ page, size }),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to get supervisor marks for a submission
 */
export function useSupervisorMarks(submissionId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.submissions.supervisorMarks(submissionId),
    queryFn: () => submissionService.getSupervisorMarks(submissionId),
    enabled: !!submissionId && submissionId.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for supervisor to submit marks for a locked submission
 */
export function useSubmitSupervisorMarks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ submissionId, data }: { submissionId: string; data: SupervisorMarksRequest }) =>
      submissionService.submitSupervisorMarks(submissionId, data),
    onSuccess: (marks) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.submissions.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.submissions.supervisorMarks(marks.submissionId),
      });
      toast.success('Supervisor marks submitted successfully');
    },
    onError: (error: any) => {
      const message =
        error?.message ||
        error?.response?.data?.message ||
        'Failed to submit marks';
      toast.error(message);
    },
  });
}

