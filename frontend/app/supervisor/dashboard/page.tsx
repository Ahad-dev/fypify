'use client';

import * as React from 'react';
import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  FileText, 
  Calendar,
  GraduationCap,
  ClipboardCheck,
  Star,
  FolderKanban,
  Clock,
  Bell,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileCheck,
  ListTodo,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useMySupervisedProjects } from '@/shared/hooks/useProject';
import { usePendingSubmissions, useSupervisorLockedSubmissions } from '@/shared/hooks/useSubmission';
import { useNotifications } from '@/shared/hooks/useNotification';
import { useAuthContext } from '@/contexts';
import { formatDistanceToNow } from 'date-fns';

// Safe date formatting to prevent "Invalid time value" errors
const safeFormatDistance = (dateValue: string | Date | null | undefined): string => {
  if (!dateValue) return 'Unknown';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'Unknown';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Unknown';
  }
};

// Status badge for projects
const getProjectStatusBadge = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return <Badge className="bg-green-500">Approved</Badge>;
    case 'PENDING_APPROVAL':
      return <Badge className="bg-yellow-500">Pending</Badge>;
    case 'REJECTED':
      return <Badge className="bg-red-500">Rejected</Badge>;
    case 'IN_PROGRESS':
      return <Badge className="bg-blue-500">In Progress</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function SupervisorDashboardPage() {
  const { user } = useAuthContext();
  
  // Fetch supervised projects
  const { data: projectsData, isLoading: projectsLoading } = useMySupervisedProjects({ page: 0, size: 100 });
  
  // Fetch pending submissions for review
  const { data: pendingSubmissionsData, isLoading: pendingLoading } = usePendingSubmissions(0, 100);
  
  // Fetch locked submissions for evaluation
  const { data: lockedSubmissionsData, isLoading: lockedLoading } = useSupervisorLockedSubmissions(0, 100);
  
  // Fetch notifications
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications({ page: 0, size: 5 });

  // Calculate stats
  const projects = projectsData?.content || [];
  const pendingSubmissions = pendingSubmissionsData?.content || [];
  const lockedSubmissions = lockedSubmissionsData?.content || [];
  const notifications = notificationsData?.content || [];
  
  // Count projects by status
  const approvedProjects = projects.filter(p => p.status === 'APPROVED').length;
  const pendingProjects = projects.filter(p => p.status === 'PENDING_APPROVAL').length;
  const inProgressProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;
  
  // Count evaluated vs pending evaluations
  const pendingEvaluations = lockedSubmissions.filter(s => 
    s.supervisorScore === null || s.supervisorScore === undefined
  ).length;
  const completedEvaluations = lockedSubmissions.filter(s => 
    s.supervisorScore !== null && s.supervisorScore !== undefined
  ).length;

  const isLoading = projectsLoading || pendingLoading || lockedLoading;

  return (
    <RoleGuard allowedRoles={['SUPERVISOR', 'ADMIN']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Supervisor Dashboard</h1>
                <p className="text-muted-foreground text-sm">
                  Welcome back, {user?.fullName || 'Supervisor'}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Projects */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Supervised Projects</CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{projects.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {approvedProjects} approved, {pendingProjects} pending
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Pending Reviews */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <FileCheck className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                {pendingLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-orange-600">{pendingSubmissions.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Submissions awaiting review
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Pending Evaluations */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Evaluations</CardTitle>
                <Star className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                {lockedLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-amber-600">{pendingEvaluations}</div>
                    <p className="text-xs text-muted-foreground">
                      Locked submissions to evaluate
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Completed Evaluations */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Evaluations Done</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                {lockedLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-green-600">{completedEvaluations}</div>
                    <p className="text-xs text-muted-foreground">
                      Submissions evaluated
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Quick Actions Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common supervisor tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/supervisor/submissions">
                    <FileCheck className="mr-2 h-4 w-4 text-orange-500" />
                    Review Submissions
                    {pendingSubmissions.length > 0 && (
                      <Badge className="ml-auto bg-orange-500">{pendingSubmissions.length}</Badge>
                    )}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/supervisor/evaluation">
                    <Star className="mr-2 h-4 w-4 text-amber-500" />
                    Provide Marks
                    {pendingEvaluations > 0 && (
                      <Badge className="ml-auto bg-amber-500">{pendingEvaluations}</Badge>
                    )}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/supervisor/groups">
                    <Users className="mr-2 h-4 w-4 text-blue-500" />
                    View Groups
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Projects Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderKanban className="h-5 w-5 text-primary" />
                  Your Projects
                </CardTitle>
                <CardDescription>Projects you're supervising</CardDescription>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))}
                  </div>
                ) : projects.length > 0 ? (
                  <div className="space-y-3">
                    {projects.slice(0, 5).map((project) => (
                      <div 
                        key={project.id} 
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0 mr-4">
                          <p className="font-medium text-sm truncate">{project.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Group: {project.groupName || 'N/A'}
                          </p>
                        </div>
                        {getProjectStatusBadge(project.status)}
                      </div>
                    ))}
                    {projects.length > 5 && (
                      <Button asChild variant="ghost" size="sm" className="w-full">
                        <Link href="/supervisor/groups">
                          View all {projects.length} projects
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FolderKanban className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No projects assigned yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Reviews Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-orange-500" />
                  Pending Reviews
                </CardTitle>
                <CardDescription>Submissions awaiting your review</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-3 border rounded-lg">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : pendingSubmissions.length > 0 ? (
                  <div className="space-y-3">
                    {pendingSubmissions.slice(0, 4).map((submission) => (
                      <div 
                        key={submission.id} 
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0 mr-4">
                          <p className="font-medium text-sm truncate">{submission.projectTitle}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <FileText className="h-3 w-3" />
                            {submission.documentTypeTitle}
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            {safeFormatDistance(submission.uploadedAt)}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          Pending
                        </Badge>
                      </div>
                    ))}
                    {pendingSubmissions.length > 4 && (
                      <Button asChild variant="ghost" size="sm" className="w-full">
                        <Link href="/supervisor/submissions">
                          View all {pendingSubmissions.length} pending
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-10 w-10 mx-auto text-green-500 mb-3" />
                    <p className="text-muted-foreground">All submissions reviewed!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notifications Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-purple-500" />
                  Recent Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notificationsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-20 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="flex gap-3 items-start">
                        <div className={`h-2 w-2 mt-1.5 rounded-full flex-shrink-0 ${notification.isRead ? 'bg-gray-300' : 'bg-primary'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${!notification.isRead ? 'font-medium' : ''}`}>
                            {notification.title || notification.payload?.title || 'Notification'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {safeFormatDistance(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No notifications</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Evaluation Progress Card */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Evaluation Progress
                </CardTitle>
                <CardDescription>Your evaluation completion status</CardDescription>
              </CardHeader>
              <CardContent>
                {lockedLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : lockedSubmissions.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Evaluations Completed</span>
                      <span className="font-medium">{completedEvaluations} / {lockedSubmissions.length}</span>
                    </div>
                    <Progress 
                      value={(completedEvaluations / lockedSubmissions.length) * 100} 
                      className="h-3" 
                    />
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="text-muted-foreground">Completed: {completedEvaluations}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-amber-500" />
                        <span className="text-muted-foreground">Pending: {pendingEvaluations}</span>
                      </div>
                    </div>
                    {pendingEvaluations > 0 && (
                      <Button asChild variant="default" size="sm">
                        <Link href="/supervisor/evaluation">
                          <Star className="mr-2 h-4 w-4" />
                          Continue Evaluating
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <ClipboardCheck className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No locked submissions for evaluation yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submissions are locked by the FYP Committee for evaluation
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
