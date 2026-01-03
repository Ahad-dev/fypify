'use client';

import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/shared/services';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { SystemSetting, UpdateSystemSettingRequest } from '@/shared/types';
import { toast } from 'sonner';

// Setting key constants matching backend
export const SETTING_KEYS = {
  GROUP_MIN_SIZE: 'group_min_size',
  GROUP_MAX_SIZE: 'group_max_size',
  CURRENT_SEMESTER: 'current_semester',
  ALLOW_STUDENT_REGISTRATION: 'allow_student_registration',
  SUBMISSION_ENABLED: 'submission_enabled',
  PROPOSALS_VISIBLE: 'proposals_visible',
  RESULTS_RELEASED: 'results_released',
} as const;

export type SettingKey = typeof SETTING_KEYS[keyof typeof SETTING_KEYS];

interface SystemSettingsContextType {
  // Raw settings data
  settings: SystemSetting[] | undefined;
  isLoading: boolean;
  isError: boolean;
  
  // Parsed settings map for quick access
  settingsMap: Record<string, any>;
  
  // Helper functions to get typed values
  getSetting: <T>(key: string, defaultValue: T) => T;
  getGroupMinSize: () => number;
  getGroupMaxSize: () => number;
  getCurrentSemester: () => string;
  isStudentRegistrationAllowed: () => boolean;
  isSubmissionEnabled: () => boolean;
  areProposalsVisible: () => boolean;
  areResultsReleased: () => boolean;
  
  // Mutation
  updateSetting: (key: string, value: any) => Promise<void>;
  isUpdating: boolean;
  
  // Refetch
  refetch: () => void;
}

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

export function SystemSettingsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Query for fetching settings
  const {
    data: settings,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.admin.settings.list(),
    queryFn: adminService.getSystemSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
  });

  // Mutation for updating settings
  const updateMutation = useMutation({
    mutationFn: (data: UpdateSystemSettingRequest) => adminService.updateSystemSetting(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.settings.all() });
      toast.success('Setting updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update setting');
    },
  });

  // Parse settings into a map for quick access
  const settingsMap = useMemo(() => {
    const map: Record<string, any> = {};
    if (settings) {
      settings.forEach((setting) => {
        // Extract value from {"value": X} format if present
        const value = setting.value?.value ?? setting.value;
        map[setting.key] = value;
      });
    }
    return map;
  }, [settings]);

  // Generic getter with default
  const getSetting = useCallback(<T,>(key: string, defaultValue: T): T => {
    return settingsMap[key] ?? defaultValue;
  }, [settingsMap]);

  // Typed getters for common settings
  const getGroupMinSize = useCallback(() => getSetting(SETTING_KEYS.GROUP_MIN_SIZE, 2), [getSetting]);
  const getGroupMaxSize = useCallback(() => getSetting(SETTING_KEYS.GROUP_MAX_SIZE, 4), [getSetting]);
  const getCurrentSemester = useCallback(() => getSetting(SETTING_KEYS.CURRENT_SEMESTER, 'Unknown'), [getSetting]);
  const isStudentRegistrationAllowed = useCallback(() => getSetting(SETTING_KEYS.ALLOW_STUDENT_REGISTRATION, true), [getSetting]);
  const isSubmissionEnabled = useCallback(() => getSetting(SETTING_KEYS.SUBMISSION_ENABLED, true), [getSetting]);
  const areProposalsVisible = useCallback(() => getSetting(SETTING_KEYS.PROPOSALS_VISIBLE, true), [getSetting]);
  const areResultsReleased = useCallback(() => getSetting(SETTING_KEYS.RESULTS_RELEASED, false), [getSetting]);

  // Update function that wraps the mutation
  const updateSetting = useCallback(async (key: string, value: any) => {
    await updateMutation.mutateAsync({ key, value: { value } });
  }, [updateMutation]);

  const contextValue: SystemSettingsContextType = useMemo(() => ({
    settings,
    isLoading,
    isError,
    settingsMap,
    getSetting,
    getGroupMinSize,
    getGroupMaxSize,
    getCurrentSemester,
    isStudentRegistrationAllowed,
    isSubmissionEnabled,
    areProposalsVisible,
    areResultsReleased,
    updateSetting,
    isUpdating: updateMutation.isPending,
    refetch,
  }), [
    settings,
    isLoading,
    isError,
    settingsMap,
    getSetting,
    getGroupMinSize,
    getGroupMaxSize,
    getCurrentSemester,
    isStudentRegistrationAllowed,
    isSubmissionEnabled,
    areProposalsVisible,
    areResultsReleased,
    updateSetting,
    updateMutation.isPending,
    refetch,
  ]);

  return (
    <SystemSettingsContext.Provider value={contextValue}>
      {children}
    </SystemSettingsContext.Provider>
  );
}

/**
 * Hook to access system settings context.
 * Must be used within a SystemSettingsProvider.
 */
export function useSystemSettingsContext() {
  const context = useContext(SystemSettingsContext);
  if (context === undefined) {
    throw new Error('useSystemSettingsContext must be used within a SystemSettingsProvider');
  }
  return context;
}

/**
 * Optional hook that returns undefined if not in provider (for components that may be outside provider)
 */
export function useSystemSettingsContextOptional() {
  return useContext(SystemSettingsContext);
}
