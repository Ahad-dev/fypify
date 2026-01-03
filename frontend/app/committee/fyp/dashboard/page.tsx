'use client';

import * as React from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Calendar,
  Users,
  ClipboardList,
  TrendingUp,
  FolderKanban,
  AlertCircle,
  Eye,
  BarChart3,
} from 'lucide-react';
import {
  useCommitteePendingProjects,
  useDeadlineBatches,
  useActiveDocumentTypes,
} from '@/shared/hooks';
import { useProjects } from '@/shared/hooks/useProject';
import { Project } from '@/shared/types/project.types';

// Quick action cards configuration
const quickActions = [
  {
    title: 'Review Projects',
    description: 'Review and approve pending project registrations',
    icon: FileText,
    href: '/committee/fyp/projects',
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
  },
  {
    title: 'Manage Deadlines',
    description: 'Create and manage deadline batches',
    icon: Calendar,
    href: '/committee/fyp/deadlines',
    color: 'from-orange-500 to-amber-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
  },
  {
    title: 'Final Results',
    description: 'View project progress and release results',
    icon: TrendingUp,
    href: '/committee/fyp/results',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
  },
];

// Stats card component
function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  loading,
  subtitle,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground truncate">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Pending project item component
function PendingProjectItem({ project }: { project: Project }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
          <FolderKanban className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{project.title}</p>
          <p className="text-xs text-muted-foreground">
            {project.groupName && `Group: ${project.groupName}`}
            {project.domain && ` • ${project.domain}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="shrink-0">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/committee/fyp/projects">
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

// Active deadline badge component
function DeadlineBadge({ deadline }: { deadline: { deadlineDate: string; documentTypeTitle: string; isPast: boolean } }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
      <span className="text-sm font-medium truncate">{deadline.documentTypeTitle}</span>
      <Badge variant={deadline.isPast ? 'destructive' : 'outline'} className="shrink-0 ml-2">
        {format(new Date(deadline.deadlineDate), 'MMM d')}
      </Badge>
    </div>
  );
}

export default function CommitteeDashboardPage() {
  const { data: pendingData, isLoading: pendingLoading } = useCommitteePendingProjects({ size: 5 });
  const { data: batchesData, isLoading: batchesLoading } = useDeadlineBatches({ size: 10 });
  const { data: projectsData, isLoading: projectsLoading } = useProjects({ size: 100 });
  const { data: docTypes } = useActiveDocumentTypes();

  // Calculate statistics
  const pendingCount = pendingData?.content?.length ?? 0;
  const pendingProjects = pendingData?.content ?? [];
  
  const activeBatches = React.useMemo(() => {
    return batchesData?.content?.filter((b) => b.isActive) ?? [];
  }, [batchesData]);

  const projectStats = React.useMemo(() => {
    if (!projectsData?.content) return { approved: 0, rejected: 0, inProgress: 0, completed: 0, total: 0 };
    const projects = projectsData.content;
    return {
      approved: projects.filter((p: Project) => p.status === 'APPROVED').length,
      rejected: projects.filter((p: Project) => p.status === 'REJECTED').length,
      inProgress: projects.filter((p: Project) => p.status === 'IN_PROGRESS').length,
      completed: projects.filter((p: Project) => p.status === 'COMPLETED').length,
      total: projects.length,
    };
  }, [projectsData]);

  // Get upcoming deadlines from active batch
  const upcomingDeadlines = React.useMemo(() => {
    if (!activeBatches.length) return [];
    const allDeadlines = activeBatches.flatMap((batch) => batch.deadlines || []);
    return allDeadlines
      .filter((d) => !d.isPast)
      .sort((a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime())
      .slice(0, 5);
  }, [activeBatches]);

  // Calculate completion progress
  const completionProgress = React.useMemo(() => {
    const total = projectStats.approved + projectStats.inProgress + projectStats.completed;
    if (total === 0) return 0;
    return Math.round((projectStats.completed / total) * 100);
  }, [projectStats]);

  return (
    <RoleGuard allowedRoles={['FYP_COMMITTEE', 'ADMIN']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">FYP Committee Dashboard</h1>
                <p className="text-muted-foreground text-sm">
                  Manage projects, deadlines, and results
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/committee/fyp/results">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Results
                </Link>
              </Button>
              <Button asChild>
                <Link href="/committee/fyp/projects">
                  <FileText className="mr-2 h-4 w-4" />
                  Review Projects
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Pending Approval"
              value={pendingCount}
              icon={Clock}
              color="bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400"
              loading={pendingLoading}
            />
            <StatsCard
              title="Approved Projects"
              value={projectStats.approved + projectStats.inProgress}
              icon={CheckCircle}
              color="bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400"
              loading={projectsLoading}
              subtitle="Active projects"
            />
            <StatsCard
              title="Completed"
              value={projectStats.completed}
              icon={TrendingUp}
              color="bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
              loading={projectsLoading}
            />
            <StatsCard
              title="Active Deadline Batches"
              value={activeBatches.length}
              icon={Calendar}
              color="bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400"
              loading={batchesLoading}
            />
          </div>

          {/* Pending Alert */}
          {pendingCount > 0 && (
            <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg shrink-0">
                      <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
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
                  <Button asChild className="bg-yellow-600 hover:bg-yellow-700 shrink-0">
                    <Link href="/committee/fyp/projects">
                      Review Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                  <Link key={action.href} href={action.href}>
                    <Card className={`h-full transition-all hover:shadow-md cursor-pointer ${action.bgColor}`}>
                      <CardContent className="pt-6">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}>
                          <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-semibold mb-1">{action.title}</h3>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pending Projects List */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      Pending Projects
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/committee/fyp/projects">
                        View All
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pendingLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                      ))}
                    </div>
                  ) : pendingProjects.length > 0 ? (
                    pendingProjects.map((project) => (
                      <PendingProjectItem key={project.id} project={project} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-sm">All caught up! No pending projects.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Overall Progress */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    Overall Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Completion Rate</span>
                      <span className="font-medium">{completionProgress}%</span>
                    </div>
                    <Progress value={completionProgress} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold text-green-600">{projectStats.approved + projectStats.inProgress}</p>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold text-blue-600">{projectStats.completed}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Deadlines */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      Upcoming Deadlines
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/committee/fyp/deadlines">
                        Manage
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {batchesLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : upcomingDeadlines.length > 0 ? (
                    upcomingDeadlines.map((deadline, idx) => (
                      <DeadlineBadge key={idx} deadline={deadline} />
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No upcoming deadlines</p>
                      <Button variant="link" size="sm" asChild>
                        <Link href="/committee/fyp/deadlines">Create Batch</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Document Types Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    Document Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {docTypes ? (
                    <div className="space-y-2">
                      {docTypes.slice(0, 5).map((docType) => (
                        <div key={docType.id} className="flex items-center justify-between text-sm">
                          <span className="truncate">{docType.title}</span>
                          <Badge variant="outline" className="shrink-0">
                            {docType.weightSupervisor + docType.weightCommittee}%
                          </Badge>
                        </div>
                      ))}
                      {docTypes.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center pt-2">
                          +{docTypes.length - 5} more types
                        </p>
                      )}
                    </div>
                  ) : (
                    <Skeleton className="h-20 w-full" />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
