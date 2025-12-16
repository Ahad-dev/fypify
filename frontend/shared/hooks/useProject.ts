import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/shared/services';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import {
  RegisterProjectRequest,
  UpdateProjectRequest,
  ProjectDecisionRequest,
  ProjectStatus,
} from '@/shared/types';
import { PaginationParams } from '@/shared/types/api.types';
import { toast } from 'sonner';

// ============ Project Queries ============

/**
 * Hook to get all projects (paginated)
 */
export function useProjects(params?: PaginationParams) {
  return useQuery({
    queryKey: QUERY_KEYS.projects.list(params as Record<string, unknown>),
    queryFn: () => projectService.getProjects(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get pending projects (for FYP Committee)
 */
export function usePendingProjects(params?: PaginationParams) {
  return useQuery({
    queryKey: QUERY_KEYS.projects.pending(),
    queryFn: () => projectService.getPendingProjects(params),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to get projects by status
 */
export function useProjectsByStatus(status: ProjectStatus, params?: PaginationParams) {
  return useQuery({
    queryKey: QUERY_KEYS.projects.list({ status, ...params } as Record<string, unknown>),
    queryFn: () => projectService.getProjectsByStatus(status, params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get a project by ID
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.projects.detail(id),
    queryFn: () => projectService.getProjectById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get a project by group ID
 */
export function useProjectByGroup(groupId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.projects.byGroup(groupId),
    queryFn: () => projectService.getProjectByGroupId(groupId),
    enabled: !!groupId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

/**
 * Hook to get project statistics
 */
export function useProjectStats() {
  return useQuery({
    queryKey: QUERY_KEYS.projects.stats(),
    queryFn: projectService.getProjectStats,
    staleTime: 5 * 60 * 1000,
  });
}

// ============ Project Mutations ============

/**
 * Hook to register a new project
 */
export function useRegisterProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterProjectRequest) => projectService.registerProject(data),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups.all });
      toast.success(`Project "${project.title}" registered successfully! Waiting for approval.`);
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || 'Failed to register project';
      toast.error(message);
    },
  });
}

/**
 * Hook to update a project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectRequest }) =>
      projectService.updateProject(id, data),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.detail(project.id) });
      toast.success('Project updated successfully');
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || 'Failed to update project';
      toast.error(message);
    },
  });
}

/**
 * Hook to make a decision on a project (approve/reject)
 */
export function useProjectDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectDecisionRequest }) =>
      projectService.makeDecision(id, data),
    onSuccess: (project, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.detail(project.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
      toast.success(
        variables.data.approve
          ? `Project "${project.title}" has been approved`
          : `Project "${project.title}" has been rejected`
      );
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || 'Failed to process decision';
      toast.error(message);
    },
  });
}

/**
 * Hook to delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups.all });
      toast.success('Project deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || 'Failed to delete project';
      toast.error(message);
    },
  });
}
