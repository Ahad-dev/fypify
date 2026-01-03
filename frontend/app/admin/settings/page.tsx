'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Users, 
  Save,
  RefreshCw,
} from 'lucide-react';
import {
  useGroupSizeSettings,
  useUpdateGroupSizeSettings,
  useSystemSettings,
} from '@/shared/hooks';

const groupSizeSchema = z.object({
  minSize: z.number().min(1, 'Minimum must be at least 1').max(10),
  maxSize: z.number().min(1).max(10),
}).refine((data) => data.minSize <= data.maxSize, {
  message: 'Minimum size cannot exceed maximum size',
  path: ['minSize'],
});

type GroupSizeFormData = z.infer<typeof groupSizeSchema>;

export default function SettingsPage() {
  const { data: groupSizeSettings, isLoading: groupSizeLoading } = useGroupSizeSettings();
  const updateGroupSize = useUpdateGroupSizeSettings();
  const { data: systemSettings, isLoading: systemSettingsLoading } = useSystemSettings();

  const form = useForm<GroupSizeFormData>({
    resolver: zodResolver(groupSizeSchema),
    defaultValues: {
      minSize: 2,
      maxSize: 4,
    },
  });

  // Update form when data loads
  React.useEffect(() => {
    if (groupSizeSettings) {
      form.reset({
        minSize: groupSizeSettings.minSize,
        maxSize: groupSizeSettings.maxSize,
      });
    }
  }, [groupSizeSettings, form]);

  const watchMinSize = form.watch('minSize');
  const watchMaxSize = form.watch('maxSize');

  const handleSubmit = async (data: GroupSizeFormData) => {
    await updateGroupSize.mutateAsync(data);
  };

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-slate-500 to-slate-700 rounded-xl shadow-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">System Settings</h1>
              <p className="text-muted-foreground text-sm">
                Configure FYPify system settings
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Group Size Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Group Size Settings
                </CardTitle>
                <CardDescription>
                  Configure the minimum and maximum number of students per group
                </CardDescription>
              </CardHeader>
              <CardContent>
                {groupSizeLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="minSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Group Size</FormLabel>
                            <div className="flex items-center gap-4">
                              <FormControl>
                                <Slider
                                  min={1}
                                  max={10}
                                  step={1}
                                  value={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  className="flex-1"
                                />
                              </FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={10}
                                value={field.value}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                className="w-20"
                              />
                            </div>
                            <FormDescription>
                              Groups must have at least this many students
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Group Size</FormLabel>
                            <div className="flex items-center gap-4">
                              <FormControl>
                                <Slider
                                  min={1}
                                  max={10}
                                  step={1}
                                  value={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  className="flex-1"
                                />
                              </FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={10}
                                value={field.value}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                className="w-20"
                              />
                            </div>
                            <FormDescription>
                              Groups cannot exceed this many students
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Preview */}
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                        <p className="font-medium">
                          Groups must have between{' '}
                          <span className="text-blue-600">{watchMinSize}</span> and{' '}
                          <span className="text-blue-600">{watchMaxSize}</span> students
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={updateGroupSize.isPending}
                        className="w-full"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {updateGroupSize.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>

            {/* Other System Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-slate-500" />
                  Other Settings
                </CardTitle>
                <CardDescription>
                  Current system configuration values
                </CardDescription>
              </CardHeader>
              <CardContent>
                {systemSettingsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {systemSettings?.map((setting) => (
                      <div key={setting.key} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium text-sm">{setting.key}</p>
                          <p className="text-xs text-muted-foreground">
                            Updated: {setting.updatedAt ? new Date(setting.updatedAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          {JSON.stringify(setting.value)}
                        </code>
                      </div>
                    ))}
                    {(!systemSettings || systemSettings.length === 0) && (
                      <p className="text-muted-foreground text-center py-4">
                        No system settings found
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
