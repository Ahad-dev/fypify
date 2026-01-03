'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Calculator,
  Send,
  CheckCircle,
  Clock,
  Search,
  TrendingUp,
  Award,
  Loader2,
  AlertCircle,
  Eye,
  FileText,
  Users,
  ExternalLink,
  Star,
  ClipboardCheck,
} from 'lucide-react';
import {
  useFinalResult,
  useComputeFinalResult,
  useReleaseFinalResult,
  useProjectSubmissions,
  useActiveDocumentTypes,
  useProjectDeadlines,
} from '@/shared/hooks';
import { useProjects } from '@/shared/hooks/useProject';
import { useEvaluationSummary } from '@/shared/hooks/useEvaluation';
import { FinalResult, DocumentScoreBreakdown, DocumentSubmission, ProjectDeadline } from '@/shared/types';
import { Project } from '@/shared/types/project.types';

// ============ Score Breakdown Table ============

function ScoreBreakdownTable({ details }: { details: FinalResult['details'] }) {
  if (!details || !details.documents || details.documents.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        No score breakdown available
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Document</TableHead>
          <TableHead className="text-center">Supervisor</TableHead>
          <TableHead className="text-center">Committee Avg</TableHead>
          <TableHead className="text-center">Weighted</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {details.documents.map((doc: DocumentScoreBreakdown) => (
          <TableRow key={doc.submissionId}>
            <TableCell className="font-medium">{doc.docTypeTitle}</TableCell>
            <TableCell className="text-center">
              <span className="font-mono">{doc.supervisorScore.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground ml-1">({doc.supervisorWeight}%)</span>
            </TableCell>
            <TableCell className="text-center">
              <span className="font-mono">{doc.committeeAvgScore.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground ml-1">
                ({doc.committeeWeight}%, {doc.committeeEvaluatorCount} eval)
              </span>
            </TableCell>
            <TableCell className="text-center">
              <Badge variant="secondary" className="font-mono">
                {doc.weightedScore.toFixed(2)}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
        <TableRow className="bg-muted/50">
          <TableCell colSpan={3} className="font-semibold text-right">
            Total Score:
          </TableCell>
          <TableCell className="text-center">
            <Badge className="font-mono text-lg">
              {details.totalScore.toFixed(2)}
            </Badge>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

// ============ Submission Details Card ============

interface SubmissionDetailsCardProps {
  submission: DocumentSubmission;
}

function SubmissionDetailsCard({ submission }: SubmissionDetailsCardProps) {
  const { data: evalSummary, isLoading: loadingEval } = useEvaluationSummary(submission.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EVAL_FINALIZED':
        return 'border-l-green-500';
      case 'EVAL_IN_PROGRESS':
        return 'border-l-blue-500';
      case 'LOCKED_FOR_EVAL':
        return 'border-l-yellow-500';
      case 'APPROVED_BY_SUPERVISOR':
        return 'border-l-emerald-500';
      default:
        return 'border-l-gray-500';
    }
  };

  // Get supervisor score - prefer from submission, fallback to evalSummary
  const supervisorScore = submission.supervisorScore ?? evalSummary?.supervisorMarks?.score ?? null;
  const supervisorMarkedAt = submission.supervisorMarkedAt ?? evalSummary?.supervisorMarks?.createdAt ?? null;
  const supervisorName = evalSummary?.supervisorMarks?.supervisorName ?? null;

  return (
    <Card className={`border-l-4 ${getStatusColor(submission.status)}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">{submission.documentTypeTitle}</CardTitle>
          </div>
          <Badge variant={submission.status === 'EVAL_FINALIZED' ? 'default' : 'secondary'}>
            {submission.statusDisplay}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Version {submission.version} • Uploaded {format(new Date(submission.uploadedAt), 'MMM d, yyyy')}
          {submission.uploadedByName && ` by ${submission.uploadedByName}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Info */}
        {submission.file && (
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm truncate">{submission.file.fileName}</span>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <a href={submission.file.secureUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        )}

        {/* Marks Section */}
        <div className="space-y-3">
          {/* Supervisor Marks */}
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-blue-600" />
              <div>
                <span className="text-sm font-medium">Supervisor Score</span>
                {supervisorName && (
                  <p className="text-xs text-muted-foreground">{supervisorName}</p>
                )}
              </div>
            </div>
            {loadingEval ? (
              <Skeleton className="h-6 w-16" />
            ) : supervisorScore != null ? (
              <div className="text-right">
                <span className="text-lg font-bold text-blue-600">{supervisorScore.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">/100</span>
                {supervisorMarkedAt && (
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(supervisorMarkedAt), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            ) : (
              <Badge variant="outline">Not Marked</Badge>
            )}
          </div>

          {/* Committee Marks */}
          <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Committee Evaluation</span>
              </div>
              {loadingEval ? (
                <Skeleton className="h-6 w-16" />
              ) : evalSummary ? (
                <div className="text-right">
                  {evalSummary.averageScore != null ? (
                    <>
                      <span className="text-lg font-bold text-purple-600">{evalSummary.averageScore.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">/100 avg</span>
                    </>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </div>
              ) : null}
            </div>

            {/* Evaluation Progress */}
            {evalSummary && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{evalSummary.finalizedEvaluations}/{evalSummary.totalRequiredEvaluators} evaluators</span>
                  <span>{Math.round((evalSummary.finalizedEvaluations / evalSummary.totalRequiredEvaluators) * 100)}%</span>
                </div>
                <Progress 
                  value={(evalSummary.finalizedEvaluations / evalSummary.totalRequiredEvaluators) * 100} 
                  className="h-1.5"
                />
              </div>
            )}

            {/* Individual Evaluations */}
            {evalSummary && evalSummary.evaluations && evalSummary.evaluations.length > 0 && (
              <div className="mt-2 space-y-1">
                {evalSummary.evaluations.map((evaluation) => (
                  <div key={evaluation.id} className="flex items-center justify-between text-xs p-1.5 bg-background/50 rounded">
                    <span className="text-muted-foreground">{evaluation.evaluatorName}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{evaluation.score.toFixed(1)}</span>
                      {evaluation.isFinal ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Clock className="h-3 w-3 text-yellow-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Late Submission Warning */}
        {submission.isLateSubmission && (
          <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded-md text-red-600 text-xs">
            <AlertCircle className="h-4 w-4" />
            Late Submission
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============ Project Submissions Sheet ============

interface ProjectSubmissionsSheetProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ProjectSubmissionsSheet({ project, open, onOpenChange }: ProjectSubmissionsSheetProps) {
  const { data: submissions, isLoading } = useProjectSubmissions(project?.id || '');
  const { data: documentTypes } = useActiveDocumentTypes();
  const { data: deadlines } = useProjectDeadlines(project?.id || '');

  // Group submissions by document type
  const submissionsByType = React.useMemo(() => {
    if (!submissions || !documentTypes) return new Map<string, DocumentSubmission[]>();
    
    const map = new Map<string, DocumentSubmission[]>();
    for (const docType of documentTypes) {
      const typeSubmissions = submissions.filter(s => s.documentTypeId === docType.id);
      if (typeSubmissions.length > 0) {
        map.set(docType.id, typeSubmissions);
      }
    }
    return map;
  }, [submissions, documentTypes]);

  // Calculate completion percentage
  const completionStats = React.useMemo(() => {
    if (!documentTypes || !submissions) {
      return { total: 0, submitted: 0, evaluated: 0, percentage: 0 };
    }

    const total = documentTypes.length;
    const submitted = new Set(submissions.map(s => s.documentTypeId)).size;
    const uniqueEvaluated = new Set(
      submissions.filter(s => s.status === 'EVAL_FINALIZED').map(s => s.documentTypeId)
    ).size;

    return {
      total,
      submitted,
      evaluated: uniqueEvaluated,
      percentage: total > 0 ? Math.round((uniqueEvaluated / total) * 100) : 0,
    };
  }, [documentTypes, submissions]);

  // Get deadline info for a document type
  const getDeadlineForType = (docTypeId: string): ProjectDeadline | undefined => {
    return deadlines?.find(d => d.documentTypeId === docTypeId);
  };

  // Early return AFTER all hooks
  if (!project) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-2">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Project Submissions
          </SheetTitle>
          <SheetDescription>
            {project.title}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-140px)] pr-4 mt-4">
          {/* Completion Overview */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Completion Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{completionStats.percentage}%</span>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{completionStats.submitted}/{completionStats.total} documents submitted</p>
                  <p>{completionStats.evaluated}/{completionStats.total} fully evaluated</p>
                </div>
              </div>
              <Progress value={completionStats.percentage} className="h-2" />
            </CardContent>
          </Card>

          <Separator className="my-4" />

          {/* Submissions List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : submissions && submissions.length > 0 ? (
            <div className="space-y-4">
              {/* Document Types with Submissions */}
              {documentTypes?.map(docType => {
                const typeSubmissions = submissionsByType.get(docType.id);
                const deadline = getDeadlineForType(docType.id);
                
                if (!typeSubmissions || typeSubmissions.length === 0) {
                  // Show missing document types
                  return (
                    <Card key={docType.id} className="border-dashed opacity-60">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-base text-muted-foreground">
                              {docType.title}
                            </CardTitle>
                          </div>
                          <Badge variant="outline">Not Submitted</Badge>
                        </div>
                        {deadline && (
                          <CardDescription className="text-xs">
                            Deadline: {format(new Date(deadline.deadlineDate), 'MMM d, yyyy')}
                            {deadline.isPast && (
                              <span className="text-red-500 ml-2">• Overdue</span>
                            )}
                          </CardDescription>
                        )}
                      </CardHeader>
                    </Card>
                  );
                }

                // Show the latest submission for each type
                const latestSubmission = typeSubmissions.reduce((latest, current) => 
                  current.version > latest.version ? current : latest
                );

                return (
                  <SubmissionDetailsCard 
                    key={docType.id} 
                    submission={latestSubmission} 
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No submissions found</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// ============ Project Result Card ============

function ProjectResultCard({ 
  project, 
  onViewSubmissions 
}: { 
  project: Project; 
  onViewSubmissions: (project: Project) => void;
}) {
  const { data: result, isLoading } = useFinalResult(project.id);
  const { data: submissions } = useProjectSubmissions(project.id);
  const { data: documentTypes } = useActiveDocumentTypes();
  const computeMutation = useComputeFinalResult();
  const releaseMutation = useReleaseFinalResult();

  const handleCompute = () => {
    computeMutation.mutate(project.id);
  };

  const handleRelease = () => {
    releaseMutation.mutate(project.id);
  };

  // Calculate completion stats
  const completionStats = React.useMemo(() => {
    if (!documentTypes || !submissions) {
      return { percentage: 0, submitted: 0, total: 0, evaluated: 0 };
    }

    const total = documentTypes.length;
    const submitted = new Set(submissions.map(s => s.documentTypeId)).size;
    const evaluated = new Set(
      submissions.filter(s => s.status === 'EVAL_FINALIZED').map(s => s.documentTypeId)
    ).size;

    return {
      percentage: total > 0 ? Math.round((evaluated / total) * 100) : 0,
      submitted,
      total,
      evaluated,
    };
  }, [documentTypes, submissions]);

  // Get completion color
  const getCompletionColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0 flex-1">
            <CardTitle className="flex items-center gap-2 flex-wrap">
              <span className="truncate">{project.title}</span>
              {result?.released && (
                <Badge variant="default" className="bg-green-600 shrink-0">
                  <CheckCircle className="h-3 w-3 mr-1" /> Released
                </Badge>
              )}
              {result && !result.released && (
                <Badge variant="secondary" className="shrink-0">
                  <Clock className="h-3 w-3 mr-1" /> Computed
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 flex-wrap">
              {project.supervisor?.fullName && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {project.supervisor.fullName}
                </span>
              )}
              {project.groupName && (
                <span className="text-xs text-muted-foreground">
                  Group: {project.groupName}
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewSubmissions(project)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            {!result && (
              <Button 
                size="sm" 
                onClick={handleCompute}
                disabled={computeMutation.isPending || completionStats.percentage < 100}
                title={completionStats.percentage < 100 ? 'All documents must be evaluated' : 'Compute final result'}
              >
                {computeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Calculator className="h-4 w-4 mr-1" />
                )}
                Compute
              </Button>
            )}
            {result && !result.released && (
              <Button 
                size="sm" 
                variant="default"
                onClick={handleRelease}
                disabled={releaseMutation.isPending}
              >
                {releaseMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Send className="h-4 w-4 mr-1" />
                )}
                Release
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Completion Progress Bar */}
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Completion Progress</span>
            </div>
            <span className={`text-sm font-bold ${getCompletionColor(completionStats.percentage)}`}>
              {completionStats.percentage}%
            </span>
          </div>
          <Progress value={completionStats.percentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{completionStats.submitted}/{completionStats.total} submitted</span>
            <span>{completionStats.evaluated}/{completionStats.total} evaluated</span>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : result ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">{result.totalScore.toFixed(2)}</span>
                <span className="text-muted-foreground">/100</span>
              </div>
              {result.releasedAt && (
                <div className="text-sm text-muted-foreground">
                  Released on {format(new Date(result.releasedAt), 'MMM d, yyyy')}
                  {result.releasedByName && ` by ${result.releasedByName}`}
                </div>
              )}
            </div>
            <ScoreBreakdownTable details={result.details} />
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <AlertCircle className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No results computed yet</p>
            {completionStats.percentage < 100 ? (
              <p className="text-xs mt-1">
                Complete all evaluations ({completionStats.evaluated}/{completionStats.total}) before computing
              </p>
            ) : (
              <p className="text-xs mt-1">Click "Compute" to calculate final scores</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============ Main Page ============

export default function CommitteeResultsPage() {
  const [search, setSearch] = React.useState('');
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const { data: projectsData, isLoading } = useProjects({ size: 100 });

  // Filter approved projects only
  const approvedProjects = React.useMemo(() => {
    if (!projectsData?.content) return [];
    return projectsData.content.filter(
      (p: Project) => p.status === 'APPROVED' || p.status === 'IN_PROGRESS' || p.status === 'COMPLETED'
    );
  }, [projectsData]);

  // Apply search filter
  const filteredProjects = React.useMemo(() => {
    if (!search.trim()) return approvedProjects;
    const searchLower = search.toLowerCase();
    return approvedProjects.filter(
      (p: Project) =>
        p.title.toLowerCase().includes(searchLower) ||
        p.supervisor?.fullName?.toLowerCase().includes(searchLower) ||
        p.groupName?.toLowerCase().includes(searchLower)
    );
  }, [approvedProjects, search]);

  const handleViewSubmissions = (project: Project) => {
    setSelectedProject(project);
    setSheetOpen(true);
  };

  return (
    <RoleGuard allowedRoles={['FYP_COMMITTEE', 'ADMIN']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <TrendingUp className="h-8 w-8" />
                Final Results
              </h1>
              <p className="text-muted-foreground">
                View project progress, submissions, marks, and release final results
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by project, supervisor, or group..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Projects List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No approved projects found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project: Project) => (
                <ProjectResultCard 
                  key={project.id} 
                  project={project} 
                  onViewSubmissions={handleViewSubmissions}
                />
              ))}
            </div>
          )}
        </div>

        {/* Submissions Sheet */}
        <ProjectSubmissionsSheet
          project={selectedProject}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      </MainLayout>
    </RoleGuard>
  );
}
