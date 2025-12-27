/**
 * Final Result Types
 * Matching backend DTOs for final results computation and release
 */

// ============ Document Score Breakdown ============

export interface DocumentScoreBreakdown {
  submissionId: string;
  docTypeCode: string;
  docTypeTitle: string;
  supervisorScore: number;
  supervisorWeight: number;
  committeeAvgScore: number;
  committeeWeight: number;
  committeeEvaluatorCount: number;
  weightedScore: number;
}

// ============ Final Result Details (JSONB) ============

export interface FinalResultDetails {
  documents: DocumentScoreBreakdown[];
  totalScore: number;
  computedAt: string;
  computedById: string;
  computedByName: string;
}

// ============ Final Result ============

export interface FinalResult {
  id: number;
  projectId: string;
  projectTitle: string;
  totalScore: number;
  details: FinalResultDetails | null;
  released: boolean;
  releasedById?: string;
  releasedByName?: string;
  releasedAt?: string;
  createdAt: string;
  updatedAt: string;
}
