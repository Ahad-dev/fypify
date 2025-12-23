'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ColumnDef } from '@tanstack/react-table';
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  FileText,
  Calendar,
  AlertCircle,
  Loader2,
  GraduationCap,
  Eye,
} from 'lucide-react';
import {
  useCommitteePendingProjects,
  useApproveProject,
  useRejectProject,
  useActiveDeadlineBatches,
  useCommitteeSupervisors,
  useSupervisors,
} from '@/shared/hooks';
import { Project, DeadlineBatch, SupervisorOption, ApproveProjectRequest, RejectProjectRequest } from '@/shared/types';
import { ProjectDetailsModal } from '@/components/project';

// ============ Form Schemas ============

const approveFormSchema = z.object({
  supervisorId: z.string().min(1, 'Please select a supervisor'),
  deadlineBatchId: z.string().optional(),
  comments: z.string().optional(),
});

const rejectFormSchema = z.object({
  reason: z.string().min(10, 'Please provide a detailed reason (at least 10 characters)'),
});

type ApproveFormData = z.infer<typeof approveFormSchema>;
type RejectFormData = z.infer<typeof rejectFormSchema>;

// ============ Helper Functions ============

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'PENDING_APPROVAL':
      return 'secondary';
    case 'APPROVED':
      return 'default';
    case 'REJECTED':
      return 'destructive';
    case 'IN_PROGRESS':
      return 'outline';
    default:
      return 'secondary';
  }
};

// ============ Main Component ============

export default function FypCommitteeProjectsPage() {
  const [approveDialogOpen, setApproveDialogOpen] = React.useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);

  // Data fetching
  const { data: projectsData, isLoading: projectsLoading } = useCommitteePendingProjects();
  const { data: batchesData, isLoading: batchesLoading } = useActiveDeadlineBatches();
  const { data: supervisorsData, isLoading: supervisorsLoading } = useSupervisors();

  // Mutations
  const approveProject = useApproveProject();
  const rejectProject = useRejectProject();

  const projects = projectsData?.content ?? [];
  const activeBatches = batchesData?.content ?? [];
  const availableSupervisors: SupervisorOption[] = supervisorsData ?? [];
    
  // Forms
  const approveForm = useForm<ApproveFormData>({
    resolver: zodResolver(approveFormSchema),
    defaultValues: {
      supervisorId: '',
      deadlineBatchId: '',
      comments: '',
    },
  });

  const rejectForm = useForm<RejectFormData>({
    resolver: zodResolver(rejectFormSchema),
    defaultValues: {
      reason: '',
    },
  });

  // Reset forms when dialog closes
  React.useEffect(() => {
    if (!approveDialogOpen) {
      approveForm.reset();
    }
  }, [approveDialogOpen, approveForm]);

  React.useEffect(() => {
    if (!rejectDialogOpen) {
      rejectForm.reset();
    }
  }, [rejectDialogOpen, rejectForm]);

  // Handlers
  const handleOpenApproveDialog = (project: Project) => {
    setSelectedProject(project);
    console.log(project)
    // Pre-select proposed supervisor if available
    if (project.proposedSupervisors && project.proposedSupervisors.length > 0 && availableSupervisors) {
      const proposedId = project.proposedSupervisors[0];
      const isAvailable = availableSupervisors.some((s) => s.id === proposedId);
      if (isAvailable) {
        approveForm.setValue('supervisorId', proposedId);
      }
    }
    
    setApproveDialogOpen(true);
  };

  const handleOpenRejectDialog = (project: Project) => {
    setSelectedProject(project);
    setRejectDialogOpen(true);
  };

  const handleOpenViewDialog = (project: Project) => {
    setSelectedProject(project);
    setViewDialogOpen(true);
  };

  const handleApprove = async (data: ApproveFormData) => {
    if (!selectedProject) return;
    
    const request: ApproveProjectRequest = {
      supervisorId: data.supervisorId,
      deadlineBatchId: data.deadlineBatchId && data.deadlineBatchId !== 'none' ? data.deadlineBatchId : undefined,
      comments: data.comments || undefined,
    };

    await approveProject.mutateAsync({ id: selectedProject.id, data: request });
    setApproveDialogOpen(false);
    setSelectedProject(null);
  };

  const handleReject = async (data: RejectFormData) => {
    if (!selectedProject) return;
    
    const request: RejectProjectRequest = {
      reason: data.reason,
    };

    await rejectProject.mutateAsync({ id: selectedProject.id, data: request });
    setRejectDialogOpen(false);
    setSelectedProject(null);
  };

  // Get selected batch for preview
  const selectedBatchId = approveForm.watch('deadlineBatchId');
  const selectedBatch = activeBatches.find((b) => b.id === selectedBatchId);
  console.log("Selected Batch: " , selectedBatch)

  // Table columns
  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: 'title',
      header: 'Project Title',
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <div className="font-medium truncate">{row.getValue('title')}</div>
          {row.original.domain && (
            <div className="text-xs text-muted-foreground">{row.original.domain}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'groupName',
      header: 'Group',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{row.getValue('groupName') || 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'proposedSupervisorDetails',
      header: 'Proposed Supervisor',
      cell: ({ row }) => {
        const supervisors = row.original.proposedSupervisorDetails;
        if (!supervisors || supervisors.length === 0) {
          return <span className="text-muted-foreground">Not specified</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span>{supervisors[0].fullName}</span>
            {supervisors.length > 1 && (
              <Badge variant="secondary" className="text-xs">
                +{supervisors.length - 1}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Submitted',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(new Date(row.getValue('createdAt')), 'MMM d, yyyy')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={getStatusBadgeVariant(row.getValue('status'))}>
          {row.original.statusDisplay || row.getValue('status')}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenViewDialog(project)}
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => handleOpenApproveDialog(project)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleOpenRejectDialog(project)}
            >
              <XCircle className="mr-1 h-4 w-4" />
              Reject
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <RoleGuard allowedRoles={['FYP_COMMITTEE', 'ADMIN']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">FYP Project Approvals</h1>
                <p className="text-muted-foreground text-sm">
                  Review and approve pending FYP project registrations
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-950 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Approval</p>
                    <div className="text-2xl font-bold">
                      {projectsLoading ? <Skeleton className="h-8 w-12" /> : projects.length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available Supervisors</p>
                    <div className="text-2xl font-bold">
                      {supervisorsLoading ? <Skeleton className="h-8 w-12" /> : availableSupervisors.length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-950 rounded-lg">
                    <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Deadline Batches</p>
                    <div className="text-2xl font-bold">
                      {batchesLoading ? <Skeleton className="h-8 w-12" /> : activeBatches.length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects Table */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Projects</CardTitle>
              <CardDescription>
                Projects awaiting committee review and approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold">All Caught Up!</h3>
                  <p className="text-muted-foreground">
                    There are no pending projects requiring approval.
                  </p>
                </div>
              ) : (
                <DataTable columns={columns} data={projects} />
              )}
            </CardContent>
          </Card>

          {/* Approve Dialog */}
          <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen} >
            <DialogContent className="max-w-lg h-[calc(100vh-5rem)] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Approve Project</DialogTitle>
                <DialogDescription>
                  Assign a supervisor and optional deadline batch to approve this project.
                </DialogDescription>
              </DialogHeader>

              {selectedProject && (
                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold">{selectedProject.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Group: {selectedProject.groupName || 'N/A'}
                  </p>
                </div>
              )}

              <Form {...approveForm}>
                <form onSubmit={approveForm.handleSubmit(handleApprove)} className="space-y-4">
                  <FormField
                    control={approveForm.control}
                    name="supervisorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supervisor *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a supervisor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableSupervisors.map((supervisor) => (
                              <SelectItem key={supervisor.id} value={supervisor.id}>
                                <div className="flex flex-col">
                                  <span>{supervisor.fullName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {supervisor.email}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={approveForm.control}
                    name="deadlineBatchId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deadline Batch (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a deadline batch" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No batch assigned</SelectItem>
                            {activeBatches.map((batch) => (
                              <SelectItem key={batch.id} value={batch.id}>
                                {batch.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Assign a deadline batch to set document submission deadlines.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Batch Preview */}
                  {selectedBatch && (
                    <Card className="border-dashed">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm">Deadline Batch Preview</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Applies From:</span>
                            <span>{format(new Date(selectedBatch.appliesFrom), 'MMM d, yyyy')}</span>
                          </div>
                          {selectedBatch.appliesUntil && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Applies Until:</span>
                              <span>{format(new Date(selectedBatch.appliesUntil), 'MMM d, yyyy')}</span>
                            </div>
                          )}
                          {selectedBatch.deadlines && selectedBatch.deadlines.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="font-medium mb-2">Deadlines:</p>
                              <div className="space-y-1">
                                {selectedBatch.deadlines.map((deadline) => (
                                  <div key={deadline.id} className="flex justify-between text-xs">
                                    <span>{deadline.documentTypeTitle}</span>
                                    <span className={deadline.isPast ? 'text-red-500' : ''}>
                                      {format(new Date(deadline.deadlineDate), 'MMM d, yyyy')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <FormField
                    control={approveForm.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comments (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional comments for the group..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setApproveDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={approveProject.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {approveProject.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve Project
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Reject Dialog */}
          <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  Reject Project
                </DialogTitle>
                <DialogDescription>
                  Please provide a detailed reason for rejecting this project. The group will be
                  notified of your decision.
                </DialogDescription>
              </DialogHeader>

              {selectedProject && (
                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold">{selectedProject.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Group: {selectedProject.groupName || 'N/A'}
                  </p>
                </div>
              )}

              <Form {...rejectForm}>
                <form onSubmit={rejectForm.handleSubmit(handleReject)} className="space-y-4">
                  <FormField
                    control={rejectForm.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rejection Reason *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please explain why this project is being rejected..."
                            className="resize-none min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This reason will be shared with the group members.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setRejectDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={rejectProject.isPending}
                    >
                      {rejectProject.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject Project
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* View Project Details Modal */}
          <ProjectDetailsModal
            project={selectedProject}
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
          />
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
