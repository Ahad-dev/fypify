'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FolderKanban,
  Users,
  FileText,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isAdmin, isSupervisor, isStudent } = useAuthContext();

  // Mock stats - will be fetched from API
  const stats = {
    totalProjects: 12,
    activeProjects: 8,
    pendingProposals: 3,
    upcomingMeetings: 5,
  };

  const quickActions = [
    {
      label: 'View Projects',
      href: '/projects',
      icon: FolderKanban,
      description: 'Browse all your projects',
    },
    {
      label: isStudent ? 'My Group' : 'View Groups',
      href: isStudent ? '/groups/my' : '/groups',
      icon: Users,
      description: isStudent ? 'View your group details' : 'Manage student groups',
    },
    {
      label: 'Proposals',
      href: '/proposals',
      icon: FileText,
      description: isStudent ? 'Submit or view proposals' : 'Review pending proposals',
    },
    {
      label: 'Meetings',
      href: '/meetings',
      icon: Calendar,
      description: 'View scheduled meetings',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'project',
      message: 'Project "AI Chatbot" was updated',
      time: '2 hours ago',
      icon: FolderKanban,
    },
    {
      id: 2,
      type: 'meeting',
      message: 'Meeting scheduled with Dr. Ahmed',
      time: '5 hours ago',
      icon: Calendar,
    },
    {
      id: 3,
      type: 'proposal',
      message: 'New proposal submitted for review',
      time: '1 day ago',
      icon: FileText,
    },
    {
      id: 4,
      type: 'group',
      message: 'New member added to your group',
      time: '2 days ago',
      icon: Users,
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here&apos;s what&apos;s happening with your projects today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Badge variant="destructive" className="px-3 py-1">
                Admin
              </Badge>
            )}
            {isSupervisor && !isAdmin && (
              <Badge variant="default" className="px-3 py-1">
                Supervisor
              </Badge>
            )}
            {isStudent && (
              <Badge variant="secondary" className="px-3 py-1">
                Student
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1 text-success" />
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProjects}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.activeProjects / stats.totalProjects) * 100)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Proposals</CardTitle>
              <AlertCircle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingProposals}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingMeetings}</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you might want to do</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href}>
                    <Button
                      variant="outline"
                      className="w-full h-auto flex-col items-start p-4 gap-2 hover:bg-primary/5 hover:border-primary/50"
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <div className="font-medium">{action.label}</div>
                        <div className="text-xs text-muted-foreground font-normal">
                          {action.description}
                        </div>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates in your workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{activity.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
