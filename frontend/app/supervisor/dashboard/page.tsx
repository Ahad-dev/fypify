'use client';

import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  FileText, 
  Calendar,
  MessageSquare,
  GraduationCap,
  ClipboardCheck,
  Star,
  BookOpen
} from 'lucide-react';

export default function SupervisorDashboardPage() {
  return (
    <RoleGuard allowedRoles={['SUPERVISOR', 'ADMIN']}>
      <MainLayout>
        <div className="min-h-[calc(100vh-10rem)] flex flex-col">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Supervisor Dashboard</h1>
                <p className="text-muted-foreground text-sm">Guide and evaluate student projects</p>
              </div>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-2xl border-dashed border-2 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardContent className="py-16">
                <div className="text-center space-y-6">
                  {/* Animated Icon Grid */}
                  <div className="flex justify-center gap-4 mb-8">
                    <div className="p-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg animate-bounce" style={{ animationDelay: '0ms' }}>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="p-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg animate-bounce" style={{ animationDelay: '150ms' }}>
                      <FileText className="h-8 w-8 text-indigo-500" />
                    </div>
                    <div className="p-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg animate-bounce" style={{ animationDelay: '300ms' }}>
                      <Calendar className="h-8 w-8 text-violet-500" />
                    </div>
                    <div className="p-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg animate-bounce" style={{ animationDelay: '450ms' }}>
                      <ClipboardCheck className="h-8 w-8 text-blue-400" />
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent mb-3">
                      Coming Soon
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      The supervisor dashboard is under development. You&apos;ll be able to manage 
                      your assigned groups, review proposals, schedule meetings, and evaluate student work.
                    </p>
                  </div>

                  {/* Feature Preview */}
                  <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mt-8">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>Manage Groups</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      <span>Review Proposals</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 text-violet-500" />
                      <span>Schedule Meetings</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 text-blue-400" />
                      <span>Evaluate Work</span>
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
