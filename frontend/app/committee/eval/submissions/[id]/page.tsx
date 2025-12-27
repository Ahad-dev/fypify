'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
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
  ArrowLeft,
  Save,
  CheckCircle,
  User,
  Clock,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useSubmission } from '@/shared/hooks/useSubmission';
import { 
  useMyEvaluation, 
  useEvaluationMarks, 
  useEvaluateSubmission, 
  useFinalizeEvaluation,
  useEvaluationSummary 
} from '@/shared/hooks/useEvaluation';
import { formatDistanceToNow } from 'date-fns';

export default function EvaluateSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as string;

  const { data: submission, isLoading: loadingSubmission } = useSubmission(submissionId);
  const { data: myEvaluation, isLoading: loadingMyEval } = useMyEvaluation(submissionId);
  const { data: allMarks, isLoading: loadingMarks } = useEvaluationMarks(submissionId);
  const { data: summary } = useEvaluationSummary(submissionId);

  const evaluateMutation = useEvaluateSubmission();
  const finalizeMutation = useFinalizeEvaluation();

  const [score, setScore] = useState<number>(0);
  const [comments, setComments] = useState<string>('');

  // Load existing evaluation data
  useEffect(() => {
    if (myEvaluation) {
      setScore(myEvaluation.score);
      setComments(myEvaluation.comments || '');
    }
  }, [myEvaluation]);

  const handleSaveDraft = async () => {
    await evaluateMutation.mutateAsync({
      submissionId,
      data: { score, comments, isFinal: false },
    });
  };

  const handleFinalize = async () => {
    await evaluateMutation.mutateAsync({
      submissionId,
      data: { score, comments, isFinal: true },
    });
  };

  const handleFinalizeOnly = async () => {
    await finalizeMutation.mutateAsync(submissionId);
  };

  const isLoading = loadingSubmission || loadingMyEval;
  const isAlreadyFinalized = myEvaluation?.isFinal === true;
  const isSaving = evaluateMutation.isPending || finalizeMutation.isPending;

  return (
    <RoleGuard allowedRoles={['EVALUATION_COMMITTEE', 'ADMIN']}>
      <MainLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/committee/eval/submissions">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Evaluate Submission</h1>
              <p className="text-muted-foreground text-sm">
                Provide marks and comments for this submission
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          )}

          {/* Submission Details */}
          {!isLoading && submission && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        {submission.projectTitle}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {submission.documentTypeTitle} • Version {submission.version}
                      </CardDescription>
                    </div>
                    <Badge variant={isAlreadyFinalized ? 'default' : 'outline'}>
                      {isAlreadyFinalized ? 'Finalized' : submission.statusDisplay}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {submission.uploadedByName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(new Date(submission.uploadedAt), { addSuffix: true })}
                    </span>
                    {submission.file && (
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <a href={submission.file.secureUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Document
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Evaluation Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Evaluation</CardTitle>
                  <CardDescription>
                    {isAlreadyFinalized 
                      ? 'Your evaluation has been finalized and cannot be modified.'
                      : 'Enter your score and comments. You can save as draft and finalize later.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Score Input */}
                  <div className="space-y-4">
                    <Label htmlFor="score" className="text-base font-medium">
                      Score (0-100)
                    </Label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Slider
                          value={[score]}
                          onValueChange={(values) => setScore(values[0])}
                          max={100}
                          step={1}
                          disabled={isAlreadyFinalized}
                          className="w-full"
                        />
                      </div>
                      <Input
                        id="score"
                        type="number"
                        min={0}
                        max={100}
                        value={score}
                        onChange={(e) => setScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                        disabled={isAlreadyFinalized}
                        className="w-24"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Poor (0-40)</span>
                      <span>Average (41-60)</span>
                      <span>Good (61-80)</span>
                      <span>Excellent (81-100)</span>
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="space-y-2">
                    <Label htmlFor="comments" className="text-base font-medium">
                      Comments (Optional)
                    </Label>
                    <Textarea
                      id="comments"
                      placeholder="Enter your feedback and comments..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      disabled={isAlreadyFinalized}
                      rows={4}
                    />
                  </div>

                  {/* Action Buttons */}
                  {!isAlreadyFinalized && (
                    <div className="flex items-center gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={handleSaveDraft}
                        disabled={isSaving}
                      >
                        {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button disabled={isSaving}>
                            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Finalize Evaluation
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Finalize Evaluation?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Once finalized, you cannot modify your evaluation. The score of {score}/100 
                              will be submitted as final.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleFinalize}>
                              Finalize
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}

                  {isAlreadyFinalized && (
                    <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Your evaluation has been finalized</span>
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                        Final score: {score}/100
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Other Evaluators' Marks */}
              {allMarks && allMarks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">All Evaluations</CardTitle>
                    <CardDescription>
                      {summary?.finalizedEvaluations ?? 0} of {summary?.totalEvaluations ?? 0} evaluations finalized
                      {summary?.averageScore && ` • Average: ${summary.averageScore.toFixed(1)}/100`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {allMarks.map((mark) => (
                        <div 
                          key={mark.id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{mark.evaluatorName}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(mark.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={mark.isFinal ? 'default' : 'secondary'}>
                              {mark.isFinal ? 'Finalized' : 'Draft'}
                            </Badge>
                            <span className="font-bold text-lg">
                              {mark.score.toFixed(0)}/100
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
