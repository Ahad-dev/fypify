'use client';

import * as React from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  FileText,
  Users,
  GraduationCap,
  Calendar,
  Globe,
  User,
  Mail,
  Crown,
} from 'lucide-react';
import { Project } from '@/shared/types';

interface ProjectDetailsModalProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Project Details Modal Component
 * Displays complete project information including title, domain, abstract,
 * supervisor details, and group members.
 */
export function ProjectDetailsModal({
  project,
  open,
  onOpenChange,
}: ProjectDetailsModalProps) {
  if (!project) return null;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 'secondary';
      case 'APPROVED':
        return 'default';
      case 'REJECTED':
        return 'destructive';
      case 'IN_PROGRESS':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl pr-6">{project.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Badge variant={getStatusBadgeVariant(project.status)}>
                  {project.statusDisplay || project.status}
                </Badge>
                {project.domain && (
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {project.domain}
                  </span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)] pr-4">
          <div className="space-y-6">
            {/* Project Abstract */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                Project Abstract
              </h4>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {project.projectAbstract || 'No abstract provided.'}
                </p>
              </div>
            </div>

            <Separator />

            {/* Supervisor Information */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                <GraduationCap className="h-4 w-4" />
                Supervisor Information
              </h4>

              {/* Assigned Supervisor */}
              {project.supervisor ? (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-green-600 text-white">
                        {getInitials(project.supervisor.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{project.supervisor.fullName}</p>
                        <Badge variant="default" className="text-xs">Assigned</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {project.supervisor.email}
                      </p>
                    </div>
                  </div>
                </div>
              ) : project.proposedSupervisorDetails && project.proposedSupervisorDetails.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Proposed Supervisors:</p>
                  <div className="grid gap-2">
                    {project.proposedSupervisorDetails.map((supervisor, index) => (
                      <div
                        key={supervisor.id}
                        className="bg-muted/50 rounded-lg p-3 flex items-center gap-3"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-indigo-600 text-white text-xs">
                            {getInitials(supervisor.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{supervisor.fullName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {supervisor.email}
                          </p>
                        </div>
                        {index === 0 && (
                          <Badge variant="secondary" className="text-xs">Primary Choice</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">No supervisor assigned or proposed.</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Group Information */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                Group Information
              </h4>

              {project.group ? (
                <div className="space-y-3">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium">{project.group.name}</h5>
                      <Badge variant="outline">
                        {project.group.memberCount} Member{project.group.memberCount !== 1 ? 's' : ''}
                      </Badge>
                    </div>

                    {/* Group Members */}
                    <div className="space-y-2">
                      {project.group.members && project.group.members.length > 0 ? (
                        project.group.members.map((member) => (
                          <div
                            key={member.studentId}
                            className="flex items-center gap-3 p-2 bg-background rounded-md"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-blue-600 text-white text-xs">
                                {getInitials(member.studentName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm truncate">{member.studentName}</p>
                                {member.isLeader && (
                                  <Crown className="h-3.5 w-3.5 text-yellow-500" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {member.studentEmail}
                              </p>
                            </div>
                            {member.isLeader && (
                              <Badge variant="secondary" className="text-xs shrink-0">Leader</Badge>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          No member details available.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm">
                    <span className="font-medium">Group:</span> {project.groupName || 'N/A'}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Submitted
                </p>
                <p className="font-medium">
                  {format(new Date(project.createdAt), 'MMMM d, yyyy')}
                </p>
              </div>
              {project.approvedAt && (
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Approved
                  </p>
                  <p className="font-medium">
                    {format(new Date(project.approvedAt), 'MMMM d, yyyy')}
                  </p>
                </div>
              )}
              {project.approvedBy && (
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Approved By
                  </p>
                  <p className="font-medium">{project.approvedBy.fullName}</p>
                </div>
              )}
              {project.rejectionReason && (
                <div className="col-span-2 space-y-1">
                  <p className="text-muted-foreground">Rejection Reason</p>
                  <p className="font-medium text-destructive">{project.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default ProjectDetailsModal;
