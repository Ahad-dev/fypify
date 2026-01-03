'use client';

import * as React from 'react';
import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  FolderKanban, 
  Users, 
  FileText, 
  Calendar,
  Rocket,
  Clock,
  Bell,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Upload,
  UserCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useMyGroup } from '@/shared/hooks/useGroup';
import { useProject, useProjectByGroup } from '@/shared/hooks/useProject';
import { useProjectSubmissions, useActiveDocumentTypes, useProjectDeadlines } from '@/shared/hooks/useSubmission';
import { useNotifications } from '@/shared/hooks/useNotification';
import { formatDistanceToNow, isFuture } from 'date-fns';
import { useSystemSettingsContext } from '@/contexts';

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

const safeFormatDate = (dateValue: string | Date | null | undefined): string => {
  if (!dateValue) return 'Unknown';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'Unknown';
    return date.toLocaleDateString();
  } catch {
    return 'Unknown';
  }
};

// Status badge variants
const getStatusBadge = (status: string) => {
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

export default function StudentDashboardPage() {
  // Fetch group and project data - match submissions page pattern
  const { data: group, isLoading: groupLoading } = useMyGroup();
  const { data: project, isLoading: projectLoading } = useProject(group?.projectId || '');
  const { data: submissions, isLoading: submissionsLoading } = useProjectSubmissions(project?.id || '');
  const { data: deadlines } = useProjectDeadlines(project?.id || '');
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications({ page: 0, size: 2 });
  const { getCurrentSemester } = useSystemSettingsContext();

  // Get notifications array
  const notifications = notificationsData?.content || [];

  // Calculate upcoming deadlines from project deadlines
  const upcomingDeadlines = React.useMemo(() => {
    if (!deadlines) return [];
    return deadlines
      .filter(d => d.deadlineDate && isFuture(new Date(d.deadlineDate)))
      .sort((a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime())
      .slice(0, 3);
  }, [deadlines]);

  // Get the next deadline
  const nextDeadline = upcomingDeadlines[0];

  // Get latest submission (sorted by version descending)
  const latestSubmission = React.useMemo(() => {
    if (!submissions || submissions.length === 0) return null;
    return [...submissions].sort((a, b) => b.version - a.version)[0];
  }, [submissions]);

  // Calculate submission progress
  const totalDocTypes = deadlines?.length || 0;
  const submittedDocTypes = new Set(submissions?.map(s => s.documentTypeId)).size;
  const progressPercentage = totalDocTypes > 0 ? (submittedDocTypes / totalDocTypes) * 100 : 0;

  const isLoading = groupLoading || projectLoading;

  return (
    <RoleGuard allowedRoles={['STUDENT']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
                <p className="text-muted-foreground text-sm">
                  {getCurrentSemester()} • Track your FYP progress
                </p>
              </div>
            </div>
            {project && (
              <Button asChild>
                <Link href="/student/submissions">
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Document
                </Link>
              </Button>
            )}
          </div>

          {/* No Group State */}
          {!isLoading && !group && (
            <Card className="border-dashed border-2">
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Group Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Join or create a group to start your FYP journey
                </p>
                <Button asChild>
                  <Link href="/student/group">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Group
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Main Dashboard Grid */}
          {(isLoading || group) && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Current Project Card */}
              <Card key="project-card" className="md:col-span-2 lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <FolderKanban className="h-5 w-5 text-primary" />
                    Current Project
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading || projectLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ) : project ? (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{project.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.projectAbstract}
                          </p>
                        </div>
                        {getStatusBadge(project.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <UserCircle className="h-4 w-4" />
                          <span>Supervisor: {project.supervisor?.fullName || 'Not assigned'}</span>
                        </div>
                      </div>
                      {/* Submission Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Submission Progress</span>
                          <span className="font-medium">{submittedDocTypes}/{totalDocTypes} documents</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/student/project">
                          View Project Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FolderKanban className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground mb-3">No project registered yet</p>
                      <Button asChild variant="outline">
                        <Link href="/student/project">Register Project</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Group Members Card */}
              <Card key="group-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Group Members
                  </CardTitle>
                  <CardDescription>
                    {group ? `${group.members?.length || 0} members` : 'No group'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {groupLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : group?.members ? (
                    <div className="space-y-3">
                      {group.members.map((member) => (
                        <div key={member.studentId} className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {member.studentName?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{member.studentName}</p>
                            {member.studentId === group.leader?.id && (
                              <Badge variant="default" className="text-xs">Leader</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                      <Button asChild variant="ghost" size="sm" className="w-full mt-2">
                        <Link href="/student/group">
                          Manage Group
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No group members</p>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Deadline Card */}
              <Card key="deadline-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-500" />
                    Next Deadline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!deadlines ? (
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ) : nextDeadline ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">{nextDeadline.documentTypeTitle}</p>
                            <p className="text-xs text-muted-foreground">
                              Due {safeFormatDistance(nextDeadline.deadlineDate)}
                            </p>
                            <p className="text-xs font-mono text-orange-600 dark:text-orange-400 mt-1">
                              {safeFormatDate(nextDeadline.deadlineDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {upcomingDeadlines.length > 1 && (
                        <div className="text-xs text-muted-foreground">
                          +{upcomingDeadlines.length - 1} more upcoming
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                      <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Latest Submission Card */}
              <Card key="submission-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-500" />
                    Latest Submission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {submissionsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ) : latestSubmission ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {latestSubmission.documentTypeTitle}
                        </p>
                        <Badge variant={
                          latestSubmission.status === 'APPROVED_BY_SUPERVISOR' ? 'default' :
                          latestSubmission.status === 'PENDING_SUPERVISOR' ? 'secondary' : 'destructive'
                        }>
                          {latestSubmission.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Submitted {formatDistanceToNow(new Date(latestSubmission.uploadedAt), { addSuffix: true })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Version {latestSubmission.version}
                      </p>
                      <Button asChild variant="ghost" size="sm" className="w-full mt-2">
                        <Link href="/student/submissions">
                          View All Submissions
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ) : project ? (
                    <div className="text-center py-4">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">No submissions yet</p>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/student/submissions">Submit Now</Link>
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Register a project first
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Notifications Card */}
              <Card key="notifications-card" className="h-[270px]  lg:col-span-1 overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-purple-500" />
                    Recent Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {notificationsLoading ? (
                    <div className="space-y-3 overflow-y-auto">
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
                      {notifications.slice(0, 5).map((notification) => (
                        <div key={notification.id} className="flex gap-3 items-start">
                          <div className={`h-2 w-2 mt-1.5 rounded-full ${notification.isRead ? 'bg-gray-300' : 'bg-primary'}`} />
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
                    <div className="text-center py-4">
                      <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No notifications</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
