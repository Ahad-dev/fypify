'use client';

import { useState } from 'react';
import { usePendingSubmissions, useReviewSubmission } from '@/shared/hooks/useSubmission';
import { useProject } from '@/shared/hooks/useProject';
import { SubmissionReviewCard, SubmissionReviewModal } from '@/components/supervisor';
import { ProjectDetailsModal } from '@/components/project/ProjectDetailsModal';
import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { DocumentSubmission, SupervisorReviewRequest, SUBMISSION_STATUS_LABELS } from '@/shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileCheck, 
  Search, 
  RefreshCw,
  Inbox,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Supervisor Submissions Review Page
 * Lists all pending submissions for the supervisor to review
 */
export default function SupervisorSubmissionsPage() {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<DocumentSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Project Details Modal state
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Fetch project details when selected
  const { data: selectedProject } = useProject(selectedProjectId || '');

  // Fetch pending submissions
  const { 
    data: submissionsData, 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = usePendingSubmissions(page, pageSize);

  // Review mutation
  const reviewMutation = useReviewSubmission();

  // Filter submissions by search query
  const filteredSubmissions = submissionsData?.content?.filter((s) =>
    s.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.documentTypeTitle.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleReview = (submission: DocumentSubmission) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };
  
  const handleViewProjectDetails = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsProjectModalOpen(true);
  };

  const handleSubmitReview = async (id: string, data: SupervisorReviewRequest) => {
    await reviewMutation.mutateAsync({ id, data });
  };

  const totalPages = submissionsData?.totalPages || 0;
  const totalElements = submissionsData?.totalElements || 0;

  return (
    <RoleGuard allowedRoles={['SUPERVISOR', 'ADMIN']}>
      <MainLayout>
        <div className="container py-8 space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileCheck className="h-8 w-8 text-primary" />
            </div>
            Submission Reviews
          </h1>
          <p className="text-muted-foreground mt-2">
            Review and provide feedback on student submissions
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

      {/* Search and Filters */}
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
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1 py-2 px-3">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-semibold">{totalElements}</span>
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
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
      ) : filteredSubmissions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No Pending Submissions</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery
                ? 'No submissions match your search. Try a different query.'
                : 'All submissions have been reviewed. Check back later!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <SubmissionReviewCard
              key={submission.id}
              submission={submission}
              onReview={handleReview}
              onViewDetails={handleViewProjectDetails}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <SubmissionReviewModal
        submission={selectedSubmission}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onReview={handleSubmitReview}
        isLoading={reviewMutation.isPending}
      />
      
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
