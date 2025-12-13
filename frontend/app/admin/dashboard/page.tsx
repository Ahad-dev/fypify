'use client';

import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  FolderKanban, 
  Settings, 
  BarChart3,
  Shield,
  Bell,
  Activity
} from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <MainLayout>
        <div className="min-h-[calc(100vh-10rem)] flex flex-col">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground text-sm">System administration & management</p>
              </div>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-2xl border-dashed border-2 bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20">
              <CardContent className="py-16">
                <div className="text-center space-y-6">
                  {/* Animated Icon Grid */}
                  <div className="flex justify-center gap-4 mb-8">
                    <div className="p-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg animate-bounce" style={{ animationDelay: '0ms' }}>
                      <Users className="h-8 w-8 text-red-500" />
                    </div>
                    <div className="p-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg animate-bounce" style={{ animationDelay: '150ms' }}>
                      <FolderKanban className="h-8 w-8 text-orange-500" />
                    </div>
                    <div className="p-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg animate-bounce" style={{ animationDelay: '300ms' }}>
                      <BarChart3 className="h-8 w-8 text-amber-500" />
                    </div>
                    <div className="p-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg animate-bounce" style={{ animationDelay: '450ms' }}>
                      <Settings className="h-8 w-8 text-red-400" />
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent mb-3">
                      Coming Soon
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      The admin dashboard is under development. You&apos;ll be able to manage users, 
                      view system analytics, configure settings, and oversee all FYP activities.
                    </p>
                  </div>

                  {/* Feature Preview */}
                  <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mt-8">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Activity className="h-4 w-4 text-red-500" />
                      <span>User Management</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BarChart3 className="h-4 w-4 text-orange-500" />
                      <span>System Analytics</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Bell className="h-4 w-4 text-amber-500" />
                      <span>Notifications</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Settings className="h-4 w-4 text-red-400" />
                      <span>System Settings</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
