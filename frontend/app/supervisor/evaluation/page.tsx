'use client';

import { useState, useMemo } from 'react';
import { useSupervisorLockedSubmissions, useSubmitSupervisorMarks } from '@/shared/hooks/useSubmission';
import { useProject } from '@/shared/hooks/useProject';
import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { ProjectDetailsModal } from '@/components/project/ProjectDetailsModal';
import { DocumentSubmission, SupervisorMarksRequest } from '@/shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ClipboardCheck,
  Search,
  RefreshCw,
  Inbox,
  Eye,
  Star,
  FileText,
  Clock,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Download,
  ListTodo,
  CheckSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

/**
 * Supervisor Evaluation Page
 * Allows supervisors to provide marks on locked submissions for their projects
 * Has two tabs: Pending (to be evaluated) and Evaluated (already marked)
 */
export default function SupervisorEvaluationPage() {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(50); // Fetch more to filter client-side
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'evaluated'>('pending');
  
  // Modal state
  const [selectedSubmission, setSelectedSubmission] = useState<DocumentSubmission | null>(null);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  // Form state
  const [score, setScore] = useState<number | ''>('');
  
  // Fetch locked submissions
  const { 
    data: submissionsData, 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = useSupervisorLockedSubmissions(page, pageSize);
  
  // Fetch project details when selected
  const { data: selectedProject } = useProject(selectedProjectId || '');
  
  // Submit marks mutation
  const submitMarksMutation = useSubmitSupervisorMarks();

  // Split submissions into pending and evaluated
  const { pendingSubmissions, evaluatedSubmissions } = useMemo(() => {
    const allSubmissions = submissionsData?.content || [];
    
    // Filter by search query first
    const filtered = allSubmissions.filter((s) =>
      s.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.documentTypeTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return {
      pendingSubmissions: filtered.filter(s => s.supervisorScore === null || s.supervisorScore === undefined),
      evaluatedSubmissions: filtered.filter(s => s.supervisorScore !== null && s.supervisorScore !== undefined),
    };
  }, [submissionsData?.content, searchQuery]);

  const handleOpenEvalModal = (submission: DocumentSubmission) => {
    setSelectedSubmission(submission);
    setScore('');
    setIsEvalModalOpen(true);
  };
  
  const handleViewProjectDetails = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsProjectModalOpen(true);
  };

  const handleSubmitMarks = async () => {
    if (!selectedSubmission || score === '') return;
    
    const data: SupervisorMarksRequest = {
      score: Number(score),
    };

    await submitMarksMutation.mutateAsync({ 
      submissionId: selectedSubmission.id, 
      data 
    });
    setIsEvalModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      'LOCKED_FOR_EVAL': { variant: 'outline', label: 'Locked for Evaluation' },
      'EVAL_IN_PROGRESS': { variant: 'secondary', label: 'In Progress' },
      'EVAL_FINALIZED': { variant: 'default', label: 'Finalized' },
    };
    const config = statusConfig[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Submission card component for reusability
  const SubmissionCard = ({ submission, showEvalButton }: { submission: DocumentSubmission; showEvalButton: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {submission.projectTitle}
              </CardTitle>
              <CardDescription className="mt-1 flex items-center gap-2">
                <span>{submission.documentTypeTitle}</span>
                <span className="text-xs">•</span>
                <span>Version {submission.version}</span>
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(submission.status)}
            {submission.supervisorScore !== null && submission.supervisorScore !== undefined && (
              <Badge variant="default" className="bg-green-600">
                <Star className="h-3 w-3 mr-1" />
                Score: {submission.supervisorScore}/100
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Submission Info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Submitted: {format(new Date(submission.uploadedAt), 'MMM d, yyyy h:mm a')}
          </span>
          {submission.deadline && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Deadline: {format(new Date(submission.deadline), 'MMM d, yyyy')}
            </span>
          )}
          {submission.supervisorMarkedAt && (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Marked: {format(new Date(submission.supervisorMarkedAt), 'MMM d, yyyy h:mm a')}
            </span>
          )}
        </div>
        
        <Separator />
        
        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {submission.file?.secureUrl && (
              <>
                <Button variant="outline" size="sm" asChild>
                  <a href={submission.file.secureUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View PDF
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={submission.file.secureUrl} download>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </a>
                </Button>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewProjectDetails(submission.projectId)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Project Details
            </Button>
            {showEvalButton && (
              <Button
                variant="default"
                size="sm"
                onClick={() => handleOpenEvalModal(submission)}
              >
                <Star className="h-4 w-4 mr-1" />
                Provide Marks
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Empty state component
  const EmptyState = ({ isPending }: { isPending: boolean }) => (
    <Card>
      <CardContent className="py-16 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">
          {isPending ? 'No Pending Evaluations' : 'No Evaluated Submissions'}
        </h3>
        <p className="text-muted-foreground mt-1">
          {searchQuery
            ? 'No submissions match your search. Try a different query.'
            : isPending 
              ? 'You have evaluated all locked submissions for your projects.'
              : 'You have not evaluated any submissions yet.'}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <RoleGuard allowedRoles={['SUPERVISOR', 'ADMIN']}>
      <MainLayout>
        <div className="container py-8 space-y-8 w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ClipboardCheck className="h-8 w-8 text-primary" />
                </div>
                Supervisor Evaluation
              </h1>
              <p className="text-muted-foreground mt-2">
                Provide marks for locked submissions from your supervised projects
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
              Refresh
            </Button>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by project or document type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          {isLoading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="border-destructive">
              <CardContent className="py-8 text-center">
                <p className="text-destructive">
                  Failed to load submissions. Please try again.
                </p>
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  className="mt-4"
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'pending' | 'evaluated')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="pending" className="gap-2">
                  <ListTodo className="h-4 w-4" />
                  Pending Evaluation
                  <Badge variant="secondary" className="ml-1">
                    {pendingSubmissions.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="evaluated" className="gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Evaluated
                  <Badge variant="secondary" className="ml-1">
                    {evaluatedSubmissions.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4">
                {pendingSubmissions.length === 0 ? (
                  <EmptyState isPending={true} />
                ) : (
                  pendingSubmissions.map((submission) => (
                    <SubmissionCard 
                      key={submission.id} 
                      submission={submission} 
                      showEvalButton={true} 
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="evaluated" className="space-y-4">
                {evaluatedSubmissions.length === 0 ? (
                  <EmptyState isPending={false} />
                ) : (
                  evaluatedSubmissions.map((submission) => (
                    <SubmissionCard 
                      key={submission.id} 
                      submission={submission} 
                      showEvalButton={false} 
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}

          {/* Evaluation Modal */}
          <Dialog open={isEvalModalOpen} onOpenChange={setIsEvalModalOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Submit Supervisor Marks
                </DialogTitle>
                <DialogDescription>
                  Provide marks for: {selectedSubmission?.projectTitle} - {selectedSubmission?.documentTypeTitle}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Score Input */}
                <div className="space-y-2">
                  <Label htmlFor="score" className="flex items-center gap-2">
                    Score (0-100) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="score"
                    type="number"
                    min={0}
                    max={100}
                    value={score}
                    onChange={(e) => setScore(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Enter score (0-100)"
                  />
                  {score !== '' && (Number(score) < 0 || Number(score) > 100) && (
                    <p className="text-sm text-red-500">Score must be between 0 and 100</p>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEvalModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitMarks} 
                  disabled={
                    score === '' || 
                    Number(score) < 0 || 
                    Number(score) > 100 ||
                    submitMarksMutation.isPending
                  }
                >
                  {submitMarksMutation.isPending ? 'Submitting...' : 'Submit Marks'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Project Details Modal */}
          <ProjectDetailsModal
            project={selectedProject || null}
            open={isProjectModalOpen}
            onOpenChange={setIsProjectModalOpen}
          />
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
