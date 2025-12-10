/**
 * Common API Types
 */

// Generic API response wrapper (matches backend ApiResponse)
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// Paginated response
export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// API Error response
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
  path?: string;
  status?: number;
}

// Pagination params
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

// Common filter params
export interface FilterParams extends PaginationParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// Select option type
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

// File upload response
export interface FileUploadResponse {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

// Sort direction
export type SortDirection = 'asc' | 'desc';

// Common status types
export type CommonStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ARCHIVED';
