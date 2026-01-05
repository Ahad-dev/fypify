'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Award,
  Clock,
  FileText,
  AlertCircle,
  Trophy,
  CheckCircle,
} from 'lucide-react';
import { useReleasedResult, useMyGroup, useProject } from '@/shared/hooks';
import { FinalResult, DocumentScoreBreakdown } from '@/shared/types';

// ============ Score Breakdown Table (Student View) ============

function StudentScoreBreakdown({ details }: { details: FinalResult['details'] }) {
  if (!details || !details.documents || details.documents.length === 0) {
    return null;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Document</TableHead>
          <TableHead className="text-center">Supervisor Score</TableHead>
          <TableHead className="text-center">Committee Average</TableHead>
          <TableHead className="text-center">Weighted Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {details.documents.map((doc: DocumentScoreBreakdown) => (
          <TableRow key={doc.submissionId}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                {doc.docTypeTitle}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <span className="font-mono text-lg">{doc.supervisorScore.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground ml-1">({doc.supervisorWeight}%)</span>
            </TableCell>
            <TableCell className="text-center">
              <span className="font-mono text-lg">{doc.committeeAvgScore.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground ml-1">({doc.committeeWeight}%)</span>
            </TableCell>
            <TableCell className="text-center">
              <Badge variant="secondary" className="font-mono text-sm">
                {doc.weightedScore.toFixed(2)}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ============ Main Student Results Page ============

export default function StudentResultsPage() {
  const { data: group, isLoading: isLoadingGroup } = useMyGroup();
  const { data: project, isLoading: isLoadingProject } = useProject(group?.projectId || '');
  const { data: result, isLoading: resultLoading } = useReleasedResult(project?.id || '');

  const isLoading = isLoadingGroup || isLoadingProject || resultLoading;

  // Get grade based on score
  const getGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'bg-green-600' };
    if (score >= 85) return { grade: 'A', color: 'bg-green-500' };
    if (score >= 80) return { grade: 'A-', color: 'bg-green-400' };
    if (score >= 75) return { grade: 'B+', color: 'bg-blue-500' };
    if (score >= 70) return { grade: 'B', color: 'bg-blue-400' };
    if (score >= 65) return { grade: 'B-', color: 'bg-blue-300' };
    if (score >= 60) return { grade: 'C+', color: 'bg-yellow-500' };
    if (score >= 55) return { grade: 'C', color: 'bg-yellow-400' };
    if (score >= 50) return { grade: 'D', color: 'bg-orange-500' };
    return { grade: 'F', color: 'bg-red-500' };
  };

  return (
    <RoleGuard allowedRoles={['STUDENT']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              My Results
            </h1>
            <p className="text-muted-foreground">
              View your final project evaluation results
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          )}

          {/* No Project */}
          {!isLoading && !project && (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No Project Found</p>
                <p className="text-muted-foreground">
                  You need to be part of a project to view results.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Results Not Released */}
          {!isLoading && project && (!result || !result.released) && (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                <p className="text-lg font-medium">Results Not Yet Released</p>
                <p className="text-muted-foreground">
                  Your final results will appear here once they are released by the FYP Committee.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Results Released */}
          {!isLoading && project && result && result.released && (
            <div className="space-y-6">
              {/* Score Card */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    {result.projectTitle}
                  </CardTitle>
                  <CardDescription>
                    Results released on{' '}
                    {result.releasedAt && format(new Date(result.releasedAt), 'MMMM d, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-8 py-6">
                    {/* Score */}
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary">
                        {result.totalScore.toFixed(1)}
                      </div>
                      <div className="text-muted-foreground mt-1">out of 100</div>
                    </div>
                    {/* Grade */}
                    <div className="text-center">
                      <Badge 
                        className={`text-3xl px-6 py-2 ${getGrade(result.totalScore).color} text-white`}
                      >
                        {getGrade(result.totalScore).grade}
                      </Badge>
                      <div className="text-muted-foreground mt-2">Grade</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Breakdown Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Score Breakdown
                  </CardTitle>
                  <CardDescription>
                    Detailed evaluation scores for each document
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StudentScoreBreakdown details={result.details} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
