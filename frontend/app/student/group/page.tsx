'use client';

import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function StudentGroupPage() {
  return (
    <RoleGuard allowedRoles={['STUDENT']}>
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">My Group</h1>
            <p className="text-muted-foreground">Your FYP group details</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Group Members</CardTitle>
              <CardDescription>Your team members and supervisor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Group Page Coming Soon</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  View your group members, assigned supervisor, and group project details.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
