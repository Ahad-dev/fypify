'use client';

import { DocumentSubmission, SUBMISSION_STATUS_LABELS } from '@/shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { 
  FileText, 
  Clock, 
  Eye, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  User,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubmissionReviewCardProps {
  submission: DocumentSubmission;
  onReview: (submission: DocumentSubmission) => void;
  onViewDetails?: (projectId: string) => void;
}

/**
 * Card component showing submission summary with review action
 */
export function SubmissionReviewCard({ submission, onReview, onViewDetails }: SubmissionReviewCardProps) {
  const isLate = submission.isLateSubmission;
  const deadlinePassed = submission.deadline 
    ? new Date(submission.deadline) < new Date() 
    : false;

  const getStatusColor = () => {
    switch (submission.status) {
      case 'PENDING_SUPERVISOR':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'REVISION_REQUESTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'APPROVED_BY_SUPERVISOR':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'LOCKED_FOR_EVAL':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (submission.status) {
      case 'PENDING_SUPERVISOR':
        return <Clock className="h-3.5 w-3.5" />;
      case 'REVISION_REQUESTED':
        return <XCircle className="h-3.5 w-3.5" />;
      case 'APPROVED_BY_SUPERVISOR':
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  return (
    <Card className="transition-all hover:shadow-md border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-lg truncate">
              {submission.projectTitle}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>{submission.documentTypeTitle}</span>
              <span className="text-muted-foreground">•</span>
              <span>Version {submission.version}</span>
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={cn("gap-1", getStatusColor())}>
              {getStatusIcon()}
              {SUBMISSION_STATUS_LABELS[submission.status]}
            </Badge>
            {isLate && (
              <Badge variant="destructive" className="gap-1 text-xs">
                <AlertTriangle className="h-3 w-3" />
                Late
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">Submitted By</p>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="font-medium">{submission.uploadedBy?.fullName || 'Unknown'}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Submitted At</p>
            <p className="font-medium">
              {format(new Date(submission.uploadedAt), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
          {submission.deadline && (
            <div className="space-y-1">
              <p className="text-muted-foreground">Deadline</p>
              <p className={cn(
                "font-medium",
                deadlinePassed ? "text-red-600" : "text-green-600"
              )}>
                {format(new Date(submission.deadline), 'MMM d, yyyy')}
                {deadlinePassed && <span className="ml-1">(Passed)</span>}
              </p>
            </div>
          )}
          {submission.supervisorReviewedAt && (
            <div className="space-y-1">
              <p className="text-muted-foreground">Last Reviewed</p>
              <p className="font-medium">
                {format(new Date(submission.supervisorReviewedAt), 'MMM d, yyyy')}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          {onViewDetails && (
            <Button 
              variant="outline" 
              onClick={() => onViewDetails(submission.projectId)} 
              className="gap-2"
            >
              <Info className="h-4 w-4" />
              View Project Details
            </Button>
          )}
          <Button onClick={() => onReview(submission)} className="gap-2">
            <Eye className="h-4 w-4" />
            Review Submission
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default SubmissionReviewCard;

