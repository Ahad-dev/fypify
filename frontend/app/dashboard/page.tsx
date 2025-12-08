"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLogout } from "@/shared/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LogOut, User, Mail, Shield, CheckCircle, Clock, 
  GraduationCap, FileText, Users, TrendingUp, 
  Calendar, Activity, Award, Bell, Settings,
  FolderKanban, Target, BarChart3, AlertCircle
} from "lucide-react";
import AuthGuard from "@/components/guards/AuthGuard";
import Logo from "@/components/common/Logo";

function DashboardContent() {
  const { user } = useAuth();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    const variants: Record<string, string> = {
      ADMIN: "badge-danger",
      COMMITTEE: "badge-primary",
      SUPERVISOR: "badge-info",
      EVALUATOR: "badge-warning",
      STUDENT: "badge-success",
    };
    return variants[role] || "badge-secondary";
  };

  const getRoleIcon = (role: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const icons: Record<string, any> = {
      ADMIN: Shield,
      COMMITTEE: Users,
      SUPERVISOR: Award,
      EVALUATOR: Target,
      STUDENT: GraduationCap,
    };
    const Icon = icons[role] || User;
    return <Icon className="w-4 h-4" />;
  };

  const quickActions = [
    { icon: FolderKanban, label: "Create Project", color: "primary" },
    { icon: FileText, label: "Submit Report", color: "secondary" },
    { icon: Users, label: "Team Meeting", color: "info" },
    { icon: Calendar, label: "Schedule Review", color: "accent" },
  ];

  const stats = [
    {
      title: "Active Projects",
      value: "0",
      change: "+0%",
      icon: FolderKanban,
      color: "primary",
      trend: "up"
    },
    {
      title: "Pending Tasks",
      value: "0",
      change: "0 overdue",
      icon: FileText,
      color: "warning",
      trend: "neutral"
    },
    {
      title: "Team Members",
      value: "0",
      change: "+0 this week",
      icon: Users,
      color: "info",
      trend: "up"
    },
    {
      title: "Completion Rate",
      value: "0%",
      change: "+0% from last month",
      icon: TrendingUp,
      color: "success",
      trend: "up"
    },
  ];

  return (
    <div className="min-h-screen gradient-bg">
      {/* Enhanced Header */}
      <header className="bg-white/95 backdrop-blur-xl shadow-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Logo size="md" showTagline={false} />
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:bg-neutral-100"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full text-xs text-white flex items-center justify-center">
                  0
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-neutral-100"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-neutral-200 hover:bg-neutral-50"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in-down">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
                Welcome back, <span className="text-primary">{user?.name}</span>! 👋
              </h2>
              <p className="text-neutral-600 text-lg">
                Here&apos;s an overview of your projects and activities
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  className="btn btn-ghost bg-white hover:bg-neutral-50 border border-neutral-200 py-4 justify-start animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Icon className={`w-5 h-5 text-${action.color}`} />
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index} 
                className="bg-white/80 backdrop-blur-sm border-neutral-200 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${stat.color}`} />
                    </div>
                    {stat.trend === "up" && (
                      <div className="flex items-center gap-1 text-success text-sm font-medium">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-neutral-600 font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-neutral-900">{stat.value}</p>
                    <p className="text-xs text-neutral-500">{stat.change}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm border-neutral-200 animate-fade-in-left">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-primary" />
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-neutral-200">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-primary to-primary-dark flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                    {user?.name.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-4 border-white"></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-neutral-900 mb-1">{user?.name}</h3>
                  <div className={`badge ${getRoleBadgeVariant(user?.role || "")} inline-flex items-center gap-1`}>
                    {getRoleIcon(user?.role || "")}
                    <span>{user?.role}</span>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <Mail className="w-5 h-5 text-neutral-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-500 mb-0.5">Email Address</p>
                    <p className="text-sm text-neutral-900 font-medium truncate">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <Shield className="w-5 h-5 text-neutral-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-500 mb-0.5">User ID</p>
                    <p className="text-sm text-neutral-900 font-mono">{user?.id.slice(0, 8)}...</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-success-light rounded-lg">
                  <CheckCircle className="w-5 h-5 text-success-dark" />
                  <div className="flex-1">
                    <p className="text-sm text-success-dark font-semibold">Account Active</p>
                    <p className="text-xs text-success-dark/70">All systems operational</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button className="w-full btn-outline border-2">
                <User className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Activity & Recent Updates */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity */}
            <Card className="bg-white/80 backdrop-blur-sm border-neutral-200 animate-fade-in-up">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5 text-primary" />
                    <span>Recent Activity</span>
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-600 font-medium mb-2">No recent activity</p>
                  <p className="text-sm text-neutral-500 max-w-sm mx-auto">
                    Your activity timeline will appear here once you start working on projects
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="bg-white/80 backdrop-blur-sm border-neutral-200 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="w-5 h-5 text-warning" />
                  <span>Upcoming Deadlines</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-600 font-medium mb-2">No upcoming deadlines</p>
                  <p className="text-sm text-neutral-500 max-w-sm mx-auto">
                    Project deadlines and milestones will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <Card className="mt-6 bg-white/80 backdrop-blur-sm border-neutral-200 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span>Performance Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-neutral-400" />
              </div>
              <p className="text-neutral-600 font-medium mb-2">Performance analytics coming soon</p>
              <p className="text-sm text-neutral-500 max-w-sm mx-auto">
                Track your progress and project statistics with interactive charts
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
