'use client';

import { useState, useMemo } from 'react';
import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { FileUploader } from '@/components/submission';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  FileText,
  Upload,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock,
  ExternalLink,
  Calendar,
  History,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useMyGroup, useProject } from '@/shared/hooks';
import {
  useActiveDocumentTypes,
  useProjectSubmissions,
  useSubmissionsByType,
  useCreateSubmission,
  useMarkAsFinal,
  useProjectDeadlines,
} from '@/shared/hooks/useSubmission';
import {
  CloudinaryFile,
  DocumentSubmission,
  DocumentType,
  SubmissionStatus,
  SUBMISSION_STATUS_LABELS,
  ProjectDeadline,
} from '@/shared/types';
import Link from 'next/link';
import { formatDistanceToNow, format, isPast, isFuture, isAfter, isBefore, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

// Extended document type with deadline status
interface DocumentTypeWithStatus extends DocumentType {
  deadline: ProjectDeadline | null;
  deadlineDate: Date | null;
  isPast: boolean;
  isFuture: boolean;
  isActiveNow: boolean;  // Deadline exists and is current or passed
  canUpload: boolean;
  hasFinalSubmission: boolean;
  status: 'no-deadline' | 'late' | 'active' | 'upcoming' | 'locked' | 'revision';
  daysUntilDeadline: number | null;
  sortOrder?: number;
  latestSubmission?: DocumentSubmission | null;
}

// Status badge component
function StatusBadge({ status, isLate }: { status: SubmissionStatus; isLate?: boolean }) {
  const statusConfig: Record<SubmissionStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
    PENDING_SUPERVISOR: { variant: 'secondary', icon: Clock },
    REVISION_REQUESTED: { variant: 'destructive', icon: XCircle },
    APPROVED_BY_SUPERVISOR: { variant: 'default', icon: CheckCircle2 },
    LOCKED_FOR_EVAL: { variant: 'outline', icon: Lock },
    EVAL_IN_PROGRESS: { variant: 'secondary', icon: Clock },
    EVAL_FINALIZED: { variant: 'default', icon: CheckCircle2 },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {SUBMISSION_STATUS_LABELS[status]}
      </Badge>
      {isLate && (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Late
        </Badge>
      )}
    </div>
  );
}

// Submission history item
function SubmissionHistoryItem({ submission }: { submission: DocumentSubmission }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded bg-muted">
          <FileText className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Version {submission.version}</span>
            {submission.isFinal && (
              <Badge variant="default" className="text-xs">Final</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Uploaded {formatDistanceToNow(new Date(submission.uploadedAt), { addSuffix: true })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={submission.status} isLate={submission.isLateSubmission} />
        {submission.file && (
          <Button variant="ghost" size="sm" asChild>
            <a href={submission.file.secureUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

export default function StudentSubmissionsPage() {
  const { user } = useAuthContext();
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);

  // Queries
  const { data: group, isLoading: isLoadingGroup } = useMyGroup();
  const { data: project, isLoading: isLoadingProject } = useProject(group?.projectId || '');
  const { data: documentTypes, isLoading: isLoadingDocTypes } = useActiveDocumentTypes();
  const { data: allSubmissions, isLoading: isLoadingSubmissions, refetch: refetchSubmissions } = 
    useProjectSubmissions(project?.id || '');
  const { data: deadlines } = useProjectDeadlines(project?.id || '');

  // Mutations
  const createSubmission = useCreateSubmission();
  const markAsFinal = useMarkAsFinal();

  // Computed values
  const isLeader = group?.leader?.id === user?.id;
  const hasGroup = !!group;
  const hasProject = !!project;
  const projectId = project?.id || '';

  // Get submissions grouped by document type
  const submissionsByType = useMemo(() => {
    if (!allSubmissions) return {};
    return allSubmissions.reduce((acc, sub) => {
      if (!acc[sub.documentTypeId]) {
        acc[sub.documentTypeId] = [];
      }
      acc[sub.documentTypeId].push(sub);
      return acc;
    }, {} as Record<string, DocumentSubmission[]>);
  }, [allSubmissions]);

  // Calculate document types with their deadline status
  // This determines which document types the user can upload to
  const documentTypesWithDeadlineStatus: DocumentTypeWithStatus[] = useMemo(() => {
    if (!documentTypes || !deadlines) return [];
    
    const now = new Date();
    
    // First, create a map of document types that have deadlines assigned
    const docTypesWithDeadlines = documentTypes
      .map(docType => {
        const deadline = deadlines.find(d => d.documentTypeId === docType.id) || null;
        if (!deadline) return null; // Only show documents that have deadlines configured
        
        const deadlineDate = new Date(deadline.deadlineDate);
        const deadlineIsPast = isPast(deadlineDate);
        const deadlineIsFuture = isFuture(deadlineDate);
        
        // Calculate days until deadline
        const daysUntilDeadline = Math.ceil(
          (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // Check existing submissions for this doc type
        const existingSubmissions = submissionsByType[docType.id] || [];
        const hasFinalSubmission = existingSubmissions.some(s => s.isFinal);
        const latestSub = existingSubmissions.length > 0 
          ? [...existingSubmissions].sort((a, b) => b.version - a.version)[0] 
          : null;
        
        const isLockedOrApproved = latestSub && (
          latestSub.status === 'APPROVED_BY_SUPERVISOR' ||
          latestSub.status === 'LOCKED_FOR_EVAL' ||
          latestSub.status === 'EVAL_IN_PROGRESS' ||
          latestSub.status === 'EVAL_FINALIZED'
        );
        
        // Check if revision is requested - can upload again
        const needsRevision = latestSub?.status === 'REVISION_REQUESTED';
        
        // Determine status
        let status: 'no-deadline' | 'late' | 'active' | 'upcoming' | 'locked' | 'revision' = 'upcoming';
        
        if (hasFinalSubmission || isLockedOrApproved) {
          status = 'locked';
        } else if (needsRevision) {
          status = 'revision'; // Needs revision - can upload
        } else if (deadlineIsPast && !latestSub) {
          status = 'late'; // Deadline passed but no submission yet
        } else if (deadlineIsPast && latestSub) {
          status = 'late'; // Has submission but deadline passed
        } else {
          status = 'active'; // Deadline not passed
        }
        
        return {
          ...docType,
          deadline,
          deadlineDate,
          isPast: deadlineIsPast,
          isFuture: deadlineIsFuture,
          isActiveNow: !deadlineIsFuture || status === 'revision',
          canUpload: false, // Will be determined below
          hasFinalSubmission,
          status,
          daysUntilDeadline,
          sortOrder: deadline.sortOrder || 999,
          latestSubmission: latestSub,
        };
      })
      .filter((dt): dt is NonNullable<typeof dt> => dt !== null)
      // Sort by deadline date (earliest deadline first)
      .sort((a, b) => a.deadlineDate.getTime() - b.deadlineDate.getTime());
    
    // Find the first document type that is not yet completed (locked/approved)
    // This is the "current" document that can be uploaded at any time
    const currentDocIndex = docTypesWithDeadlines.findIndex(dt => dt.status !== 'locked');
    
    // Now set canUpload based on the sequence
    return docTypesWithDeadlines.map((dt, index) => {
      let canUpload = false;
      
      if (dt.status === 'locked') {
        // Cannot upload if locked/approved
        canUpload = false;
      } else if (dt.status === 'revision') {
        // Can always upload if revision is requested
        canUpload = true;
      } else if (index === currentDocIndex) {
        // This is the current document in sequence - can upload anytime
        canUpload = true;
      } else if (index > currentDocIndex && docTypesWithDeadlines[currentDocIndex]?.status === 'locked') {
        // If current document is locked, the next one becomes current
        canUpload = index === currentDocIndex + 1;
      }
      
      // Also allow upload if deadline is passed and no submission yet (late)
      if (dt.status === 'late' && !dt.latestSubmission) {
        canUpload = true;
      }
      
      return {
        ...dt,
        canUpload,
      };
    });
  }, [documentTypes, deadlines, submissionsByType]);

  // All document types with deadlines (for viewing in dropdown)
  const allDocTypesWithDeadlines = useMemo(() => {
    return documentTypesWithDeadlineStatus;
  }, [documentTypesWithDeadlineStatus]);

  // Get selected document type with status
  const selectedDocTypeInfo = useMemo(() => {
    return documentTypesWithDeadlineStatus.find(dt => dt.id === selectedDocType) || null;
  }, [documentTypesWithDeadlineStatus, selectedDocType]);

  // Get deadline for selected document type
  const selectedDeadline = useMemo(() => {
    if (!deadlines || !selectedDocType) return null;
    return deadlines.find((d) => d.documentTypeId === selectedDocType);
  }, [deadlines, selectedDocType]);

  // Check if deadline has passed
  const isDeadlinePassed = selectedDeadline ? isPast(new Date(selectedDeadline.deadlineDate)) : false;

  // Get latest submission for selected type
  const latestSubmission = useMemo(() => {
    const submissions = submissionsByType[selectedDocType];
    if (!submissions || submissions.length === 0) return null;
    return submissions.sort((a, b) => b.version - a.version)[0];
  }, [submissionsByType, selectedDocType]);

  // Can upload new version?
  const canUpload = isLeader && selectedDocType && selectedDocTypeInfo?.canUpload && (
    !latestSubmission || 
    latestSubmission.status === 'PENDING_SUPERVISOR' ||
    latestSubmission.status === 'REVISION_REQUESTED'
  );

  // Handle file upload complete
  const handleFileUploaded = (file: CloudinaryFile) => {
    setUploadedFileId(file.id);
  };

  // Handle create submission
  const handleCreateSubmission = async () => {
    if (!uploadedFileId || !selectedDocType || !projectId) return;

    try {
      await createSubmission.mutateAsync({
        projectId,
        data: {
          documentTypeId: selectedDocType,
          fileId: uploadedFileId,
        },
      });
      setUploadedFileId(null);
      refetchSubmissions();
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Handle mark as final
  const handleMarkAsFinal = async (submissionId: string) => {
    try {
      await markAsFinal.mutateAsync(submissionId);
      refetchSubmissions();
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Loading state
  if (isLoadingGroup || isLoadingProject || isLoadingDocTypes) {
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

  // No group state
  if (!hasGroup) {
    return (
      <RoleGuard allowedRoles={['STUDENT']}>
        <MainLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Document Submissions</h1>
              <p className="text-muted-foreground">Upload and manage your project documents</p>
            </div>
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Join a Group First</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  You need to be part of a group with a registered project before you can submit documents.
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

  // No project state
  if (!hasProject) {
    return (
      <RoleGuard allowedRoles={['STUDENT']}>
        <MainLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Document Submissions</h1>
              <p className="text-muted-foreground">Upload and manage your project documents</p>
            </div>
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Register a Project First</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  Your group needs to have a registered and approved project before you can submit documents.
                </p>
                <Link href="/student/project">
                  <Button className="mt-6">Go to Project</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </MainLayout>
      </RoleGuard>
    );
  }

  // Project not approved state - check if project is approved before allowing submissions
  const isProjectApproved = project.status === 'APPROVED' || project.status === 'IN_PROGRESS' || project.status === 'COMPLETED';
  
  if (!isProjectApproved) {
    return (
      <RoleGuard allowedRoles={['STUDENT']}>
        <MainLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Document Submissions</h1>
              <p className="text-muted-foreground">Upload and manage your project documents</p>
            </div>
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                {project.status === 'PENDING_APPROVAL' ? (
                  <>
                    <Clock className="h-12 w-12 text-amber-500 mb-4" />
                    <h3 className="text-lg font-semibold">Project Pending Approval</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                      Your project "{project.title}" is currently pending approval by the FYP Committee. 
                      You can submit documents once your project has been approved.
                    </p>
                    <Badge variant="secondary" className="mt-4">
                      <Clock className="h-3 w-3 mr-1" />
                      Status: Pending Approval
                    </Badge>
                  </>
                ) : project.status === 'REJECTED' ? (
                  <>
                    <XCircle className="h-12 w-12 text-destructive mb-4" />
                    <h3 className="text-lg font-semibold">Project Rejected</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                      Unfortunately, your project "{project.title}" was rejected by the FYP Committee.
                      {project.rejectionReason && (
                        <span className="block mt-2 text-sm">
                          Reason: {project.rejectionReason}
                        </span>
                      )}
                    </p>
                    <Badge variant="destructive" className="mt-4">
                      <XCircle className="h-3 w-3 mr-1" />
                      Status: Rejected
                    </Badge>
                    <Link href="/student/project">
                      <Button className="mt-6">Go to Project</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">Project Not Ready</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                      Your project needs to be approved before you can submit documents.
                    </p>
                    <Badge variant="secondary" className="mt-4">
                      Status: {project.statusDisplay || project.status}
                    </Badge>
                    <Link href="/student/project">
                      <Button className="mt-6">Go to Project</Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
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
          <div>
            <h1 className="text-3xl font-bold">Document Submissions</h1>
            <p className="text-muted-foreground">
              Upload and manage your project documents for {project.title}
            </p>
          </div>

          {/* Leader notice */}
          {!isLeader && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
              <CardContent className="flex items-center gap-3 py-4">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Only the group leader can upload documents. Contact {group.leader?.fullName} to upload submissions.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Deadline Timeline Overview */}
          {documentTypesWithDeadlineStatus.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  Document Deadlines
                </CardTitle>
                <CardDescription>
                  Overview of all document submission deadlines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {documentTypesWithDeadlineStatus.map((docType) => (
                    <div
                      key={docType.id}
                      className={cn(
                        "p-3 rounded-lg border transition-colors",
                        docType.status === 'revision' && "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900",
                        docType.status === 'active' && "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900",
                        docType.status === 'late' && "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900",
                        docType.status === 'upcoming' && "bg-muted border-muted-foreground/20",
                        docType.status === 'locked' && "bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700",
                        docType.status === 'no-deadline' && "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{docType.title}</p>
                          {docType.deadlineDate ? (
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(docType.deadlineDate, 'MMM d, yyyy')}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-1">No deadline</p>
                          )}
                        </div>
                        <div className="shrink-0">
                          {docType.status === 'revision' && (
                            <Badge variant="destructive" className="text-xs">
                              <XCircle className="h-3 w-3 mr-1" />
                              Revision
                            </Badge>
                          )}
                          {docType.status === 'active' && (
                            <Badge variant="default" className="text-xs bg-green-600">
                              <Clock className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                          {docType.status === 'late' && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Late
                            </Badge>
                          )}
                          {docType.status === 'upcoming' && (
                            <Badge variant="secondary" className="text-xs">
                              Upcoming
                            </Badge>
                          )}
                          {docType.status === 'locked' && (
                            <Badge variant="outline" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Complete
                            </Badge>
                          )}
                          {docType.status === 'no-deadline' && (
                            <Badge variant="secondary" className="text-xs bg-blue-600 text-white">
                              Open
                            </Badge>
                          )}
                        </div>
                      </div>
                      {docType.daysUntilDeadline !== null && docType.status !== 'locked' && (
                        <p className={cn(
                          "text-xs mt-2",
                          docType.daysUntilDeadline < 0 && "text-red-600 dark:text-red-400",
                          docType.daysUntilDeadline >= 0 && docType.daysUntilDeadline <= 3 && "text-amber-600 dark:text-amber-400",
                          docType.daysUntilDeadline > 3 && "text-muted-foreground"
                        )}>
                          {docType.daysUntilDeadline < 0
                            ? `${Math.abs(docType.daysUntilDeadline)} days overdue`
                            : docType.daysUntilDeadline === 0
                            ? 'Due today!'
                            : `${docType.daysUntilDeadline} days remaining`
                          }
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Document Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Document
                  </CardTitle>
                  <CardDescription>
                    Select a document type and upload your file
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Document Type Select */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Document Type</label>
                    {allDocTypesWithDeadlines.length === 0 ? (
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No document deadlines have been assigned to your project yet.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Please wait for the FYP Committee to assign deadlines to your project.
                        </p>
                      </div>
                    ) : (
                      <Select
                        value={selectedDocType}
                        onValueChange={setSelectedDocType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type to view/upload..." />
                        </SelectTrigger>
                        <SelectContent>
                          {allDocTypesWithDeadlines.map((docType) => (
                            <SelectItem key={docType.id} value={docType.id}>
                              <div className="flex items-center gap-2 w-full">
                                <span className={docType.status === 'locked' ? 'text-muted-foreground' : ''}>
                                  {docType.title}
                                </span>
                                {docType.status === 'revision' && (
                                  <Badge variant="destructive" className="text-xs ml-auto">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Revision
                                  </Badge>
                                )}
                                {docType.status === 'late' && (
                                  <Badge variant="destructive" className="text-xs ml-auto">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Late
                                  </Badge>
                                )}
                                {docType.status === 'active' && docType.canUpload && (
                                  <Badge variant="default" className="text-xs ml-auto bg-green-600">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Current
                                  </Badge>
                                )}
                                {docType.status === 'active' && !docType.canUpload && (
                                  <Badge variant="secondary" className="text-xs ml-auto">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Upcoming
                                  </Badge>
                                )}
                                {docType.status === 'locked' && (
                                  <Badge variant="outline" className="text-xs ml-auto">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Complete
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Deadline Info */}
                  {selectedDeadline && (
                    <div className={cn(
                      "flex items-center gap-3 p-3 rounded-lg",
                      isDeadlinePassed 
                        ? "bg-destructive/10 text-destructive" 
                        : "bg-muted"
                    )}>
                      <Calendar className="h-5 w-5" />
                      <div>
                        <p className="text-sm font-medium">
                          Deadline: {format(new Date(selectedDeadline.deadlineDate), 'PPP p')}
                        </p>
                        <p className="text-xs">
                          {isDeadlinePassed 
                            ? 'Deadline has passed - submissions will be marked as late'
                            : `${formatDistanceToNow(new Date(selectedDeadline.deadlineDate))} remaining`
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Latest Submission Status */}
                  {latestSubmission && (
                    <div className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Latest Submission</span>
                        <StatusBadge 
                          status={latestSubmission.status} 
                          isLate={latestSubmission.isLateSubmission} 
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Version {latestSubmission.version} • Uploaded {formatDistanceToNow(new Date(latestSubmission.uploadedAt), { addSuffix: true })}</p>
                      </div>
                      {latestSubmission.supervisorComments && (
                        <div className="p-3 bg-muted rounded">
                          <p className="text-xs font-medium mb-1">Supervisor Comments:</p>
                          <p className="text-sm">{latestSubmission.supervisorComments}</p>
                        </div>
                      )}
                      {latestSubmission.file && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={latestSubmission.file.secureUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Document
                          </a>
                        </Button>
                      )}
                    </div>
                  )}

                  {/* File Uploader */}
                  {isLeader && selectedDocType && canUpload && (
                    <>
                      <Separator />
                      <FileUploader
                        onFileUploaded={handleFileUploaded}
                        folder={`submissions/${projectId}/${selectedDocType}`}
                        disabled={!canUpload}
                      />

                      {/* Submit Button */}
                      {uploadedFileId && (
                        <Button
                          onClick={handleCreateSubmission}
                          disabled={createSubmission.isPending}
                          className="w-full"
                        >
                          {createSubmission.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating Submission...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Submit for Review
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  )}

                  {/* Cannot upload message */}
                  {selectedDocType && !canUpload && latestSubmission && (
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {latestSubmission.status === 'APPROVED_BY_SUPERVISOR'
                          ? 'Document has been approved. No more uploads allowed.'
                          : latestSubmission.status === 'LOCKED_FOR_EVAL'
                          ? 'Document is locked for evaluation.'
                          : 'Cannot upload at this time.'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Submission History */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Submission History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingSubmissions ? (
                    <div className="space-y-3">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : Object.keys(submissionsByType).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No submissions yet
                    </p>
                  ) : (
                    <Accordion type="single" collapsible className="w-full">
                      {documentTypes?.map((docType) => {
                        const submissions = submissionsByType[docType.id] || [];
                        if (submissions.length === 0) return null;
                        
                        return (
                          <AccordionItem key={docType.id} value={docType.id}>
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span>{docType.title}</span>
                                <Badge variant="secondary" className="ml-2">
                                  {submissions.length}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-1">
                                {submissions
                                  .sort((a, b) => b.version - a.version)
                                  .map((sub) => (
                                    <SubmissionHistoryItem key={sub.id} submission={sub} />
                                  ))}
                              </div>
                              
                              {/* Mark as Final button */}
                              {isLeader && submissions.some(s => 
                                s.status === 'APPROVED_BY_SUPERVISOR' && !s.isFinal
                              ) && (
                                <div className="mt-4 pt-4 border-t">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="default" size="sm" className="w-full">
                                        <Lock className="mr-2 h-4 w-4" />
                                        Mark as Final
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Mark as Final?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will mark the latest approved submission as your final version.
                                          No further changes will be allowed after this action.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => {
                                            const approved = submissions.find(
                                              s => s.status === 'APPROVED_BY_SUPERVISOR' && !s.isFinal
                                            );
                                            if (approved) handleMarkAsFinal(approved.id);
                                          }}
                                        >
                                          Mark as Final
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}

