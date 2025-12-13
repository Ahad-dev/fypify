'use client';

import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderKanban, TrendingUp } from 'lucide-react';

export default function StudentProjectPage() {
  return (
    <RoleGuard allowedRoles={['STUDENT']}>
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">My Project</h1>
            <p className="text-muted-foreground">View and manage your FYP project</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Your final year project information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Project Page Coming Soon</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  View your project details, milestones, tasks, and submit deliverables.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
