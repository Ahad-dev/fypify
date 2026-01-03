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
} from 'lucide-react';
import {
  useFinalResult,
  useComputeFinalResult,
  useReleaseFinalResult,
} from '@/shared/hooks';
import { useProjects } from '@/shared/hooks/useProject';
import { FinalResult, DocumentScoreBreakdown } from '@/shared/types';
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

// ============ Project Result Card ============

function ProjectResultCard({ project }: { project: Project }) {
  const { data: result, isLoading } = useFinalResult(project.id);
  const computeMutation = useComputeFinalResult();
  const releaseMutation = useReleaseFinalResult();

  const handleCompute = () => {
    computeMutation.mutate(project.id);
  };

  const handleRelease = () => {
    releaseMutation.mutate(project.id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              {project.title}
              {result?.released && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" /> Released
                </Badge>
              )}
              {result && !result.released && (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" /> Computed
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {project.supervisor?.fullName && `Supervisor: ${project.supervisor.fullName}`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {!result && (
              <Button 
                size="sm" 
                onClick={handleCompute}
                disabled={computeMutation.isPending}
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
          <div className="text-center py-6 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No results computed yet</p>
            <p className="text-sm">Click "Compute" to calculate final scores</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============ Main Page ============

export default function CommitteeResultsPage() {
  const [search, setSearch] = React.useState('');
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
        p.supervisor?.fullName?.toLowerCase().includes(searchLower)
    );
  }, [approvedProjects, search]);

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
                Compute and release final project results
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
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
                <ProjectResultCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
