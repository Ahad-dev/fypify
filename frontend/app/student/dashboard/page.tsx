'use client';

import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FolderKanban, 
  Users, 
  FileText, 
  Calendar,
  Target,
  BookOpen,
  Rocket,
  CheckSquare
} from 'lucide-react';

export default function StudentDashboardPage() {
  return (
    <RoleGuard allowedRoles={['STUDENT']}>
      <MainLayout>
        <div className="min-h-[calc(100vh-10rem)] flex flex-col">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-primary to-primary-dark rounded-xl shadow-lg">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
                <p className="text-muted-foreground text-sm">Track your FYP progress</p>
              </div>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-2xl border-dashed border-2 bg-gradient-to-br from-primary-extra-light/50 to-secondary-light/30 dark:from-primary/10 dark:to-secondary/10">
              <CardContent className="py-16">
                <div className="text-center space-y-6">
                  {/* Animated Icon Grid */}
                  <div className="flex justify-center gap-4 mb-8">
                    <div className="p-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg animate-bounce" style={{ animationDelay: '0ms' }}>
                      <FolderKanban className="h-8 w-8 text-primary" />
                    </div>
                    <div className="p-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg animate-bounce" style={{ animationDelay: '150ms' }}>
                      <Users className="h-8 w-8 text-secondary" />
                    </div>
                    <div className="p-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg animate-bounce" style={{ animationDelay: '300ms' }}>
                      <FileText className="h-8 w-8 text-accent" />
                    </div>
                    <div className="p-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg animate-bounce" style={{ animationDelay: '450ms' }}>
                      <Target className="h-8 w-8 text-success" />
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
                      Coming Soon
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Your personalized student dashboard is under development. Track your project progress, 
                      manage tasks, collaborate with your group, and stay on top of deadlines.
                    </p>
                  </div>

                  {/* Feature Preview */}
                  <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mt-8">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FolderKanban className="h-4 w-4 text-primary" />
                      <span>Project Tracking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4 text-secondary" />
                      <span>Group Collaboration</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckSquare className="h-4 w-4 text-accent" />
                      <span>Task Management</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 text-success" />
                      <span>Meeting Scheduler</span>
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
