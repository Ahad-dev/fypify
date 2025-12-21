'use client';

import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Calendar,
  Users,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';
import { useCommitteePendingProjects, useDeadlineBatches } from '@/shared/hooks';

const committeeModules = [
  {
    title: 'Project Approvals',
    description: 'Review and approve pending FYP project registrations',
    icon: FileText,
    href: '/committee/fyp/projects',
    color: 'from-indigo-500 to-indigo-600',
    stats: 'Review projects',
  },
  {
    title: 'Deadline Management',
    description: 'Manage deadline batches for project submissions',
    icon: Calendar,
    href: '/committee/fyp/deadlines',
    color: 'from-orange-500 to-amber-600',
    stats: 'Manage deadlines',
  },
  {
    title: 'Evaluation Panel',
    description: 'Assign evaluation committees to projects',
    icon: Users,
    href: '/committee/evaluations',
    color: 'from-purple-500 to-purple-600',
    stats: 'Coming soon',
    disabled: true,
  },
  {
    title: 'Reports',
    description: 'View committee activity and approval reports',
    icon: ClipboardList,
    href: '/committee/reports',
    color: 'from-green-500 to-green-600',
    stats: 'Coming soon',
    disabled: true,
  },
];

export default function CommitteeDashboardPage() {
  const { data: pendingData, isLoading: pendingLoading } = useCommitteePendingProjects();
  const { data: batchesData, isLoading: batchesLoading } = useDeadlineBatches();

  const pendingCount = pendingData?.content?.length ?? 0;
  const activeBatchesCount = batchesData?.content?.filter((b) => b.isActive).length ?? 0;

  return (
    <RoleGuard allowedRoles={['FYP_COMMITTEE', 'ADMIN']}>
      <MainLayout>
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">FYP Committee Dashboard</h1>
                <p className="text-muted-foreground text-sm">
                  Project approvals & committee management
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/committee/fyp/projects">
                <FileText className="mr-2 h-4 w-4" />
                Review Projects
              </Link>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-950 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Approval</p>
                    <div className="text-2xl font-bold">
                      {pendingLoading ? <Skeleton className="h-8 w-12" /> : pendingCount}
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
                    <p className="text-sm text-muted-foreground">Approved This Month</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 dark:bg-red-950 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rejected This Month</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Deadline Batches</p>
                    <div className="text-2xl font-bold">
                      {batchesLoading ? <Skeleton className="h-8 w-12" /> : activeBatchesCount}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Projects Alert */}
          {pendingCount > 0 && (
            <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                        {pendingCount} Project{pendingCount !== 1 ? 's' : ''} Awaiting Review
                      </h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        These projects require your attention for approval or rejection.
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="border-yellow-500 text-yellow-700 hover:bg-yellow-100">
                    <Link href="/committee/fyp/projects">
                      Review Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Committee Modules */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Committee Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {committeeModules.map((module) => (
                <Card
                  key={module.title}
                  className={`group relative overflow-hidden transition-all hover:shadow-lg ${
                    module.disabled ? 'opacity-60' : 'cursor-pointer'
                  }`}
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
                      {module.disabled && (
                        <span className="text-xs bg-muted px-2 py-1 rounded">Coming Soon</span>
                      )}
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{module.stats}</span>
                      {!module.disabled && (
                        <Button asChild variant="ghost" size="sm">
                          <Link href={module.href}>
                            Open
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      )}
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
