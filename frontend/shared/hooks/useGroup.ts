import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { groupService } from '@/shared/services';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import {
  CreateGroupRequest,
  UpdateGroupRequest,
  SendInviteRequest,
} from '@/shared/types';
import { toast } from 'sonner';

// ============ Group Queries ============

/**
 * Hook to get current user's group
 */
export function useMyGroup() {
  return useQuery({
    queryKey: QUERY_KEYS.groups.my(),
    queryFn: groupService.getMyGroup,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

/**
 * Hook to get a group by ID
 */
export function useGroup(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.groups.detail(id),
    queryFn: () => groupService.getGroupById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get available students for invites
 */
export function useAvailableStudents(search?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.groups.availableStudents(search),
    queryFn: () => groupService.searchAvailableStudents(search),
    enabled: search !== undefined,
    staleTime: 30 * 1000,
  });
}

// ============ Group Mutations ============

/**
 * Hook to create a new group
 */
export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGroupRequest) => groupService.createGroup(data),
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups.all });
      toast.success(`Group "${group.name}" created successfully!`);
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || 'Failed to create group';
      toast.error(message);
    },
  });
}

/**
 * Hook to update a group
 */
export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGroupRequest }) =>
      groupService.updateGroup(id, data),
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups.detail(group.id) });
      toast.success('Group updated successfully');
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || 'Failed to update group';
      toast.error(message);
    },
  });
}

/**
 * Hook to delete a group
 */
export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => groupService.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups.all });
      toast.success('Group deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || 'Failed to delete group';
      toast.error(message);
    },
  });
}

/**
 * Hook to leave a group
 */
export function useLeaveGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => groupService.leaveGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups.all });
      toast.success('You have left the group');
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || 'Failed to leave group';
      toast.error(message);
    },
  });
}

/**
 * Hook to remove a member from group
 */
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: string; memberId: string }) =>
      groupService.removeMember(groupId, memberId),
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups.detail(group.id) });
      toast.success('Member removed from group');
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || 'Failed to remove member';
      toast.error(message);
    },
  });
}

/**
 * Hook to transfer leadership
 */
export function useTransferLeadership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, newLeaderId }: { groupId: string; newLeaderId: string }) =>
      groupService.transferLeadership(groupId, newLeaderId),
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups.detail(group.id) });
      toast.success('Leadership transferred successfully');
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || 'Failed to transfer leadership';
      toast.error(message);
    },
  });
}

// ============ Invite Queries ============

/**
 * Hook to get pending invites for the current user
 */
export function useMyInvites() {
  return useQuery({
    queryKey: QUERY_KEYS.groups.invites.my(),
    queryFn: groupService.getMyInvites,
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to get pending invites sent by a group
 */
export function useGroupInvites(groupId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.groups.invites.group(groupId),
    queryFn: () => groupService.getGroupInvites(groupId),
    enabled: !!groupId,
    staleTime: 60 * 1000,
  });
}

// ============ Invite Mutations ============

/**
 * Hook to send an invite
 */
export function useSendInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: SendInviteRequest }) =>
      groupService.sendInvite(groupId, data),
    onSuccess: (invite) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups.invites.all() });
      toast.success(`Invitation sent to ${invite.inviteeName}`);
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || 'Failed to send invitation';
      toast.error(message);
    },
  });
}

/**
 * Hook to respond to an invite (accept or decline)
 */
export function useRespondToInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inviteId, accept }: { inviteId: string; accept: boolean }) =>
      groupService.respondToInvite(inviteId, accept),
    onSuccess: (invite, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups.invites.all() });
      toast.success(
        variables.accept
          ? `You have joined "${invite.groupName}"`
          : 'Invitation declined'
      );
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || 'Failed to respond to invitation';
      toast.error(message);
    },
  });
}

/**
 * Hook to cancel an invite
 */
export function useCancelInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) => groupService.cancelInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups.invites.all() });
      toast.success('Invitation cancelled');
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || 'Failed to cancel invitation';
      toast.error(message);
    },
  });
}
