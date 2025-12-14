import api, { ApiResponse } from '@/shared/api/apiHandler';
import {
  DocumentType,
  CreateDocumentTypeRequest,
  UpdateDocumentTypeRequest,
  AuditLog,
  SystemSetting,
  UpdateSystemSettingRequest,
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from '@/shared/types';
import { PaginatedResponse, PaginationParams } from '@/shared/types/api.types';

const ADMIN_ENDPOINTS = {
  // Document Types
  DOCUMENT_TYPES: '/admin/document-types',
  DOCUMENT_TYPES_ACTIVE: '/admin/document-types/active',
  
  // Audit Logs
  AUDIT_LOGS: '/admin/audit-logs',
  
  // System Settings
  SETTINGS: '/admin/settings',
  
  // Users (admin management)
  USERS: '/users',
} as const;

/**
 * Admin Service
 * Handles all admin-related API calls
 */
export const adminService = {
  // ============ Document Types ============
  
  /**
   * Get all document types
   */
  getDocumentTypes: async (): Promise<DocumentType[]> => {
    const response = await api.get<ApiResponse<DocumentType[]>>(
      ADMIN_ENDPOINTS.DOCUMENT_TYPES
    );
    return response.data.data;
  },

  /**
   * Get active document types only
   */
  getActiveDocumentTypes: async (): Promise<DocumentType[]> => {
    const response = await api.get<ApiResponse<DocumentType[]>>(
      ADMIN_ENDPOINTS.DOCUMENT_TYPES_ACTIVE
    );
    return response.data.data;
  },

  /**
   * Get document type by ID
   */
  getDocumentTypeById: async (id: string): Promise<DocumentType> => {
    const response = await api.get<ApiResponse<DocumentType>>(
      `${ADMIN_ENDPOINTS.DOCUMENT_TYPES}/${id}`
    );
    return response.data.data;
  },

  /**
   * Create document type
   */
  createDocumentType: async (data: CreateDocumentTypeRequest): Promise<DocumentType> => {
    const response = await api.post<ApiResponse<DocumentType>>(
      ADMIN_ENDPOINTS.DOCUMENT_TYPES,
      data
    );
    return response.data.data;
  },

  /**
   * Update document type
   */
  updateDocumentType: async (id: string, data: UpdateDocumentTypeRequest): Promise<DocumentType> => {
    const response = await api.put<ApiResponse<DocumentType>>(
      `${ADMIN_ENDPOINTS.DOCUMENT_TYPES}/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete document type (soft delete)
   */
  deleteDocumentType: async (id: string): Promise<void> => {
    await api.delete(`${ADMIN_ENDPOINTS.DOCUMENT_TYPES}/${id}`);
  },

  /**
   * Permanently delete document type
   */
  permanentDeleteDocumentType: async (id: string): Promise<void> => {
    await api.delete(`${ADMIN_ENDPOINTS.DOCUMENT_TYPES}/${id}/permanent`);
  },

  // ============ Audit Logs ============

  /**
   * Get recent audit logs
   */
  getAuditLogs: async (params?: PaginationParams): Promise<PaginatedResponse<AuditLog>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<AuditLog>>>(
      ADMIN_ENDPOINTS.AUDIT_LOGS,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get audit logs by actor
   */
  getAuditLogsByActor: async (actorId: string, params?: PaginationParams): Promise<PaginatedResponse<AuditLog>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<AuditLog>>>(
      `${ADMIN_ENDPOINTS.AUDIT_LOGS}/actor/${actorId}`,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get audit logs by action
   */
  getAuditLogsByAction: async (action: string, params?: PaginationParams): Promise<PaginatedResponse<AuditLog>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<AuditLog>>>(
      `${ADMIN_ENDPOINTS.AUDIT_LOGS}/action/${action}`,
      { params }
    );
    return response.data.data;
  },

  // ============ System Settings ============

  /**
   * Get all system settings
   */
  getSystemSettings: async (): Promise<SystemSetting[]> => {
    const response = await api.get<ApiResponse<SystemSetting[]>>(
      ADMIN_ENDPOINTS.SETTINGS
    );
    return response.data.data;
  },

  /**
   * Get system setting by key
   */
  getSystemSetting: async (key: string): Promise<SystemSetting> => {
    const response = await api.get<ApiResponse<SystemSetting>>(
      `${ADMIN_ENDPOINTS.SETTINGS}/${key}`
    );
    return response.data.data;
  },

  /**
   * Update system setting
   */
  updateSystemSetting: async (data: UpdateSystemSettingRequest): Promise<SystemSetting> => {
    const response = await api.put<ApiResponse<SystemSetting>>(
      ADMIN_ENDPOINTS.SETTINGS,
      data
    );
    return response.data.data;
  },

  // ============ User Management ============

  /**
   * Get all users with pagination
   */
  getUsers: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<User>>>(
      ADMIN_ENDPOINTS.USERS,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(
      `${ADMIN_ENDPOINTS.USERS}/${id}`
    );
    return response.data.data;
  },

  /**
   * Get users by role
   */
  getUsersByRole: async (role: string): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>(
      `${ADMIN_ENDPOINTS.USERS}/role/${role}`
    );
    return response.data.data;
  },

  /**
   * Create user
   */
  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await api.post<ApiResponse<User>>(
      ADMIN_ENDPOINTS.USERS,
      data
    );
    return response.data.data;
  },

  /**
   * Update user
   */
  updateUser: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(
      `${ADMIN_ENDPOINTS.USERS}/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete user (soft delete)
   */
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`${ADMIN_ENDPOINTS.USERS}/${id}`);
  },

  /**
   * Activate user
   */
  activateUser: async (id: string): Promise<User> => {
    const response = await api.post<ApiResponse<User>>(
      `${ADMIN_ENDPOINTS.USERS}/${id}/activate`
    );
    return response.data.data;
  },

  /**
   * Deactivate user
   */
  deactivateUser: async (id: string): Promise<User> => {
    const response = await api.post<ApiResponse<User>>(
      `${ADMIN_ENDPOINTS.USERS}/${id}/deactivate`
    );
    return response.data.data;
  },
};

export default adminService;
