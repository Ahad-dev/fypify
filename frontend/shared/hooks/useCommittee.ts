import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { committeeService } from '@/shared/services';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import {
  ApproveProjectRequest,
  RejectProjectRequest,
  CreateDeadlineBatchRequest,
} from '@/shared/types';
import { PaginationParams } from '@/shared/types/api.types';
import { toast } from 'sonner';

// ============ Pending Projects (Committee specific) ============

/**
 * Hook to get pending projects awaiting approval (committee endpoint)
 */
export function useCommitteePendingProjects(params?: PaginationParams) {
  return useQuery({
    queryKey: QUERY_KEYS.committee.pendingProjects(),
    queryFn: () => committeeService.getPendingProjects(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ============ Project Approval/Rejection ============

/**
 * Hook to approve a project with supervisor assignment
 */
export function useApproveProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveProjectRequest }) =>
      committeeService.approveProject(id, data),
    onSuccess: (project) => {
      // Invalidate pending projects list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.committee.pendingProjects() });
      // Invalidate all projects queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.all });
      // Show success toast
      toast.success(`Project "${project.title}" approved successfully!`, {
        description: 'Notifications have been sent to all stakeholders.',
      });
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || 'Failed to approve project';
      toast.error('Approval Failed', { description: message });
    },
  });
}

/**
 * Hook to reject a project with reason
 */
export function useRejectProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectProjectRequest }) =>
      committeeService.rejectProject(id, data),
    onSuccess: (project) => {
      // Invalidate pending projects list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.committee.pendingProjects() });
      // Invalidate all projects queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.all });
      // Show success toast
      toast.success(`Project "${project.title}" rejected`, {
        description: 'The group has been notified of the rejection.',
      });
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || 'Failed to reject project';
      toast.error('Rejection Failed', { description: message });
    },
  });
}

// ============ Deadline Batches ============

/**
 * Hook to get all deadline batches (paginated)
 */
export function useDeadlineBatches(params?: PaginationParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.committee.deadlineBatches.list(), params],
    queryFn: () => committeeService.getDeadlineBatches(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get active deadline batches only
 */
export function useActiveDeadlineBatches(params?: PaginationParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.committee.deadlineBatches.active(), params],
    queryFn: async () => {
      const response = await committeeService.getDeadlineBatches(params);
      return {
        ...response,
        content: response.content.filter((batch) => batch.isActive),
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get a specific deadline batch
 */
export function useDeadlineBatch(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.committee.deadlineBatches.detail(id),
    queryFn: () => committeeService.getDeadlineBatch(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get current active deadline batch
 */
export function useCurrentDeadlineBatch() {
  return useQuery({
    queryKey: QUERY_KEYS.committee.deadlineBatches.current(),
    queryFn: committeeService.getCurrentBatch,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to create a new deadline batch
 */
export function useCreateDeadlineBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDeadlineBatchRequest) =>
      committeeService.createDeadlineBatch(data),
    onSuccess: (batch) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.committee.deadlineBatches.all() });
      toast.success(`Deadline batch "${batch.name}" created successfully!`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error?.message || 'Failed to create deadline batch';
      toast.error('Creation Failed', { description: message });
    },
  });
}

/**
 * Hook to deactivate a deadline batch
 */
export function useDeactivateDeadlineBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => committeeService.deactivateDeadlineBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.committee.deadlineBatches.all() });
      toast.success('Deadline batch deactivated successfully');
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || 'Failed to deactivate batch';
      toast.error('Deactivation Failed', { description: message });
    },
  });
}

// ============ Committee Supervisors ============

/**
 * Hook to get available supervisors for project assignment (committee context, paginated)
 */
export function useCommitteeSupervisors(params?: PaginationParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.committee.supervisors(), params],
    queryFn: () => committeeService.getSupervisors(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ============ Final Results ============

/**
 * Hook to get computed final result for a project
 */
export function useFinalResult(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.committee.finalResults.byProject(projectId),
    queryFn: () => committeeService.getFinalResult(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to compute final result for a project
 */
export function useComputeFinalResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => committeeService.computeFinalResult(projectId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.committee.finalResults.all() });
      queryClient.setQueryData(
        QUERY_KEYS.committee.finalResults.byProject(result.projectId),
        result
      );
      toast.success('Final result computed!', {
        description: `Score: ${result.totalScore.toFixed(2)}`,
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error?.message || 'Failed to compute result';
      toast.error('Computation Failed', { description: message });
    },
  });
}

/**
 * Hook to release final result to students
 */
export function useReleaseFinalResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => committeeService.releaseFinalResult(projectId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.committee.finalResults.all() });
      queryClient.setQueryData(
        QUERY_KEYS.committee.finalResults.byProject(result.projectId),
        result
      );
      toast.success('Results released!', {
        description: 'Students have been notified.',
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error?.message || 'Failed to release result';
      toast.error('Release Failed', { description: message });
    },
  });
}

/**
 * Hook to get released final result for a project (student/supervisor view)
 */
export function useReleasedResult(projectId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.committee.finalResults.byProject(projectId), 'released'],
    queryFn: () => committeeService.getReleasedResult(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}

