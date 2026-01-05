'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
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
  FolderKanban,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Users,
  User,
  Loader2,
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useSystemSettingsContext } from '@/contexts/SystemSettingsContext';
import { useMyGroup, useProjectByGroup, useRegisterProject, useUpdateProject, useDeleteProject, useProject, useSupervisors, useResubmitProject } from '@/shared/hooks';
import { ProjectStatus } from '@/shared/types';
import Link from 'next/link';
import { Select } from '@/components/ui/select';
import { MultiSelect } from '@/components/multi-select';

// Form schema
const projectSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be at most 200 characters'),
  projectAbstract: z
    .string()
    .min(100, 'Abstract must be at least 100 characters')
    .max(2000, 'Abstract must be at most 2000 characters'),
  domain: z.string().max(100, 'Domain must be at most 100 characters').optional(),
  proposedSupervisorIds: z.array(z.string()).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

// Status badge component
function StatusBadge({ status }: { status: ProjectStatus }) {
  const statusConfig: Record<ProjectStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
    PENDING_APPROVAL: { label: 'Pending Approval', variant: 'secondary', icon: Clock },
    APPROVED: { label: 'Approved', variant: 'default', icon: CheckCircle2 },
    REJECTED: { label: 'Rejected', variant: 'destructive', icon: XCircle },
    IN_PROGRESS: { label: 'In Progress', variant: 'default', icon: FolderKanban },
    COMPLETED: { label: 'Completed', variant: 'default', icon: CheckCircle2 },
    ARCHIVED: { label: 'Archived', variant: 'outline', icon: FileText },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

export default function StudentProjectPage() {
  const { user } = useAuthContext();
  const { getGroupMinSize, getGroupMaxSize } = useSystemSettingsContext();
  const [isEditing, setIsEditing] = useState(false);

  // Queries
  const { data: group, isLoading: isLoadingGroup } = useMyGroup();
  
  // Group size validation
  const minGroupSize = getGroupMinSize();
  const maxGroupSize = getGroupMaxSize();
  const memberCount = group?.members?.length ?? 0;
  const isGroupSizeValid = memberCount >= minGroupSize && memberCount <= maxGroupSize;
  const groupSizeMessage = memberCount < minGroupSize 
    ? `Your group needs at least ${minGroupSize} member(s) to register a project. Current: ${memberCount}`
    : memberCount > maxGroupSize 
    ? `Your group has too many members (max: ${maxGroupSize}). Current: ${memberCount}`
    : null;
  const { data: project, isLoading: isLoadingProject, refetch: refetchProject } = useProject(group?.projectId || '');
  const { data: supervisors, isLoading: isLoadingSupervisors } = useSupervisors();
  // Mutations
  const registerProject = useRegisterProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const resubmitProject = useResubmitProject();

  // Form
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title || '',
      projectAbstract: project?.projectAbstract || '',
      domain: project?.domain || '',
      proposedSupervisorIds: project?.proposedSupervisors || [],
    },
  });

  // Reset form when project data changes
  useState(() => {
    if (project) {
      form.reset({
        title: project.title,
        projectAbstract: project.projectAbstract,
        domain: project.domain || '',
        proposedSupervisorIds: project.proposedSupervisors || [],
      });
    }
  });

  useEffect(()=>{
    // if Project then set form values
    if (project) {
      form.reset({
        title: project.title,
        projectAbstract: project.projectAbstract,
        domain: project.domain || '',
        proposedSupervisorIds: project.proposedSupervisors || [],
      });
    }
  },[project])

  // Computed values
  const isLeader = group?.leader?.id === user?.id;
  const hasGroup = !!group;
  const hasProject = !!project;
  const canEdit = isLeader && (project?.status === 'PENDING_APPROVAL' || project?.status === 'REJECTED');
  const canDelete = isLeader && project?.status === 'PENDING_APPROVAL';
  const canResubmit = isLeader && project?.status === 'REJECTED';

  // Handlers
  const handleSubmit = async (data: ProjectFormData) => {
    if (!group) return;

    try {
      if (hasProject && project) {
        await updateProject.mutateAsync({
          id: project.id,
          data: {
            title: data.title,
            projectAbstract: data.projectAbstract,
            domain: data.domain,
            proposedSupervisors:data.proposedSupervisorIds
          },
        });
        setIsEditing(false);
      } else {
        await registerProject.mutateAsync({
          groupId: group.id,
          title: data.title,
          projectAbstract: data.projectAbstract,
          domain: data.domain,
          proposedSupervisors:data.proposedSupervisorIds

        });
      }
      refetchProject();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    try {
      await deleteProject.mutateAsync(project.id);
      refetchProject();
      form.reset({ title: '', projectAbstract: '', domain: '' });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleResubmit = async () => {
    if (!project) return;
    try {
      await resubmitProject.mutateAsync(project.id);
      refetchProject();
      setIsEditing(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (project) {
      form.reset({
        title: project.title,
        projectAbstract: project.projectAbstract,
        domain: project.domain || '',
        proposedSupervisorIds: project.proposedSupervisors || [],
      });
    }
  };

  if (isLoadingGroup || isLoadingProject) {
    return (
      <RoleGuard allowedRoles={['STUDENT']}>
        <MainLayout>
          <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-[500px] w-full" />
          </div>
        </MainLayout>
      </RoleGuard>
    );
  }

  // No group state
  if (!hasGroup) {
    return (
      <RoleGuard allowedRoles={['STUDENT']}>
        <MainLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">My Project</h1>
              <p className="text-muted-foreground">View and manage your FYP project</p>
            </div>

            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Join a Group First</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  You need to be part of a group before you can register a project. Create or join a
                  group to get started.
                </p>
                <Link href="/student/group">
                  <Button className="mt-6">Go to Group</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </MainLayout>
      </RoleGuard>
    );
  }

  // Has group but no project - show registration form (leader only)
  if (!hasProject) {
    return (
      <RoleGuard allowedRoles={['STUDENT']}>
        <MainLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Register Project</h1>
              <p className="text-muted-foreground">
                {isLeader
                  ? 'Register your FYP project for approval'
                  : 'Only the group leader can register a project'}
              </p>
            </div>

            {!isLeader ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                  <h3 className="text-lg font-semibold">Waiting for Project Registration</h3>
                  <p className="text-muted-foreground mt-2 max-w-md">
                    Your group leader ({group.leader?.fullName}) needs to register a project for your
                    group.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Group Size Warning */}
                {!isGroupSizeValid && (
                  <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <AlertCircle className="h-6 w-6 text-yellow-600" />
                        <div>
                          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                            Group Size Requirement Not Met
                          </h3>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            {groupSizeMessage}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Required group size: {minGroupSize} - {maxGroupSize} members
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Project Registration Form</CardTitle>
                    <CardDescription>
                      Fill in the details below to register your project. Once submitted, it will be
                      reviewed by the FYP Committee.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your project title"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              A clear, descriptive title for your project (10-200 characters)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="domain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Domain / Area (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Machine Learning, Web Development, IoT"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              The technical domain or area your project falls under
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="projectAbstract"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Abstract</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your project in detail..."
                                className="min-h-[200px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              A detailed description of your project including objectives,
                              methodology, and expected outcomes (100-2000 characters)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="proposedSupervisorIds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Proposed Supervisors (Optional)</FormLabel>
                            <FormControl>
                              <MultiSelect
                                options={supervisors?.map((sup) => ({ label: sup.fullName, value: sup.id })) || []}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Choose Supervisors..."
                              />
                            </FormControl>
                            <FormDescription>
                              Select one or more supervisors you would like to propose for your
                              project.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-2">
                        <Button 
                          type="submit" 
                          disabled={registerProject.isPending || !isGroupSizeValid}
                          title={!isGroupSizeValid ? groupSizeMessage ?? 'Group size requirement not met' : undefined}
                        >
                          {registerProject.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Submit for Approval
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              </>
            )}
          </div>
        </MainLayout>
      </RoleGuard>
    );
  }

  // Has project - show project details
  return (
    <RoleGuard allowedRoles={['STUDENT']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Project</h1>
              <p className="text-muted-foreground">View and manage your FYP project</p>
            </div>
            <StatusBadge status={project.status} />
          </div>

          {/* Rejection Notice */}
          {project.status === 'REJECTED' && project.rejectionReason && (
            <Card className="border-destructive bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  Project Rejected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Reason for rejection:</p>
                <p className="text-sm">{project.rejectionReason}</p>
                {isLeader && (
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                      You can edit and resubmit your project after making the necessary changes.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="default" size="sm" disabled={resubmitProject.isPending}>
                          {resubmitProject.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Resubmit Project
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Resubmit Project?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to resubmit this project for approval? Make sure
                            you have addressed the rejection feedback before resubmitting.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleResubmit}>
                            Resubmit for Approval
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Project Details Card */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="space-y-1">
                <CardTitle>{isEditing ? 'Edit Project' : project.title}</CardTitle>
                {!isEditing && project.domain && (
                  <CardDescription>Domain: {project.domain}</CardDescription>
                )}
              </div>
              {canEdit && !isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Title</FormLabel>
                          <FormControl>
                            <Input  {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="domain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Domain / Area</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="projectAbstract"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Abstract</FormLabel>
                          <FormControl>
                            <Textarea className="min-h-[200px]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={updateProject.isPending}>
                        {updateProject.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-6">
                  {/* Abstract */}
                  <div>
                    <h4 className="font-semibold mb-2">Abstract</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {project.projectAbstract}
                    </p>
                  </div>

                  <Separator />

                  {/* Supervisor Info */}
                  {project.supervisor && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Assigned Supervisor
                      </h4>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{project.supervisor.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {project.supervisor.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Approval Info */}
                  {project.approvedBy && project.approvedAt && (
                    <div>
                      <h4 className="font-semibold mb-2">Approval Details</h4>
                      <p className="text-sm text-muted-foreground">
                        Approved by {project.approvedBy.fullName} on{' '}
                        {new Date(project.approvedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="text-sm text-muted-foreground">
                    <p>Group: {project.groupName}</p>
                    <p>Registered: {new Date(project.createdAt).toLocaleDateString()}</p>
                    {project.updatedAt !== project.createdAt && (
                      <p>Last updated: {new Date(project.updatedAt).toLocaleDateString()}</p>
                    )}
                  </div>

                  {/* Proposed Supervisors */}
                  {project.proposedSupervisorDetails && project.proposedSupervisorDetails.length > 0 && (
                    // use Badge to show proposed supervisors
                    <div>
                      <h4 className="font-semibold mb-2">Proposed Supervisors</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.proposedSupervisorDetails.map((sup) => (
                          <Badge key={sup.id} variant="outline">
                            {sup.fullName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Delete Action */}
                  {canDelete && (
                    <>
                      <Separator />
                      <div className="flex justify-end">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Project
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                project registration. You can register a new project afterwards.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Project
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
