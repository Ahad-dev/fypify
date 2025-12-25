/**
 * Submission Types
 * Matching backend DTOs for file uploads and document submissions
 */

// ============ File Upload Types ============

export interface CloudinaryFile {
  id: string;
  publicId: string;
  secureUrl: string;
  fileName: string;
  resourceType: string;
  format: string;
  bytes: number;
  uploadedBy: string;
  createdAt: string;
}

// ============ Submission Status ============

export type SubmissionStatus =
  | 'PENDING_SUPERVISOR'
  | 'REVISION_REQUESTED'
  | 'APPROVED_BY_SUPERVISOR'
  | 'LOCKED_FOR_EVAL'
  | 'EVAL_IN_PROGRESS'
  | 'EVAL_FINALIZED';

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  PENDING_SUPERVISOR: 'Pending Review',
  REVISION_REQUESTED: 'Revision Requested',
  APPROVED_BY_SUPERVISOR: 'Approved',
  LOCKED_FOR_EVAL: 'Locked for Evaluation',
  EVAL_IN_PROGRESS: 'Evaluation In Progress',
  EVAL_FINALIZED: 'Evaluation Complete',
};

export const SUBMISSION_STATUS_COLORS: Record<SubmissionStatus, string> = {
  PENDING_SUPERVISOR: 'secondary',
  REVISION_REQUESTED: 'destructive',
  APPROVED_BY_SUPERVISOR: 'default',
  LOCKED_FOR_EVAL: 'outline',
  EVAL_IN_PROGRESS: 'secondary',
  EVAL_FINALIZED: 'default',
};

// ============ Document Submission ============

export interface DocumentSubmission {
  id: string;
  projectId: string;
  projectTitle: string;
  documentTypeId: string;
  documentTypeTitle: string;
  version: number;
  file: CloudinaryFile | null;
  uploadedBy: {
    id: string;
    fullName: string;
    email: string;
  };
  uploadedAt: string;
  status: SubmissionStatus;
  statusDisplay: string;
  isFinal: boolean;
  supervisorReviewedAt: string | null;
  supervisorComments: string | null;
  isLateSubmission: boolean;
  deadline: string | null;
}

// ============ Request DTOs ============

export interface CreateSubmissionRequest {
  documentTypeId: string;
  fileId: string;
}

export interface SupervisorReviewRequest {
  approve: boolean;
  feedback?: string;
  marks?: number; // 0-100, required when approving after deadline
}

// ============ Document Type (from Admin) ============

export interface DocumentType {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

// ============ Deadline Info ============

export interface ProjectDeadline {
  id: string;
  documentTypeId: string;
  documentTypeTitle: string;
  deadlineDate: string;
  batchName: string;
}

