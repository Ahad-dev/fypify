'use client';

import { useState } from 'react';
import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Search,
  Eye,
  CheckCircle,
  Clock,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { useLockedSubmissions } from '@/shared/hooks/useEvaluation';
import { formatDistanceToNow } from 'date-fns';
import { LockedSubmission } from '@/shared/types/evaluation.types';

export default function EvalSubmissionsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = useLockedSubmissions(page, 20);

  const submissions = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const filteredSubmissions = submissions.filter((s: LockedSubmission) =>
    s.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
    s.documentTypeTitle.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LOCKED_FOR_EVAL':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>;
      case 'EVAL_IN_PROGRESS':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">In Progress</Badge>;
      case 'EVAL_FINALIZED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Finalized</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <RoleGuard allowedRoles={['EVALUATION_COMMITTEE', 'ADMIN']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/committee/eval/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Submissions for Evaluation</h1>
                <p className="text-muted-foreground text-sm">
                  Review and evaluate locked submissions
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by project or document type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Error State */}
          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <p className="text-destructive">Failed to load submissions. Please try again.</p>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoading && (
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
          )}

          {/* Empty State */}
          {!isLoading && submissions.length === 0 && (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Submissions for Evaluation</h3>
                <p className="text-muted-foreground">
                  There are no locked submissions awaiting evaluation at this time.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Submissions List */}
          {!isLoading && filteredSubmissions.length > 0 && (
            <div className="space-y-4">
              {filteredSubmissions.map((submission: LockedSubmission) => (
                <Card key={submission.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          {submission.projectTitle}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {submission.documentTypeTitle} • Version {submission.version}
                        </CardDescription>
                      </div>
                      {getStatusBadge(submission.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDistanceToNow(new Date(submission.uploadedAt), { addSuffix: true })}
                        </span>
                        <span>by {submission.uploadedByName}</span>
                        {submission.isLate && (
                          <Badge variant="destructive" className="text-xs">Late</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {submission.file && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={submission.file.fileUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View File
                            </a>
                          </Button>
                        )}
                        <Button size="sm" asChild>
                          <Link href={`/committee/eval/submissions/${submission.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Evaluate
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
