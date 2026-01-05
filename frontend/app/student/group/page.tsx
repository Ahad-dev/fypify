'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users,
  Plus,
  Crown,
  MoreVertical,
  UserMinus,
  LogOut,
  Trash2,
  Send,
  Check,
  X,
  Clock,
  Mail,
  FileText,
  Loader2,
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useSystemSettingsContext } from '@/contexts/SystemSettingsContext';
import {
  useMyGroup,
  useCreateGroup,
  useDeleteGroup,
  useLeaveGroup,
  useRemoveMember,
  useTransferLeadership,
  useMyInvites,
  useGroupInvites,
  useSendInvite,
  useRespondToInvite,
  useCancelInvite,
} from '@/shared/hooks';
import { GroupInvite, GroupMember } from '@/shared/types';
import Link from 'next/link';

// Form schemas
const createGroupSchema = z.object({
  name: z
    .string()
    .min(3, 'Group name must be at least 3 characters')
    .max(50, 'Group name must be at most 50 characters'),
});

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  message: z.string().max(200, 'Message must be at most 200 characters').optional(),
});

type CreateGroupFormData = z.infer<typeof createGroupSchema>;
type InviteFormData = z.infer<typeof inviteSchema>;

export default function StudentGroupPage() {
  const { user } = useAuthContext();
  const { getGroupMinSize, getGroupMaxSize } = useSystemSettingsContext();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  // Queries
  const { data: group, isLoading: isLoadingGroup, refetch: refetchGroup } = useMyGroup();
  const { data: pendingInvites, isLoading: isLoadingInvites } = useMyInvites();
  const { data: groupInvites, isLoading: isLoadingGroupInvites } = useGroupInvites(group?.id || '');

  // Group size validation
  const minGroupSize = getGroupMinSize();
  const maxGroupSize = getGroupMaxSize();
  const memberCount = group?.members?.length ?? 0;
  const canRegisterProject = memberCount >= minGroupSize && memberCount <= maxGroupSize;

  // Mutations
  const createGroup = useCreateGroup();
  const deleteGroup = useDeleteGroup();
  const leaveGroup = useLeaveGroup();
  const removeMember = useRemoveMember();
  const transferLeadership = useTransferLeadership();
  const sendInvite = useSendInvite();
  const respondToInvite = useRespondToInvite();
  const cancelInvite = useCancelInvite();

  // Forms
  const createForm = useForm<CreateGroupFormData>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: { name: '' },
  });

  const inviteForm = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', message: '' },
  });

  // Computed values
  const isLeader = group?.leader?.id === user?.id;
  const hasGroup = !!group;

  // Handlers
  const handleCreateGroup = async (data: CreateGroupFormData) => {
    try {
      await createGroup.mutateAsync(data);
      setIsCreateDialogOpen(false);
      createForm.reset();
      refetchGroup();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleSendInvite = async (data: InviteFormData) => {
    if (!group) return;
    try {
      await sendInvite.mutateAsync({
        groupId: group.id,
        data: { inviteeEmail: data.email, message: data.message }, // Note: Backend expects inviteeEmail
      });
      setIsInviteDialogOpen(false);
      inviteForm.reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      await respondToInvite.mutateAsync({ inviteId, accept: true });
      refetchGroup();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    try {
      await respondToInvite.mutateAsync({ inviteId, accept: false });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await cancelInvite.mutateAsync(inviteId);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!group) return;
    try {
      await removeMember.mutateAsync({ groupId: group.id, memberId });
      refetchGroup();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleTransferLeadership = async (newLeaderId: string) => {
    if (!group) return;
    try {
      await transferLeadership.mutateAsync({ groupId: group.id, newLeaderId });
      refetchGroup();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleLeaveGroup = async () => {
    if (!group) return;
    try {
      await leaveGroup.mutateAsync(group.id);
      refetchGroup();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDeleteGroup = async () => {
    if (!group) return;
    try {
      await deleteGroup.mutateAsync(group.id);
      refetchGroup();
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoadingGroup) {
    return (
      <RoleGuard allowedRoles={['STUDENT']}>
        <MainLayout>
          <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </MainLayout>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['STUDENT']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Group</h1>
              <p className="text-muted-foreground">
                {hasGroup ? 'Manage your FYP group' : 'Create or join a group to get started'}
              </p>
            </div>
            {!hasGroup && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                    <DialogDescription>
                      Create a new FYP group. You will automatically become the group leader.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...createForm}>
                    <form onSubmit={createForm.handleSubmit(handleCreateGroup)} className="space-y-4">
                      <FormField
                        control={createForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Group Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter group name" {...field} />
                            </FormControl>
                            <FormDescription>
                              Choose a unique name for your group (3-50 characters)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createGroup.isPending}>
                          {createGroup.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Create Group
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Pending Invites Section (show when no group) */}
          {!hasGroup && pendingInvites && pendingInvites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Pending Invitations
                </CardTitle>
                <CardDescription>You have been invited to join these groups</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingInvites.map((invite: GroupInvite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{getInitials(invite.groupName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{invite.groupName}</p>
                          <p className="text-sm text-muted-foreground">
                            Invited by {invite.inviterName}
                          </p>
                          {invite.message && (
                            <p className="text-sm text-muted-foreground italic mt-1">
                              &quot;{invite.message}&quot;
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineInvite(invite.id)}
                          disabled={respondToInvite.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAcceptInvite(invite.id)}
                          disabled={respondToInvite.isPending}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Group State */}
          {!hasGroup && (!pendingInvites || pendingInvites.length === 0) && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">You&apos;re not in a group yet</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  Create a new group to become a leader, or wait for an invitation from another
                  student.
                </p>
                <Button className="mt-6" onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Group
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Group Details */}
          {hasGroup && (
            <>
              {/* Group Info Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {group.name}
                      {isLeader && (
                        <Badge variant="secondary" className="ml-2">
                          <Crown className="mr-1 h-3 w-3" />
                          Leader
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {group.memberCount} member{group.memberCount !== 1 ? 's' : ''} •{' '}
                      Created {new Date(group.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {isLeader && (
                      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Send className="mr-2 h-4 w-4" />
                            Invite
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Invite Student</DialogTitle>
                            <DialogDescription>
                              Send an invitation to a student to join your group.
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...inviteForm}>
                            <form
                              onSubmit={inviteForm.handleSubmit(handleSendInvite)}
                              className="space-y-4"
                            >
                              <FormField
                                control={inviteForm.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Student Email</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="email"
                                        placeholder="student@example.com"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={inviteForm.control}
                                name="message"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Message (Optional)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Personal message..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <DialogFooter>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setIsInviteDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button type="submit" disabled={sendInvite.isPending}>
                                  {sendInvite.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  )}
                                  Send Invite
                                </Button>
                              </DialogFooter>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Project Status */}
                  <div className="mb-6">
                    {group.hasProject ? (
                      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-700 dark:text-green-300">
                              Project Registered
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              Your group has registered a project
                            </p>
                          </div>
                        </div>
                        <Link href="/student/project">
                          <Button variant="outline" size="sm">
                            View Project
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-amber-600" />
                          <div>
                            <p className="font-medium text-amber-700 dark:text-amber-300">
                              No Project Yet
                            </p>
                            <p className="text-sm text-amber-600 dark:text-amber-400">
                              {isLeader
                                ? 'Register a project to get started'
                                : 'The group leader needs to register a project'}
                            </p>
                          </div>
                        </div>
                        {isLeader && (
                          canRegisterProject ? (
                            <Link href="/student/project">
                              <Button size="sm">Register Project</Button>
                            </Link>
                          ) : (
                            <Button 
                              size="sm" 
                              disabled 
                              title={memberCount < minGroupSize 
                                ? `Need at least ${minGroupSize} member(s). Current: ${memberCount}`
                                : `Too many members (max: ${maxGroupSize}). Current: ${memberCount}`
                              }
                            >
                              Register Project
                            </Button>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  <Separator className="my-6" />

                  {/* Members List */}
                  <div>
                    <h4 className="font-semibold mb-4">Group Members</h4>
                    <div className="space-y-3">
                      {group.members.map((member: GroupMember) => (
                        <div
                          key={member.studentId}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{getInitials(member.studentName)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                {member.studentName}
                                {member.isLeader && (
                                  <Crown className="h-4 w-4 text-amber-500" />
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {member.studentEmail}
                              </p>
                            </div>
                          </div>
                          {isLeader && !member.isLeader && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleTransferLeadership(member.studentId)}
                                >
                                  <Crown className="mr-2 h-4 w-4" />
                                  Make Leader
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleRemoveMember(member.studentId)}
                                >
                                  <UserMinus className="mr-2 h-4 w-4" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pending Invites (for leaders) */}
                  {isLeader && groupInvites && groupInvites.length > 0 && (
                    <>
                      <Separator className="my-6" />
                      <div>
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Pending Invites
                        </h4>
                        <div className="space-y-3">
                          {groupInvites.map((invite: GroupInvite) => (
                            <div
                              key={invite.id}
                              className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>
                                    {getInitials(invite.inviteeName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{invite.inviteeName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {invite.inviteeEmail}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelInvite(invite.id)}
                                disabled={cancelInvite.isPending}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <Separator className="my-6" />

                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    {!isLeader && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline">
                            <LogOut className="mr-2 h-4 w-4" />
                            Leave Group
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Leave Group?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to leave this group? You will need another
                              invitation to rejoin.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLeaveGroup}>
                              Leave Group
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {isLeader && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Group
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Group?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the
                              group and remove all members.
                              {group.hasProject && (
                                <span className="block mt-2 text-destructive font-medium">
                                  Warning: You cannot delete a group that has a registered project.
                                </span>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteGroup}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              disabled={group.hasProject}
                            >
                              Delete Group
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
