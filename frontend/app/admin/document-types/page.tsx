'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  FileText,
  Scale,
  AlertTriangle,
} from 'lucide-react';
import {
  useDocumentTypes,
  useCreateDocumentType,
  useUpdateDocumentType,
  useDeleteDocumentType,
} from '@/shared/hooks';
import { DocumentType, CreateDocumentTypeRequest, UpdateDocumentTypeRequest } from '@/shared/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Validation: weights must sum to 100
const createDocumentTypeSchema = z.object({
  code: z.string()
    .min(2, 'Code must be at least 2 characters')
    .max(50, 'Code must be at most 50 characters')
    .regex(/^[A-Z][A-Z0-9_]*$/, 'Code must start with uppercase letter, contain only uppercase letters, numbers, and underscores'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  weightSupervisor: z.number().min(0).max(100),
  weightCommittee: z.number().min(0).max(100),
  displayOrder: z.number().min(0).optional(),
}).refine((data) => data.weightSupervisor + data.weightCommittee === 100, {
  message: 'Weights must sum to 100',
  path: ['weightSupervisor'],
});

const updateDocumentTypeSchema = z.object({
  code: z.string()
    .min(2, 'Code must be at least 2 characters')
    .max(50, 'Code must be at most 50 characters')
    .regex(/^[A-Z][A-Z0-9_]*$/, 'Code must be uppercase')
    .optional(),
  title: z.string().min(2, 'Title must be at least 2 characters').optional(),
  description: z.string().optional(),
  weightSupervisor: z.number().min(0).max(100).optional(),
  weightCommittee: z.number().min(0).max(100).optional(),
  displayOrder: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
}).refine((data) => {
  if (data.weightSupervisor !== undefined && data.weightCommittee !== undefined) {
    return data.weightSupervisor + data.weightCommittee === 100;
  }
  return true;
}, {
  message: 'Weights must sum to 100',
  path: ['weightSupervisor'],
});

type CreateFormData = z.infer<typeof createDocumentTypeSchema>;
type UpdateFormData = z.infer<typeof updateDocumentTypeSchema>;

export default function DocumentTypesPage() {
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedDocType, setSelectedDocType] = React.useState<DocumentType | null>(null);

  const { data: documentTypes, isLoading } = useDocumentTypes();
  const createDocType = useCreateDocumentType();
  const updateDocType = useUpdateDocumentType();
  const deleteDocType = useDeleteDocumentType();

  // Create form
  const createForm = useForm<CreateFormData>({
    resolver: zodResolver(createDocumentTypeSchema),
    defaultValues: {
      code: '',
      title: '',
      description: '',
      weightSupervisor: 50,
      weightCommittee: 50,
      displayOrder: 0,
    },
  });

  // Update form
  const updateForm = useForm<UpdateFormData>({
    resolver: zodResolver(updateDocumentTypeSchema),
  });

  // Watch weights for live validation feedback
  const createWeightSupervisor = createForm.watch('weightSupervisor');
  const createWeightCommittee = createForm.watch('weightCommittee');
  const updateWeightSupervisor = updateForm.watch('weightSupervisor');
  const updateWeightCommittee = updateForm.watch('weightCommittee');

  // Reset edit form when document type changes
  React.useEffect(() => {
    if (selectedDocType) {
      updateForm.reset({
        code: selectedDocType.code,
        title: selectedDocType.title,
        description: selectedDocType.description || '',
        weightSupervisor: selectedDocType.weightSupervisor,
        weightCommittee: selectedDocType.weightCommittee,
        displayOrder: selectedDocType.displayOrder,
        isActive: selectedDocType.isActive,
      });
    }
  }, [selectedDocType, updateForm]);

  const handleCreateDocType = async (data: CreateFormData) => {
    await createDocType.mutateAsync(data as CreateDocumentTypeRequest);
    setCreateDialogOpen(false);
    createForm.reset();
  };

  const handleUpdateDocType = async (data: UpdateFormData) => {
    if (!selectedDocType) return;
    await updateDocType.mutateAsync({ id: selectedDocType.id, data: data as UpdateDocumentTypeRequest });
    setEditDialogOpen(false);
    setSelectedDocType(null);
  };

  const handleDeleteDocType = async (docType: DocumentType) => {
    if (confirm(`Are you sure you want to delete "${docType.title}"?`)) {
      await deleteDocType.mutateAsync(docType.id);
    }
  };

  const columns: ColumnDef<DocumentType>[] = [
    {
      accessorKey: 'displayOrder',
      header: '#',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.getValue('displayOrder')}</span>
      ),
    },
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
          {row.getValue('code')}
        </code>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('title')}</div>
      ),
    },
    {
      id: 'weights',
      header: 'Weights',
      cell: ({ row }) => {
        const supervisor = row.original.weightSupervisor;
        const committee = row.original.weightCommittee;
        return (
          <div className="flex items-center gap-2 min-w-[200px]">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Supervisor: {supervisor}%</span>
                <span>Committee: {committee}%</span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500" 
                  style={{ width: `${supervisor}%` }}
                />
                <div 
                  className="bg-green-500" 
                  style={{ width: `${committee}%` }}
                />
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.getValue('isActive') ? 'default' : 'secondary'}>
          {row.getValue('isActive') ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const docType = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedDocType(docType);
                  setEditDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDeleteDocType(docType)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Weight validation indicator component
  const WeightIndicator = ({ supervisor, committee }: { supervisor: number; committee: number }) => {
    const total = supervisor + committee;
    const isValid = total === 100;
    
    return (
      <div className={cn(
        'p-3 rounded-lg border',
        isValid ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
      )}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Scale className={cn('h-4 w-4', isValid ? 'text-green-600' : 'text-red-600')} />
            <span className={cn('text-sm font-medium', isValid ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400')}>
              Total: {total}%
            </span>
          </div>
          {!isValid && (
            <div className="flex items-center gap-1 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs">Must equal 100%</span>
            </div>
          )}
        </div>
        <div className="flex h-2 rounded-full overflow-hidden bg-muted">
          <div 
            className="bg-blue-500 transition-all duration-200" 
            style={{ width: `${Math.min(supervisor, 100)}%` }}
          />
          <div 
            className="bg-green-500 transition-all duration-200" 
            style={{ width: `${Math.min(committee, 100 - supervisor)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Supervisor: {supervisor}%</span>
          <span>Committee: {committee}%</span>
        </div>
      </div>
    );
  };

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Document Types</h1>
                <p className="text-muted-foreground text-sm">
                  Configure FYP document types and evaluation weights
                </p>
              </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Document Type
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Document Type</DialogTitle>
                  <DialogDescription>
                    Add a new document type with evaluation weights. Weights must sum to 100%.
                  </DialogDescription>
                </DialogHeader>
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(handleCreateDocType)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Code</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="PROPOSAL" 
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                              />
                            </FormControl>
                            <FormDescription>Uppercase identifier</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="displayOrder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Order</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={createForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Project Proposal" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Description of this document type..." 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Evaluation Weights</h4>
                      <WeightIndicator 
                        supervisor={createWeightSupervisor || 0} 
                        committee={createWeightCommittee || 0} 
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="weightSupervisor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Supervisor Weight (%)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={0} 
                                  max={100}
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="weightCommittee"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Committee Weight (%)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min={0}
                                  max={100}
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createDocType.isPending || (createWeightSupervisor + createWeightCommittee) !== 100}
                      >
                        {createDocType.isPending ? 'Creating...' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Document Types Table */}
          <DataTable
            columns={columns}
            data={documentTypes ?? []}
            isLoading={isLoading}
            searchPlaceholder="Search document types..."
            searchColumn="title"
            emptyMessage="No document types found."
          />

          {/* Edit Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Document Type</DialogTitle>
                <DialogDescription>
                  Update document type settings. Weights must sum to 100%.
                </DialogDescription>
              </DialogHeader>
              <Form {...updateForm}>
                <form onSubmit={updateForm.handleSubmit(handleUpdateDocType)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={updateForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="PROPOSAL" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={updateForm.control}
                      name="displayOrder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Order</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={updateForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Project Proposal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={updateForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Description of this document type..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Evaluation Weights</h4>
                    <WeightIndicator 
                      supervisor={updateWeightSupervisor ?? selectedDocType?.weightSupervisor ?? 0} 
                      committee={updateWeightCommittee ?? selectedDocType?.weightCommittee ?? 0} 
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={updateForm.control}
                        name="weightSupervisor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supervisor Weight (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={0} 
                                max={100}
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={updateForm.control}
                        name="weightCommittee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Committee Weight (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min={0}
                                max={100}
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <FormField
                    control={updateForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Inactive document types won't be available for submissions
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={updateDocType.isPending}
                    >
                      {updateDocType.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
