import api, { ApiResponse } from '@/shared/api/apiHandler';
import { CloudinaryFile } from '@/shared/types';

const FILE_ENDPOINTS = {
  UPLOAD: '/files/upload',
  FILES: '/files',
} as const;

/**
 * File Service
 * Handles file upload and management API calls
 */
export const fileService = {
  /**
   * Upload a file to Cloudinary
   * Uses multipart/form-data for file upload with progress tracking
   */
  uploadFile: async (
    file: File,
    folder?: string,
    onProgress?: (progress: number) => void
  ): Promise<CloudinaryFile> => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await api.post<ApiResponse<CloudinaryFile>>(
      FILE_ENDPOINTS.UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      }
    );
    return response.data.data;
  },

  /**
   * Get file metadata by ID
   */
  getFileById: async (id: string): Promise<CloudinaryFile> => {
    const response = await api.get<ApiResponse<CloudinaryFile>>(
      `${FILE_ENDPOINTS.FILES}/${id}`
    );
    return response.data.data;
  },

  /**
   * Delete a file
   */
  deleteFile: async (id: string): Promise<void> => {
    await api.delete(`${FILE_ENDPOINTS.FILES}/${id}`);
  },
};

export default fileService;

