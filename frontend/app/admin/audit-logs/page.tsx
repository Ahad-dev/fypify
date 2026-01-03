'use client';

import * as React from 'react';
import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColumnDef } from '@tanstack/react-table';
import { 
  FileText, 
  RefreshCw,
  Filter,
  Clock,
} from 'lucide-react';
import { useAuditLogs } from '@/shared/hooks';
import { AuditLog } from '@/shared/types';
import { format } from 'date-fns';

export default function AuditLogsPage() {
  const [page, setPage] = React.useState(0);
  const [pageSize] = React.useState(20);

  const { data: auditLogsData, isLoading, refetch } = useAuditLogs({
    page,
    size: pageSize,
  });

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Time',
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as string;
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {date ? format(new Date(date), 'MMM d, yyyy HH:mm:ss') : '-'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => {
        const action = row.getValue('action') as string;
        const variant = getActionVariant(action);
        return (
          <Badge variant={variant} className="font-mono text-xs">
            {action}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'actorName',
      header: 'Actor',
      cell: ({ row }) => {
        return (
          <div>
            <p className="font-medium text-sm">{row.original.actorName || 'System'}</p>
            <p className="text-xs text-muted-foreground">{row.original.actorEmail || '-'}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'entityType',
      header: 'Entity',
      cell: ({ row }) => (
        <code className="bg-muted px-2 py-1 rounded text-xs">
          {row.original.entityType || '-'}
        </code>
      ),
    },
    {
      accessorKey: 'details',
      header: 'Details',
      cell: ({ row }) => {
        const details = row.original.details;
        if (!details) return <span className="text-muted-foreground">-</span>;
        return (
          <pre className="bg-muted px-2 py-1 rounded text-xs max-w-xs overflow-hidden text-ellipsis">
            {JSON.stringify(details, null, 0).slice(0, 50)}...
          </pre>
        );
      },
    },
  ];

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Audit Logs</h1>
                <p className="text-muted-foreground text-sm">
                  View system activity and administrative actions
                </p>
              </div>
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Showing the most recent {pageSize} audit log entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={auditLogsData?.content ?? []}
                isLoading={isLoading}
                searchPlaceholder="Search logs..."
                searchColumn="action"
                emptyMessage="No audit logs found."
              />
              
              {/* Pagination */}
              {auditLogsData && auditLogsData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page + 1} of {auditLogsData.totalPages} ({auditLogsData.totalElements} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p + 1)}
                      disabled={page >= auditLogsData.totalPages - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}

function getActionVariant(action: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (action.includes('DELETE') || action.includes('REMOVE')) return 'destructive';
  if (action.includes('CREATE') || action.includes('ADD')) return 'default';
  if (action.includes('UPDATE') || action.includes('EDIT')) return 'secondary';
  return 'outline';
}
