/**
 * Evaluation Types
 * Types for evaluation committee operations
 */

// ============ Evaluation Request ============

export interface EvaluationRequest {
  score: number;
  comments?: string;
  isFinal?: boolean;
}

// ============ Evaluation Marks ============

export interface EvaluationMarks {
  id: string;
  submissionId: string;
  evaluatorId: string;
  evaluatorName: string;
  score: number;
  comments?: string;
  isFinal: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============ Evaluation Summary ============

export interface EvaluationSummary {
  submissionId: string;
  submissionStatus: string;
  totalEvaluations: number;
  finalizedEvaluations: number;
  averageScore: number | null;
  evaluations: EvaluationMarks[];
  allFinalized: boolean;
}

// ============ Locked Submission (for eval list) ============

export interface LockedSubmission {
  id: string;
  projectId: string;
  projectTitle: string;
  documentTypeId: string;
  documentTypeCode: string;
  documentTypeTitle: string;
  version: number;
  file: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
  } | null;
  uploadedById: string;
  uploadedByName: string;
  uploadedAt: string;
  status: string;
  statusDisplay: string;
  isFinal: boolean;
  deadlineDate: string | null;
  isLate: boolean;
}
