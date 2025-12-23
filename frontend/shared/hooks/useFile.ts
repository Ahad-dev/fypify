import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fileService } from '@/shared/services';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { toast } from 'sonner';
import { useState, useCallback } from 'react';

// ============ File Queries ============

/**
 * Hook to get file metadata by ID
 */
export function useFile(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.files.detail(id),
    queryFn: () => fileService.getFileById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // Files don't change often
  });
}

// ============ File Mutations ============

/**
 * Hook to upload a file with progress tracking
 * Returns upload progress state and mutation
 */
export function useUploadFile() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const resetProgress = useCallback(() => {
    setProgress(0);
    setIsUploading(false);
  }, []);

  const mutation = useMutation({
    mutationFn: async ({ file, folder }: { file: File; folder?: string }) => {
      setIsUploading(true);
      setProgress(0);
      return fileService.uploadFile(file, folder, setProgress);
    },
    onSuccess: (uploadedFile) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.files.all });
      toast.success(`File "${uploadedFile.fileName}" uploaded successfully!`);
      // Don't reset immediately - let the component handle it
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || 'Failed to upload file';
      toast.error(message);
      resetProgress();
    },
    onSettled: () => {
      // Reset uploading state but keep progress for UI feedback
      setIsUploading(false);
    },
  });

  return {
    ...mutation,
    progress,
    isUploading,
    resetProgress,
  };
}

/**
 * Hook to delete a file
 */
export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fileService.deleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.files.all });
      toast.success('File deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || 'Failed to delete file';
      toast.error(message);
    },
  });
}

// ============ File Validation Utilities ============

export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[]; // MIME types or extensions
  allowedExtensions?: string[];
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate a file before upload
 */
export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): FileValidationResult {
  const { maxSize = 50 * 1024 * 1024, allowedTypes, allowedExtensions } = options;

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      isValid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Check MIME type
  if (allowedTypes && allowedTypes.length > 0) {
    const isTypeAllowed = allowedTypes.some((type) => {
      if (type.endsWith('/*')) {
        // Wildcard type like 'image/*'
        const prefix = type.replace('/*', '');
        return file.type.startsWith(prefix);
      }
      return file.type === type;
    });

    if (!isTypeAllowed) {
      return {
        isValid: false,
        error: `File type "${file.type}" is not allowed`,
      };
    }
  }

  // Check file extension
  if (allowedExtensions && allowedExtensions.length > 0) {
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const isExtensionAllowed = allowedExtensions.some(
      (ext) => ext.toLowerCase().replace('.', '') === fileExtension
    );

    if (!isExtensionAllowed) {
      return {
        isValid: false,
        error: `File extension ".${fileExtension}" is not allowed. Allowed: ${allowedExtensions.join(', ')}`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

