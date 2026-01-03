import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/shared/services';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import {
  CreateDocumentTypeRequest,
  UpdateDocumentTypeRequest,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateSystemSettingRequest,
} from '@/shared/types';
import { PaginationParams } from '@/shared/types/api.types';
import { toast } from 'sonner';

// ============ Document Types Hooks ============

/**
 * Hook to get all document types
 */
export function useDocumentTypes() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.documentTypes.list(),
    queryFn: adminService.getDocumentTypes,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get active document types only
 */
export function useActiveDocumentTypes() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.documentTypes.active(),
    queryFn: adminService.getActiveDocumentTypes,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get a single document type
 */
export function useDocumentType(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.documentTypes.detail(id),
    queryFn: () => adminService.getDocumentTypeById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a document type
 */
export function useCreateDocumentType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDocumentTypeRequest) => adminService.createDocumentType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.documentTypes.all() });
      toast.success('Document type created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create document type');
    },
  });
}

/**
 * Hook to update a document type
 */
export function useUpdateDocumentType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentTypeRequest }) =>
      adminService.updateDocumentType(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.documentTypes.all() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.documentTypes.detail(variables.id) });
      toast.success('Document type updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update document type');
    },
  });
}

/**
 * Hook to delete a document type
 */
export function useDeleteDocumentType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.deleteDocumentType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.documentTypes.all() });
      toast.success('Document type deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete document type');
    },
  });
}

// ============ User Management Hooks ============

/**
 * Hook to get all users with pagination
 */
export function useAdminUsers(params?: PaginationParams) {
  return useQuery({
    queryKey: QUERY_KEYS.users.list(params as Record<string, unknown>),
    queryFn: () => adminService.getUsers(params),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to get a single user
 */
export function useAdminUser(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.users.detail(id),
    queryFn: () => adminService.getUserById(id),
    enabled: !!id,
  });
}

/**
 * Hook to get users by role
 */
export function useUsersByRole(role: string) {
  return useQuery({
    queryKey: QUERY_KEYS.users.list({ role }),
    queryFn: () => adminService.getUsersByRole(role),
    enabled: !!role,
  });
}

/**
 * Hook to create a user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => adminService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
      toast.success('User created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create user');
    },
  });
}

/**
 * Hook to update a user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      adminService.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.detail(variables.id) });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });
}

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });
}

/**
 * Hook to toggle user active status
 */
export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, activate }: { id: string; activate: boolean }) =>
      activate ? adminService.activateUser(id) : adminService.deactivateUser(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.detail(variables.id) });
      toast.success(`User ${variables.activate ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user status');
    },
  });
}

// ============ Audit Logs Hooks ============

/**
 * Hook to get audit logs with pagination
 */
export function useAuditLogs(params?: PaginationParams) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.auditLogs.list(params as Record<string, unknown>),
    queryFn: () => adminService.getAuditLogs(params),
    staleTime: 30 * 1000,
  });
}

// ============ System Settings Hooks ============

/**
 * Hook to get all system settings
 */
export function useSystemSettings() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.settings.list(),
    queryFn: adminService.getSystemSettings,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to update a system setting
 */
export function useUpdateSystemSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSystemSettingRequest) => adminService.updateSystemSetting(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.settings.all() });
      toast.success('Setting updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update setting');
    },
  });
}

// ============ Committee Management Hooks ============

/**
 * Hook to get FYP Committee members
 */
export function useFypCommitteeMembers() {
  return useQuery({
    queryKey: ['admin', 'committee', 'fyp'],
    queryFn: adminService.getFypCommitteeMembers,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to add FYP Committee member
 */
export function useAddFypCommitteeMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.addFypCommitteeMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'committee', 'fyp'] });
      toast.success('Member added to FYP Committee');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add committee member');
    },
  });
}

/**
 * Hook to remove FYP Committee member
 */
export function useRemoveFypCommitteeMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.removeFypCommitteeMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'committee', 'fyp'] });
      toast.success('Member removed from FYP Committee');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove committee member');
    },
  });
}

/**
 * Hook to get Evaluation Committee members
 */
export function useEvalCommitteeMembers() {
  return useQuery({
    queryKey: ['admin', 'committee', 'eval'],
    queryFn: adminService.getEvalCommitteeMembers,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to add Evaluation Committee member
 */
export function useAddEvalCommitteeMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.addEvalCommitteeMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'committee', 'eval'] });
      toast.success('Member added to Evaluation Committee');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add committee member');
    },
  });
}

/**
 * Hook to remove Evaluation Committee member
 */
export function useRemoveEvalCommitteeMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.removeEvalCommitteeMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'committee', 'eval'] });
      toast.success('Member removed from Evaluation Committee');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove committee member');
    },
  });
}

// ============ Group Size Settings Hooks ============

/**
 * Hook to get group size settings
 */
export function useGroupSizeSettings() {
  return useQuery({
    queryKey: ['admin', 'settings', 'group-size'],
    queryFn: adminService.getGroupSizeSettings,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to update group size settings
 */
export function useUpdateGroupSizeSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { minSize: number; maxSize: number }) => 
      adminService.updateGroupSizeSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings', 'group-size'] });
      toast.success('Group size settings updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update group size settings');
    },
  });
}

// ============ Reports Hooks ============

/**
 * Hook to download project marksheet
 */
export function useDownloadProjectMarksheet() {
  return useMutation({
    mutationFn: async (projectId: string) => {
      const blob = await adminService.downloadProjectMarksheet(projectId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `marksheet-${projectId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast.success('Marksheet downloaded');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to download marksheet');
    },
  });
}

/**
 * Hook to download all marksheets
 */
export function useDownloadAllMarksheet() {
  return useMutation({
    mutationFn: async () => {
      const blob = await adminService.downloadAllMarksheet();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all-marksheets-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast.success('All marksheets downloaded');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to download marksheets');
    },
  });
}
