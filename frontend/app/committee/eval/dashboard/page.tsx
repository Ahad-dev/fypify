'use client';

import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  CheckCircle,
  Clock,
  ClipboardCheck,
  ArrowRight,
  ListChecks,
} from 'lucide-react';
import Link from 'next/link';
import { useLockedSubmissions, useMyEvaluations } from '@/shared/hooks/useEvaluation';

const evalModules = [
  {
    title: 'Pending Evaluations',
    description: 'View and evaluate locked submissions',
    icon: FileText,
    href: '/committee/eval/submissions',
    color: 'from-purple-500 to-purple-600',
    stats: 'Evaluate submissions',
  },
  {
    title: 'My Evaluations',
    description: 'View your submitted evaluations',
    icon: ListChecks,
    href: '/committee/eval/my-evaluations',
    color: 'from-blue-500 to-blue-600',
    stats: 'View drafts & finalized',
  },
];

export default function EvalDashboardPage() {
  const { data: lockedData, isLoading } = useLockedSubmissions(0, 100);
  const { data: drafts, isLoading: draftsLoading } = useMyEvaluations(false);
  const { data: finalized, isLoading: finalizedLoading } = useMyEvaluations(true);

  const pendingCount = lockedData?.totalElements ?? 0;
  const draftsCount = drafts?.length ?? 0;
  const finalizedCount = finalized?.length ?? 0;

  return (
    <RoleGuard allowedRoles={['EVALUATION_COMMITTEE', 'ADMIN']}>
      <MainLayout>
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <ClipboardCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Evaluation Committee Dashboard</h1>
                <p className="text-muted-foreground text-sm">
                  Evaluate submissions and manage marks
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/committee/eval/submissions">
                <FileText className="mr-2 h-4 w-4" />
                Evaluate Submissions
              </Link>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-950 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Evaluation</p>
                    <div className="text-2xl font-bold">
                      {isLoading ? <Skeleton className="h-8 w-12" /> : pendingCount}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-950 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">My Finalized</p>
                    <div className="text-2xl font-bold">
                      {finalizedLoading ? <Skeleton className="h-8 w-12" /> : finalizedCount}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-lg">
                    <ListChecks className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">My Drafts</p>
                    <div className="text-2xl font-bold">
                      {draftsLoading ? <Skeleton className="h-8 w-12" /> : draftsCount}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Evaluation Alert */}
          {pendingCount > 0 && (
            <Card className="border-purple-500/50 bg-purple-50/50 dark:bg-purple-950/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-800 dark:text-purple-200">
                        {pendingCount} Submission{pendingCount !== 1 ? 's' : ''} Ready for Evaluation
                      </h3>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        These submissions are locked and awaiting evaluation marks.
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="border-purple-500 text-purple-700 hover:bg-purple-100">
                    <Link href="/committee/eval/submissions">
                      Evaluate Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Evaluation Modules */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Evaluation Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evalModules.map((module) => (
                <Card
                  key={module.title}
                  className="group relative overflow-hidden transition-all hover:shadow-lg cursor-pointer"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${module.color} opacity-0 group-hover:opacity-5 transition-opacity`}
                  />
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-br ${module.color} text-white`}
                      >
                        <module.icon className="h-5 w-5" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{module.stats}</span>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={module.href}>
                          Open
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
