'use client';

import { useState, useEffect } from 'react';
import { DocumentSubmission, SupervisorReviewRequest, SUBMISSION_STATUS_LABELS } from '@/shared/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Download,
  ExternalLink,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubmissionReviewModalProps {
  submission: DocumentSubmission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReview: (id: string, data: SupervisorReviewRequest) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Modal for reviewing a submission with PDF viewer and review form
 */
export function SubmissionReviewModal({
  submission,
  open,
  onOpenChange,
  onReview,
  isLoading = false,
}: SubmissionReviewModalProps) {
  const [feedback, setFeedback] = useState('');
  const [marks, setMarks] = useState<number | ''>('');
  const [reviewType, setReviewType] = useState<'approve' | 'revision' | null>(null);

  // Check if deadline has passed
  const deadlinePassed = submission?.deadline 
    ? new Date(submission.deadline) < new Date() 
    : false;

  // Reset form when submission changes
  useEffect(() => {
    if (submission) {
      setFeedback(submission.supervisorComments || '');
      setMarks('');
      setReviewType(null);
    }
  }, [submission?.id]);

  const handleSubmit = async () => {
    if (!submission || !reviewType) return;

    const isApprove = reviewType === 'approve';
    
    // Validate marks required after deadline
    if (isApprove && deadlinePassed && (marks === '' || marks === undefined)) {
      return; // Form validation will show error
    }

    const data: SupervisorReviewRequest = {
      approve: isApprove,
      feedback: feedback.trim() || undefined,
      marks: isApprove && marks !== '' ? Number(marks) : undefined,
    };

    await onReview(submission.id, data);
    onOpenChange(false);
  };

  const canSubmit = () => {
    if (!reviewType) return false;
    if (reviewType === 'revision' && !feedback.trim()) return false;
    if (reviewType === 'approve' && deadlinePassed && (marks === '' || marks === undefined)) return false;
    if (marks !== '' && (Number(marks) < 0 || Number(marks) > 100)) return false;
    return true;
  };

  if (!submission) return null;

  const pdfUrl = submission.file?.secureUrl;
  const isLate = submission.isLateSubmission;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl">{submission.projectTitle}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <FileText className="h-4 w-4" />
                {submission.documentTypeTitle} - Version {submission.version}
              </DialogDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={submission.status === 'PENDING_SUPERVISOR' ? 'secondary' : 'outline'}>
                {SUBMISSION_STATUS_LABELS[submission.status]}
              </Badge>
              {isLate && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Late Submission
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left: PDF Viewer */}
          <Card className="overflow-hidden col-span-3">
            <CardHeader className="py-3 px-4 border-b flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Document Preview
              </CardTitle>
              {pdfUrl && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={pdfUrl} download>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </a>
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0 h-[400px] lg:h-[500px]">
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-0"
                  title="Document Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-muted">
                  <p className="text-muted-foreground">No document available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: Details and Review Form */}
          <div className="flex flex-col gap-4 overflow-y-auto">
            {/* Submission Details */}
            <Card>
              <CardHeader className="py-3 px-4 border-b">
                <CardTitle className="text-sm font-medium">Submission Details</CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Submitted By
                  </p>
                  <p className="font-medium">{submission.uploadedBy?.fullName || 'Unknown'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Submitted At
                  </p>
                  <p className="font-medium">
                    {format(new Date(submission.uploadedAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                {submission.deadline && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Deadline
                    </p>
                    <p className={cn(
                      "font-medium",
                      deadlinePassed ? "text-red-600" : "text-green-600"
                    )}>
                      {format(new Date(submission.deadline), 'MMM d, yyyy')}
                      {deadlinePassed && <span className="ml-1 text-xs">(Passed)</span>}
                    </p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-muted-foreground">Final Submission</p>
                  <p className="font-medium">{submission.isFinal ? 'Yes' : 'No'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Deadline Alert */}
            {deadlinePassed && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      Deadline Has Passed
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      You must provide marks when approving this submission. 
                      Revision requests are no longer allowed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Review Form */}
            <Card>
              <CardHeader className="py-3 px-4 border-b">
                <CardTitle className="text-sm font-medium">Review Submission</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Feedback/Comments */}
                <div className="space-y-2">
                  <Label htmlFor="feedback">
                    {reviewType === 'revision' ? 'Feedback (Required)' : 'Comments (Optional)'}
                  </Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={
                      reviewType === 'revision' 
                        ? "Please explain what needs to be revised..."
                        : "Add any comments for the student..."
                    }
                    className="min-h-[100px]"
                  />
                </div>

                {/* Marks Input - visible when deadline passed or reviewing approval */}
                {(deadlinePassed || reviewType === 'approve') && (
                  <div className="space-y-2">
                    <Label htmlFor="marks" className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      Marks (0-100)
                      {deadlinePassed && reviewType === 'approve' && (
                        <span className="text-red-500">*</span>
                      )}
                    </Label>
                    <Input
                      id="marks"
                      type="number"
                      min={0}
                      max={100}
                      value={marks}
                      onChange={(e) => setMarks(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Enter marks (0-100)"
                      className="max-w-[200px]"
                    />
                    {marks !== '' && (Number(marks) < 0 || Number(marks) > 100) && (
                      <p className="text-sm text-red-500">Marks must be between 0 and 100</p>
                    )}
                    {deadlinePassed && reviewType === 'approve' && marks === '' && (
                      <p className="text-sm text-red-500">Marks are required after deadline</p>
                    )}
                  </div>
                )}

                <Separator />

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                  {!deadlinePassed && (
                    <Button
                      variant="destructive"
                      onClick={() => setReviewType('revision')}
                      className={cn(
                        "gap-2",
                        reviewType === 'revision' && "ring-2 ring-offset-2 ring-red-500"
                      )}
                    >
                      <XCircle className="h-4 w-4" />
                      Request Revision
                    </Button>
                  )}
                  <Button
                    variant="default"
                    onClick={() => setReviewType('approve')}
                    className={cn(
                      "gap-2 bg-green-600 hover:bg-green-700",
                      reviewType === 'approve' && "ring-2 ring-offset-2 ring-green-500"
                    )}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!canSubmit() || isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SubmissionReviewModal;
