'use client';

import * as React from 'react';
import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Users, 
  Plus, 
  MoreHorizontal, 
  Trash2, 
  UserPlus,
  Shield,
  ClipboardCheck,
} from 'lucide-react';
import {
  useFypCommitteeMembers,
  useAddFypCommitteeMember,
  useRemoveFypCommitteeMember,
  useEvalCommitteeMembers,
  useAddEvalCommitteeMember,
  useRemoveEvalCommitteeMember,
  useUsersByRole,
} from '@/shared/hooks';
import { CommitteeMember } from '@/shared/services/admin.service';
import { format } from 'date-fns';

export default function CommitteesPage() {
  const [addFypDialogOpen, setAddFypDialogOpen] = React.useState(false);
  const [addEvalDialogOpen, setAddEvalDialogOpen] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState<string>('');

  // FYP Committee
  const { data: fypMembers, isLoading: fypLoading } = useFypCommitteeMembers();
  const addFypMember = useAddFypCommitteeMember();
  const removeFypMember = useRemoveFypCommitteeMember();

  // Eval Committee
  const { data: evalMembers, isLoading: evalLoading } = useEvalCommitteeMembers();
  const addEvalMember = useAddEvalCommitteeMember();
  const removeEvalMember = useRemoveEvalCommitteeMember();

  // Users by roles that can be committee members
  const { data: supervisors } = useUsersByRole('SUPERVISOR');
  const { data: admins } = useUsersByRole('ADMIN');
  const eligibleUsers = React.useMemo(() => {
    const all = [...(supervisors || []), ...(admins || [])];
    return all.filter((user, index, self) => 
      index === self.findIndex(u => u.id === user.id)
    );
  }, [supervisors, admins]);

  // Filter available users (not already in committee)
  const availableForFyp = React.useMemo(() => {
    const memberIds = new Set(fypMembers?.map(m => m.userId) || []);
    return eligibleUsers.filter(u => !memberIds.has(u.id));
  }, [eligibleUsers, fypMembers]);

  const availableForEval = React.useMemo(() => {
    const memberIds = new Set(evalMembers?.map(m => m.userId) || []);
    return eligibleUsers.filter(u => !memberIds.has(u.id));
  }, [eligibleUsers, evalMembers]);

  const handleAddFypMember = async () => {
    if (!selectedUserId) return;
    await addFypMember.mutateAsync(selectedUserId);
    setAddFypDialogOpen(false);
    setSelectedUserId('');
  };

  const handleAddEvalMember = async () => {
    if (!selectedUserId) return;
    await addEvalMember.mutateAsync(selectedUserId);
    setAddEvalDialogOpen(false);
    setSelectedUserId('');
  };

  const handleRemoveFypMember = async (member: CommitteeMember) => {
    if (confirm(`Remove ${member.fullName} from FYP Committee?`)) {
      await removeFypMember.mutateAsync(member.userId);
    }
  };

  const handleRemoveEvalMember = async (member: CommitteeMember) => {
    if (confirm(`Remove ${member.fullName} from Evaluation Committee?`)) {
      await removeEvalMember.mutateAsync(member.userId);
    }
  };

  const columns: ColumnDef<CommitteeMember>[] = [
    {
      accessorKey: 'fullName',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('fullName')}</div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.getValue('email')}</span>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('role')}</Badge>
      ),
    },
    {
      accessorKey: 'addedAt',
      header: 'Added',
      cell: ({ row }) => {
        const date = row.getValue('addedAt') as string;
        return date ? format(new Date(date), 'MMM d, yyyy') : '-';
      },
    },
  ];

  const fypColumns: ColumnDef<CommitteeMember>[] = [
    ...columns,
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleRemoveFypMember(row.original)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const evalColumns: ColumnDef<CommitteeMember>[] = [
    ...columns,
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleRemoveEvalMember(row.original)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Committee Management</h1>
              <p className="text-muted-foreground text-sm">
                Manage FYP and Evaluation Committee members
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="fyp" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="fyp" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                FYP Committee
              </TabsTrigger>
              <TabsTrigger value="eval" className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Eval Committee
              </TabsTrigger>
            </TabsList>

            {/* FYP Committee Tab */}
            <TabsContent value="fyp" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-purple-500" />
                      FYP Committee Members
                    </CardTitle>
                    <CardDescription>
                      Members responsible for project approvals and oversight
                    </CardDescription>
                  </div>
                  <Dialog open={addFypDialogOpen} onOpenChange={setAddFypDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add FYP Committee Member</DialogTitle>
                        <DialogDescription>
                          Select a supervisor or admin to add to the FYP Committee
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Select
                          value={selectedUserId}
                          onValueChange={setSelectedUserId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a user" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableForFyp.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.fullName} ({user.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex justify-end gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setAddFypDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddFypMember}
                            disabled={!selectedUserId || addFypMember.isPending}
                          >
                            {addFypMember.isPending ? 'Adding...' : 'Add Member'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={fypColumns}
                    data={fypMembers ?? []}
                    isLoading={fypLoading}
                    searchPlaceholder="Search members..."
                    searchColumn="fullName"
                    emptyMessage="No FYP Committee members found."
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Eval Committee Tab */}
            <TabsContent value="eval" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardCheck className="h-5 w-5 text-green-500" />
                      Evaluation Committee Members
                    </CardTitle>
                    <CardDescription>
                      Members responsible for evaluating and marking submissions
                    </CardDescription>
                  </div>
                  <Dialog open={addEvalDialogOpen} onOpenChange={setAddEvalDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Evaluation Committee Member</DialogTitle>
                        <DialogDescription>
                          Select a supervisor or admin to add to the Evaluation Committee
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Select
                          value={selectedUserId}
                          onValueChange={setSelectedUserId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a user" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableForEval.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.fullName} ({user.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex justify-end gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setAddEvalDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddEvalMember}
                            disabled={!selectedUserId || addEvalMember.isPending}
                          >
                            {addEvalMember.isPending ? 'Adding...' : 'Add Member'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={evalColumns}
                    data={evalMembers ?? []}
                    isLoading={evalLoading}
                    searchPlaceholder="Search members..."
                    searchColumn="fullName"
                    emptyMessage="No Evaluation Committee members found."
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
