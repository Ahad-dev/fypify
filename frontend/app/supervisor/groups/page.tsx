'use client';

import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Calendar, GraduationCap } from 'lucide-react';

export default function SupervisorGroupsPage() {
  return (
    <RoleGuard allowedRoles={['SUPERVISOR', 'ADMIN']}>
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">My Groups</h1>
            <p className="text-muted-foreground">Manage your assigned student groups</p>
          </div>

          {/* Placeholder content */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Groups</CardTitle>
              <CardDescription>Student groups under your supervision</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Groups Page Coming Soon</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  View and manage your assigned student groups, their projects, and progress.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
