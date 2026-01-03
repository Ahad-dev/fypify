'use client';

import * as React from 'react';
import { RoleGuard } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Users, 
  Save,
  RefreshCw,
  Calendar,
  FileText,
  Eye,
  Award,
  Upload,
  UserPlus,
} from 'lucide-react';
import { useSystemSettingsContext, SETTING_KEYS } from '@/contexts';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { 
    settings, 
    isLoading, 
    settingsMap, 
    updateSetting, 
    isUpdating,
  } = useSystemSettingsContext();

  // Local state for controlled inputs
  const [localSettings, setLocalSettings] = React.useState<Record<string, any>>({});

  // Sync local state with context when settings change
  React.useEffect(() => {
    if (settings) {
      const parsed: Record<string, any> = {};
      settings.forEach((setting) => {
        const value = setting.value?.value ?? setting.value;
        parsed[setting.key] = value;
      });
      setLocalSettings(parsed);
    }
  }, [settings]);

  // Get local setting value
  const getLocalSetting = <T,>(key: string, defaultValue: T): T => {
    return localSettings[key] ?? defaultValue;
  };

  // Update local setting
  const updateLocalSetting = (key: string, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Save a single setting to backend
  const saveSetting = async (key: string, value: any) => {
    try {
      await updateSetting(key, value);
    } catch (error) {
      // Error handled by context
    }
  };

  // Save group size settings together
  const saveGroupSizeSettings = async () => {
    const minSize = getLocalSetting(SETTING_KEYS.GROUP_MIN_SIZE, 2);
    const maxSize = getLocalSetting(SETTING_KEYS.GROUP_MAX_SIZE, 4);

    if (minSize > maxSize) {
      toast.error('Minimum size cannot be greater than maximum size');
      return;
    }

    await Promise.all([
      saveSetting(SETTING_KEYS.GROUP_MIN_SIZE, minSize),
      saveSetting(SETTING_KEYS.GROUP_MAX_SIZE, maxSize),
    ]);
  };

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={['ADMIN']}>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </MainLayout>
      </RoleGuard>
    );
  }

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
              <CardContent className="space-y-6">
                {/* Min Size */}
                <div className="space-y-3">
                  <Label>Minimum Group Size</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[getLocalSetting(SETTING_KEYS.GROUP_MIN_SIZE, 2)]}
                      onValueChange={(value) => updateLocalSetting(SETTING_KEYS.GROUP_MIN_SIZE, value[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={getLocalSetting(SETTING_KEYS.GROUP_MIN_SIZE, 2)}
                      onChange={(e) => updateLocalSetting(SETTING_KEYS.GROUP_MIN_SIZE, parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Groups must have at least this many students</p>
                </div>

                {/* Max Size */}
                <div className="space-y-3">
                  <Label>Maximum Group Size</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[getLocalSetting(SETTING_KEYS.GROUP_MAX_SIZE, 4)]}
                      onValueChange={(value) => updateLocalSetting(SETTING_KEYS.GROUP_MAX_SIZE, value[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={getLocalSetting(SETTING_KEYS.GROUP_MAX_SIZE, 4)}
                      onChange={(e) => updateLocalSetting(SETTING_KEYS.GROUP_MAX_SIZE, parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Groups cannot exceed this many students</p>
                </div>

                {/* Preview */}
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                  <p className="font-medium">
                    Groups must have between{' '}
                    <span className="text-blue-600">{getLocalSetting(SETTING_KEYS.GROUP_MIN_SIZE, 2)}</span> and{' '}
                    <span className="text-blue-600">{getLocalSetting(SETTING_KEYS.GROUP_MAX_SIZE, 4)}</span> students
                  </p>
                </div>

                <Button
                  onClick={saveGroupSizeSettings}
                  disabled={isUpdating}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isUpdating ? 'Saving...' : 'Save Group Size Settings'}
                </Button>
              </CardContent>
            </Card>

            {/* Semester Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  Semester Settings
                </CardTitle>
                <CardDescription>
                  Configure the current academic semester
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="semester">Current Semester</Label>
                  <div className="flex gap-2">
                    <Input
                      id="semester"
                      value={getLocalSetting(SETTING_KEYS.CURRENT_SEMESTER, 'Fall 2025')}
                      onChange={(e) => updateLocalSetting(SETTING_KEYS.CURRENT_SEMESTER, e.target.value)}
                      placeholder="e.g., Fall 2025"
                      className="flex-1"
                    />
                    <Button
                      onClick={() => saveSetting(SETTING_KEYS.CURRENT_SEMESTER, getLocalSetting(SETTING_KEYS.CURRENT_SEMESTER, 'Fall 2025'))}
                      disabled={isUpdating}
                      size="icon"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">This appears in reports and dashboards</p>
                </div>
              </CardContent>
            </Card>

            {/* Registration & Access Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-green-500" />
                  Registration & Access
                </CardTitle>
                <CardDescription>
                  Control user registration and system access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Allow Student Registration */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Allow Student Registration
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Enable or disable new student registrations
                    </p>
                  </div>
                  <Switch
                    checked={getLocalSetting(SETTING_KEYS.ALLOW_STUDENT_REGISTRATION, true)}
                    onCheckedChange={(checked) => {
                      updateLocalSetting(SETTING_KEYS.ALLOW_STUDENT_REGISTRATION, checked);
                      saveSetting(SETTING_KEYS.ALLOW_STUDENT_REGISTRATION, checked);
                    }}
                  />
                </div>

                <Separator />

                {/* Submission Enabled */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Allow Submissions
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Enable or disable document submissions
                    </p>
                  </div>
                  <Switch
                    checked={getLocalSetting(SETTING_KEYS.SUBMISSION_ENABLED, true)}
                    onCheckedChange={(checked) => {
                      updateLocalSetting(SETTING_KEYS.SUBMISSION_ENABLED, checked);
                      saveSetting(SETTING_KEYS.SUBMISSION_ENABLED, checked);
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Visibility Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-amber-500" />
                  Visibility Settings
                </CardTitle>
                <CardDescription>
                  Control what students can see
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Proposals Visible */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Proposals Visible
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Show approved project proposals to students
                    </p>
                  </div>
                  <Switch
                    checked={getLocalSetting(SETTING_KEYS.PROPOSALS_VISIBLE, true)}
                    onCheckedChange={(checked) => {
                      updateLocalSetting(SETTING_KEYS.PROPOSALS_VISIBLE, checked);
                      saveSetting(SETTING_KEYS.PROPOSALS_VISIBLE, checked);
                    }}
                  />
                </div>

                <Separator />

                {/* Results Released */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Results Released
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Make final results visible to students
                    </p>
                  </div>
                  <Switch
                    checked={getLocalSetting(SETTING_KEYS.RESULTS_RELEASED, false)}
                    onCheckedChange={(checked) => {
                      updateLocalSetting(SETTING_KEYS.RESULTS_RELEASED, checked);
                      saveSetting(SETTING_KEYS.RESULTS_RELEASED, checked);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
