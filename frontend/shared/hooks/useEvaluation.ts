import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { evaluationService } from '@/shared/services/evaluation.service';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { EvaluationRequest } from '@/shared/types/evaluation.types';
import { toast } from 'sonner';

// ============ Evaluation Queries ============

/**
 * Hook to get locked submissions for evaluation
 */
export function useLockedSubmissions(page = 0, size = 20) {
  return useQuery({
    queryKey: [...QUERY_KEYS.evaluations.locked(), { page, size }],
    queryFn: () => evaluationService.getLockedSubmissions({ page, size }),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to get all evaluation marks for a submission
 */
export function useEvaluationMarks(submissionId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.evaluations.marks(submissionId),
    queryFn: () => evaluationService.getEvaluationMarks(submissionId),
    enabled: !!submissionId,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to get my evaluation for a submission
 */
export function useMyEvaluation(submissionId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.evaluations.myEvaluation(submissionId),
    queryFn: () => evaluationService.getMyEvaluation(submissionId),
    enabled: !!submissionId,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to get evaluation summary for a submission
 */
export function useEvaluationSummary(submissionId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.evaluations.summary(submissionId),
    queryFn: () => evaluationService.getEvaluationSummary(submissionId),
    enabled: !!submissionId,
    staleTime: 30 * 1000,
  });
}

// ============ Evaluation Mutations ============

/**
 * Hook to submit or update evaluation marks
 */
export function useEvaluateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ submissionId, data }: { submissionId: string; data: EvaluationRequest }) =>
      evaluationService.evaluateSubmission(submissionId, data),
    onSuccess: (result, variables) => {
      const message = result.isFinal 
        ? 'Evaluation finalized successfully' 
        : 'Evaluation saved as draft';
      toast.success(message);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.evaluations.marks(variables.submissionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.evaluations.myEvaluation(variables.submissionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.evaluations.summary(variables.submissionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.evaluations.locked() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save evaluation');
    },
  });
}

/**
 * Hook to finalize evaluation
 */
export function useFinalizeEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (submissionId: string) => evaluationService.finalizeEvaluation(submissionId),
    onSuccess: (_, submissionId) => {
      toast.success('Evaluation finalized successfully');
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.evaluations.marks(submissionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.evaluations.myEvaluation(submissionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.evaluations.summary(submissionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.evaluations.locked() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to finalize evaluation');
    },
  });
}
