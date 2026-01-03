'use client';

import { useState } from 'react';
import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  FileText,
  CheckCircle,
  Clock,
  ExternalLink,
  ArrowLeft,
  Pencil,
  Loader2,
  ListChecks,
} from 'lucide-react';
import Link from 'next/link';
import { useMyEvaluations, useFinalizeEvaluation } from '@/shared/hooks/useEvaluation';
import { formatDistanceToNow } from 'date-fns';
import { MyEvaluation } from '@/shared/types/evaluation.types';

export default function MyEvaluationsPage() {
  const [activeTab, setActiveTab] = useState<'drafts' | 'finalized'>('drafts');
  
  const { data: drafts, isLoading: loadingDrafts } = useMyEvaluations(false);
  const { data: finalized, isLoading: loadingFinalized } = useMyEvaluations(true);
  const finalizeMutation = useFinalizeEvaluation();

  const handleFinalize = async (submissionId: string) => {
    await finalizeMutation.mutateAsync(submissionId);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const renderEvaluationCard = (evaluation: MyEvaluation, showActions: boolean) => (
    <Card key={evaluation.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {evaluation.projectTitle}
            </CardTitle>
            <CardDescription className="mt-1">
              {evaluation.documentTypeTitle} • Version {evaluation.version}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-bold text-xl ${getScoreColor(evaluation.score)}`}>
              {evaluation.score.toFixed(0)}/100
            </span>
            <Badge variant={evaluation.isFinal ? 'default' : 'secondary'}>
              {evaluation.isFinal ? 'Finalized' : 'Draft'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDistanceToNow(new Date(evaluation.createdAt), { addSuffix: true })}
            </span>
            <span>Uploaded by {evaluation.uploadedByName}</span>
          </div>
          <div className="flex items-center gap-2">
            {evaluation.fileUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={evaluation.fileUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View File
                </a>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/committee/eval/submissions/${evaluation.submissionId}`}>
                <Pencil className="h-4 w-4 mr-1" />
                {showActions ? 'Edit' : 'View'}
              </Link>
            </Button>
            {showActions && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" disabled={finalizeMutation.isPending}>
                    {finalizeMutation.isPending && (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    )}
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Finalize
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Finalize Evaluation?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Once finalized, you cannot modify your evaluation. The score of{' '}
                      {evaluation.score.toFixed(0)}/100 will be submitted as final.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleFinalize(evaluation.submissionId)}>
                      Finalize
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
        {evaluation.comments && (
          <p className="mt-3 text-sm text-muted-foreground border-t pt-3 line-clamp-2">
            {evaluation.comments}
          </p>
        )}
      </CardContent>
    </Card>
  );

  const renderEmptyState = (isDrafts: boolean) => (
    <Card>
      <CardContent className="pt-12 pb-12 text-center">
        <ListChecks className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {isDrafts ? 'No Draft Evaluations' : 'No Finalized Evaluations'}
        </h3>
        <p className="text-muted-foreground">
          {isDrafts 
            ? 'You don\'t have any draft evaluations. Start evaluating submissions to see drafts here.'
            : 'You haven\'t finalized any evaluations yet.'}
        </p>
        {isDrafts && (
          <Button asChild className="mt-4">
            <Link href="/committee/eval/submissions">
              <FileText className="h-4 w-4 mr-2" />
              Browse Submissions
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const renderLoadingState = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <RoleGuard allowedRoles={['EVALUATION_COMMITTEE', 'ADMIN']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/committee/eval/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Evaluations</h1>
              <p className="text-muted-foreground text-sm">
                View and manage your evaluation drafts and finalized submissions
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-950 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Drafts</p>
                    <div className="text-2xl font-bold">
                      {loadingDrafts ? <Skeleton className="h-8 w-12" /> : drafts?.length ?? 0}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-950 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Finalized</p>
                    <div className="text-2xl font-bold">
                      {loadingFinalized ? <Skeleton className="h-8 w-12" /> : finalized?.length ?? 0}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'drafts' | 'finalized')}>
            <TabsList>
              <TabsTrigger value="drafts" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Drafts
                {drafts && drafts.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {drafts.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="finalized" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Finalized
                {finalized && finalized.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {finalized.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="drafts" className="mt-4 space-y-4">
              {loadingDrafts ? (
                renderLoadingState()
              ) : drafts && drafts.length > 0 ? (
                drafts.map((evaluation) => renderEvaluationCard(evaluation, true))
              ) : (
                renderEmptyState(true)
              )}
            </TabsContent>

            <TabsContent value="finalized" className="mt-4 space-y-4">
              {loadingFinalized ? (
                renderLoadingState()
              ) : finalized && finalized.length > 0 ? (
                finalized.map((evaluation) => renderEvaluationCard(evaluation, false))
              ) : (
                renderEmptyState(false)
              )}
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
