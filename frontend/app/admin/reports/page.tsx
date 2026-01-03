'use client';

import * as React from 'react';
import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileSpreadsheet, 
  Download,
  FileText,
  Loader2,
} from 'lucide-react';
import {
  useDownloadProjectMarksheet,
  useDownloadAllMarksheet,
} from '@/shared/hooks';
import { useProjects } from '@/shared/hooks/useProject';

export default function ReportsPage() {
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>('');
  
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const downloadProjectMarksheet = useDownloadProjectMarksheet();
  const downloadAllMarksheet = useDownloadAllMarksheet();

  const handleDownloadProject = async () => {
    if (!selectedProjectId) return;
    await downloadProjectMarksheet.mutateAsync(selectedProjectId);
  };

  const handleDownloadAll = async () => {
    await downloadAllMarksheet.mutateAsync();
  };

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <FileSpreadsheet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Reports & Exports</h1>
              <p className="text-muted-foreground text-sm">
                Export marksheets and project data
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Export Single Project */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Project Marksheet
                </CardTitle>
                <CardDescription>
                  Download the marksheet for a specific project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Project</label>
                  <Select
                    value={selectedProjectId}
                    onValueChange={setSelectedProjectId}
                    disabled={projectsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a project..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects?.content?.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleDownloadProject}
                  disabled={!selectedProjectId || downloadProjectMarksheet.isPending}
                  className="w-full"
                >
                  {downloadProjectMarksheet.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download Excel
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Export All Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-green-500" />
                  All Marksheets
                </CardTitle>
                <CardDescription>
                  Download a combined marksheet for all released projects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    This will export an Excel file containing:
                  </p>
                  <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                    <li>All projects with released results</li>
                    <li>Total scores and grades</li>
                    <li>Supervisor information</li>
                    <li>Group details</li>
                  </ul>
                </div>

                <Button
                  onClick={handleDownloadAll}
                  disabled={downloadAllMarksheet.isPending}
                  className="w-full"
                  variant="default"
                >
                  {downloadAllMarksheet.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download All Marksheets
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Additional Reports Section */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Reports</CardTitle>
              <CardDescription>
                More export options coming soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium mb-2">PDF Reports</h4>
                  <p className="text-sm text-muted-foreground">
                    Generate PDF formatted marksheets for printing
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" disabled>
                    Coming Soon
                  </Button>
                </div>
                <div className="p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium mb-2">Submission Archives</h4>
                  <p className="text-sm text-muted-foreground">
                    Download all submissions as ZIP archives
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" disabled>
                    Coming Soon
                  </Button>
                </div>
                <div className="p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium mb-2">Analytics Export</h4>
                  <p className="text-sm text-muted-foreground">
                    Export detailed analytics and statistics
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
