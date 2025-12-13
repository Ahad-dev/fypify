'use client';

import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserPlus,
  Settings,
  Shield,
  Activity,
  Database,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminUsersPage() {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-muted-foreground">Manage system users and their roles</p>
            </div>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>

          {/* Placeholder content */}
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>List of all registered users in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">User Management Coming Soon</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  This page will display all users with options to add, edit, and manage user roles.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
