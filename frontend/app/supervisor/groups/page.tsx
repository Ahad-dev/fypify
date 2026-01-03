'use client';

import { useState } from 'react';
import { useMySupervisedProjects, useProject } from '@/shared/hooks/useProject';
import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { ProjectDetailsModal } from '@/components/project/ProjectDetailsModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Search,
  RefreshCw,
  Inbox,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Eye,
  Crown,
  UserCircle,
  Calendar,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';

/**
 * Supervisor Groups Page
 * Displays all groups/projects assigned to the supervisor
 */
export default function SupervisorGroupsPage() {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Project Details Modal state
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  // Fetch supervised projects
  const { 
    data: projectsData, 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = useMySupervisedProjects({ page, size: pageSize });
  
  // Fetch project details when selected
  const { data: selectedProject } = useProject(selectedProjectId || '');

  // Filter projects by search query and status
  const filteredProjects = projectsData?.content?.filter((project) => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.groupName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.group?.members?.some(m => 
        m.studentName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleViewProjectDetails = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsProjectModalOpen(true);
  };

  const totalPages = projectsData?.totalPages || 0;
  const totalElements = projectsData?.totalElements || 0;

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      'APPROVED': { variant: 'secondary', label: 'Approved' },
      'IN_PROGRESS': { variant: 'default', label: 'In Progress' },
      'COMPLETED': { variant: 'default', label: 'Completed' },
      'PENDING_APPROVAL': { variant: 'outline', label: 'Pending' },
      'REJECTED': { variant: 'destructive', label: 'Rejected' },
      'ARCHIVED': { variant: 'outline', label: 'Archived' },
    };
    const config = statusConfig[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <RoleGuard allowedRoles={['SUPERVISOR', 'ADMIN']}>
      <MainLayout>
        <div className="container py-8 space-y-8 w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                My Groups
              </h1>
              <p className="text-muted-foreground mt-2">
                View and manage groups assigned to you
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
              Refresh
            </Button>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by project, group name, or student..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1 py-2 px-3">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-semibold">{totalElements}</span>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Groups List */}
          {isLoading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="border-destructive">
              <CardContent className="py-8 text-center">
                <p className="text-destructive">
                  Failed to load groups. Please try again.
                </p>
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  className="mt-4"
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : filteredProjects.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Inbox className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No Groups Assigned</h3>
                <p className="text-muted-foreground mt-1">
                  {searchQuery
                    ? 'No groups match your search. Try a different query.'
                    : 'You have not been assigned as a supervisor for any projects yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FolderKanban className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {project.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Group: {project.groupName || 'Unknown'}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(project.status)}
                        {project.domain && (
                          <Badge variant="outline" className="text-xs">
                            {project.domain}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Project Abstract */}
                    {project.projectAbstract && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.projectAbstract}
                      </p>
                    )}
                    
                    <Separator />
                    
                    {/* Group Members */}
                    {project.group?.members && project.group.members.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <UserCircle className="h-4 w-4" />
                          Group Members ({project.group.members.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {project.group.members.map((member) => (
                            <div
                              key={member.studentId}
                              className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full"
                            >
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {getInitials(member.studentName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{member.studentName}</span>
                              {member.isLeader && (
                                <Crown className="h-3.5 w-3.5 text-amber-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Separator />
                    
                    {/* Footer with actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(project.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProjectDetails(project.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        <Link href={`/supervisor/submissions?project=${project.id}`}>
                          <Button variant="default" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            Submissions
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Project Details Modal */}
          <ProjectDetailsModal
            project={selectedProject || null}
            open={isProjectModalOpen}
            onOpenChange={setIsProjectModalOpen}
          />
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
