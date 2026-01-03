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
}

// ============ Evaluation Summary ============

export interface PendingEvaluator {
  id: string;
  fullName: string;
  email: string;
}

export interface SupervisorMarksInfo {
  id: string;
  submissionId: string;
  supervisorId: string;
  supervisorName: string;
  score: number;
  createdAt: string;
}

export interface EvaluationSummary {
  submissionId: string;
  submissionStatus: string;
  totalRequiredEvaluators: number;
  totalEvaluations: number;
  finalizedEvaluations: number;
  averageScore: number | null;
  evaluations: EvaluationMarks[];
  pendingEvaluators: PendingEvaluator[];
  allEvaluated: boolean;
  allFinalized: boolean;
  supervisorMarks: SupervisorMarksInfo | null;
  supervisorMarked: boolean;
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

// ============ My Evaluation (with submission details) ============

export interface MyEvaluation {
  id: string;
  submissionId: string;
  score: number;
  comments?: string;
  isFinal: boolean;
  createdAt: string;
  // Submission details
  projectId: string;
  projectTitle: string;
  documentTypeCode: string;
  documentTypeTitle: string;
  version: number;
  uploadedByName: string;
  uploadedAt: string;
  fileUrl: string | null;
}

