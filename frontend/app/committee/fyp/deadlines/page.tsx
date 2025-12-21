'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO, addDays, isBefore } from 'date-fns';
import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  Loader2,
  Trash2,
  Eye,
  Power,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  useDeadlineBatches,
  useCreateDeadlineBatch,
  useDeactivateDeadlineBatch,
} from '@/shared/hooks';
import { useActiveDocumentTypes } from '@/shared/hooks/useAdmin';
import { DeadlineBatch, CreateDeadlineBatchRequest } from '@/shared/types';

// ============ Form Schema ============

const deadlineItemSchema = z.object({
  documentTypeId: z.string().min(1, 'Select a document type'),
  deadlineDate: z.date({ message: 'Select a deadline date' }),
});

const createBatchFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  appliesFrom: z.date({ message: 'Select a start date' }),
  appliesUntil: z.date().optional(),
  deadlines: z.array(deadlineItemSchema).min(1, 'Add at least one deadline'),
});

type CreateBatchFormData = z.infer<typeof createBatchFormSchema>;

// ============ Main Component ============

export default function DeadlineBatchesPage() {
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = React.useState(false);
  const [selectedBatch, setSelectedBatch] = React.useState<DeadlineBatch | null>(null);

  // Data fetching
  const { data: batchesData, isLoading: batchesLoading } = useDeadlineBatches();
  const { data: documentTypes, isLoading: docTypesLoading } = useActiveDocumentTypes();

  // Mutations
  const createBatch = useCreateDeadlineBatch();
  const deactivateBatch = useDeactivateDeadlineBatch();

  const batches = batchesData?.content ?? [];
  const activeBatches = batches.filter((b) => b.isActive);
  const inactiveBatches = batches.filter((b) => !b.isActive);

  // Form
  const form = useForm<CreateBatchFormData>({
    resolver: zodResolver(createBatchFormSchema),
    defaultValues: {
      name: '',
      description: '',
      deadlines: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'deadlines',
  });

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!createDialogOpen) {
      form.reset();
    }
  }, [createDialogOpen, form]);

  // Handlers
  const handleCreateBatch = async (data: CreateBatchFormData) => {
    const request: CreateDeadlineBatchRequest = {
      name: data.name,
      description: data.description || undefined,
      appliesFrom: data.appliesFrom.toISOString(),
      appliesUntil: data.appliesUntil?.toISOString(),
      deadlines: data.deadlines.map((d) => ({
        documentTypeId: d.documentTypeId,
        deadlineDate: d.deadlineDate.toISOString(),
      })),
    };

    await createBatch.mutateAsync(request);
    setCreateDialogOpen(false);
  };

  const handleViewBatch = (batch: DeadlineBatch) => {
    setSelectedBatch(batch);
    setViewDialogOpen(true);
  };

  const handleDeactivateClick = (batch: DeadlineBatch) => {
    setSelectedBatch(batch);
    setDeactivateDialogOpen(true);
  };

  const handleDeactivateConfirm = async () => {
    if (!selectedBatch) return;
    await deactivateBatch.mutateAsync(selectedBatch.id);
    setDeactivateDialogOpen(false);
    setSelectedBatch(null);
  };

  const handleAddDeadline = () => {
    append({ documentTypeId: '', deadlineDate: addDays(new Date(), 30) });
  };

  // Get already selected document types
  const selectedDocTypeIds = fields.map((f) => f.documentTypeId);

  // Table columns
  const columns: ColumnDef<DeadlineBatch>[] = [
    {
      accessorKey: 'name',
      header: 'Batch Name',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      accessorKey: 'appliesFrom',
      header: 'Applies From',
      cell: ({ row }) => format(parseISO(row.original.appliesFrom), 'MMM d, yyyy'),
    },
    {
      accessorKey: 'appliesUntil',
      header: 'Applies Until',
      cell: ({ row }) =>
        row.original.appliesUntil
          ? format(parseISO(row.original.appliesUntil), 'MMM d, yyyy')
          : 'No end date',
    },
    {
      accessorKey: 'deadlines',
      header: 'Deadlines',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.deadlines?.length || 0} deadlines</Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleViewBatch(row.original)}>
            <Eye className="h-4 w-4" />
          </Button>
          {row.original.isActive && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => handleDeactivateClick(row.original)}
            >
              <Power className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <RoleGuard allowedRoles={['FYP_COMMITTEE', 'ADMIN']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/committee/fyp/dashboard">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Deadline Batches</h1>
                <p className="text-muted-foreground text-sm">
                  Manage document submission deadlines for approved projects
                </p>
              </div>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Batch
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Deadline Batch</DialogTitle>
                  <DialogDescription>
                    Create a new deadline batch with document submission deadlines.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateBatch)} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Batch Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Spring 2025 Deadlines" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe when these deadlines apply..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="appliesFrom"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Applies From</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        'w-full pl-3 text-left font-normal',
                                        !field.value && 'text-muted-foreground'
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, 'PPP')
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="appliesUntil"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Applies Until (Optional)</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        'w-full pl-3 text-left font-normal',
                                        !field.value && 'text-muted-foreground'
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, 'PPP')
                                      ) : (
                                        <span>No end date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Deadlines */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Document Deadlines</h4>
                          <p className="text-sm text-muted-foreground">
                            Set submission deadlines for each document type
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddDeadline}
                          disabled={
                            docTypesLoading ||
                            fields.length >= (documentTypes?.length || 0)
                          }
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Deadline
                        </Button>
                      </div>

                      {fields.length === 0 && (
                        <div className="rounded-lg border border-dashed p-6 text-center">
                          <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            No deadlines added yet. Click &quot;Add Deadline&quot; to get started.
                          </p>
                        </div>
                      )}

                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex items-end gap-3 p-4 rounded-lg border bg-muted/30"
                        >
                          <FormField
                            control={form.control}
                            name={`deadlines.${index}.documentTypeId`}
                            render={({ field: selectField }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Document Type</FormLabel>
                                <Select
                                  onValueChange={selectField.onChange}
                                  value={selectField.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select document type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {documentTypes?.map((docType) => (
                                      <SelectItem
                                        key={docType.id}
                                        value={docType.id}
                                        disabled={
                                          selectedDocTypeIds.includes(docType.id) &&
                                          selectField.value !== docType.id
                                        }
                                      >
                                        {docType.title}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`deadlines.${index}.deadlineDate`}
                            render={({ field: dateField }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Deadline Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          'w-full pl-3 text-left font-normal',
                                          !dateField.value && 'text-muted-foreground'
                                        )}
                                      >
                                        {dateField.value ? (
                                          format(dateField.value, 'PPP')
                                        ) : (
                                          <span>Pick date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={dateField.value}
                                      onSelect={dateField.onChange}
                                      disabled={(date) => isBefore(date, new Date())}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      {form.formState.errors.deadlines?.message && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.deadlines.message}
                        </p>
                      )}
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createBatch.isPending}>
                        {createBatch.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create Batch
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-950 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Batches</p>
                    <div className="text-2xl font-bold">
                      {batchesLoading ? <Skeleton className="h-8 w-12" /> : activeBatches.length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <XCircle className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Inactive Batches</p>
                    <div className="text-2xl font-bold">
                      {batchesLoading ? <Skeleton className="h-8 w-12" /> : inactiveBatches.length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Document Types</p>
                    <div className="text-2xl font-bold">
                      {docTypesLoading ? (
                        <Skeleton className="h-8 w-12" />
                      ) : (
                        documentTypes?.length || 0
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Batches Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Deadline Batches</CardTitle>
              <CardDescription>
                View and manage deadline batches for project document submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {batchesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : batches.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No deadline batches</h3>
                  <p className="text-muted-foreground">
                    Create your first deadline batch to set document submission deadlines.
                  </p>
                  <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Batch
                  </Button>
                </div>
              ) : (
                <DataTable columns={columns} data={batches} searchColumn="name" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* View Batch Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedBatch?.name}</DialogTitle>
              <DialogDescription>
                {selectedBatch?.description || 'No description provided'}
              </DialogDescription>
            </DialogHeader>
            {selectedBatch && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={selectedBatch.isActive ? 'default' : 'secondary'}>
                    {selectedBatch.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Applies From</span>
                  <span className="font-medium">
                    {format(parseISO(selectedBatch.appliesFrom), 'MMMM d, yyyy')}
                  </span>
                </div>
                {selectedBatch.appliesUntil && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Applies Until</span>
                    <span className="font-medium">
                      {format(parseISO(selectedBatch.appliesUntil), 'MMMM d, yyyy')}
                    </span>
                  </div>
                )}

                {selectedBatch.deadlines && selectedBatch.deadlines.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Document Deadlines</h4>
                    <div className="space-y-2">
                      {selectedBatch.deadlines
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((deadline) => (
                          <div
                            key={deadline.id}
                            className={cn(
                              'flex items-center justify-between p-3 rounded-lg border',
                              deadline.isPast && 'bg-red-50 dark:bg-red-950/20 border-red-200',
                              deadline.isApproaching &&
                                !deadline.isPast &&
                                'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200'
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{deadline.documentTypeName}</span>
                              {deadline.isPast && (
                                <Badge variant="destructive" className="text-xs">
                                  Past
                                </Badge>
                              )}
                              {deadline.isApproaching && !deadline.isPast && (
                                <Badge variant="secondary" className="text-xs bg-yellow-100">
                                  Approaching
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm">
                              {format(parseISO(deadline.deadlineDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
              {selectedBatch?.isActive && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleDeactivateClick(selectedBatch);
                  }}
                >
                  <Power className="mr-2 h-4 w-4" />
                  Deactivate
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Deactivate Confirmation Dialog */}
        <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate Deadline Batch?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to deactivate &quot;{selectedBatch?.name}&quot;? This batch
                will no longer be assigned to new projects, but existing projects will keep their
                deadlines.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeactivateConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deactivateBatch.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Power className="mr-2 h-4 w-4" />
                )}
                Deactivate
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </MainLayout>
    </RoleGuard>
  );
}
