'use client';

import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function SupervisorProposalsPage() {
  return (
    <RoleGuard allowedRoles={['SUPERVISOR', 'ADMIN']}>
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Proposals</h1>
            <p className="text-muted-foreground">Review and manage student proposals</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pending Proposals</CardTitle>
              <CardDescription>Proposals awaiting your review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Proposals Page Coming Soon</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  Review, approve, or request changes on student project proposals.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
