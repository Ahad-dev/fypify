'use client';

import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  Settings, 
  BarChart3,
  Shield,
  Activity,
  ArrowRight,
  UserPlus,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

const adminModules = [
  {
    title: 'User Management',
    description: 'Create, edit, and manage system users and their roles',
    icon: Users,
    href: '/admin/users',
    color: 'from-blue-500 to-blue-600',
    stats: 'Manage all users',
  },
  {
    title: 'Document Types',
    description: 'Configure FYP document types and evaluation weights',
    icon: FileText,
    href: '/admin/document-types',
    color: 'from-orange-500 to-amber-600',
    stats: 'Configure weights',
  },
  {
    title: 'System Settings',
    description: 'Configure system-wide settings and parameters',
    icon: Settings,
    href: '/admin/settings',
    color: 'from-purple-500 to-purple-600',
    stats: 'Coming soon',
    disabled: true,
  },
  {
    title: 'Analytics',
    description: 'View system analytics and reports',
    icon: BarChart3,
    href: '/admin/analytics',
    color: 'from-green-500 to-green-600',
    stats: 'Coming soon',
    disabled: true,
  },
];

export default function AdminDashboardPage() {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <MainLayout>
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground text-sm">System administration & management</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/admin/users">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Link>
              </Button>
              <Button asChild>
                <Link href="/admin/document-types">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Document Type
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-950 rounded-lg">
                    <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Document Types</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-950 rounded-lg">
                    <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Projects</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-950 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">This Semester</p>
                    <p className="text-2xl font-bold">Fall 2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Modules */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Administration Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adminModules.map((module) => (
                <Card 
                  key={module.href} 
                  className={module.disabled ? 'opacity-60' : 'hover:shadow-md transition-shadow'}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-2 bg-gradient-to-br ${module.color} rounded-lg`}>
                        <module.icon className="h-5 w-5 text-white" />
                      </div>
                      {!module.disabled && (
                        <Button asChild variant="ghost" size="sm">
                          <Link href={module.href}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{module.stats}</span>
                      {!module.disabled ? (
                        <Button asChild variant="outline" size="sm">
                          <Link href={module.href}>
                            Open
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          Coming Soon
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
