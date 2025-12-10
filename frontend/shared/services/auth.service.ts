import api, { ApiResponse, tokenStorage } from '@/shared/api/apiHandler';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ConfirmResetPasswordRequest,
  UpdateProfileRequest,
} from '@/shared/types';

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  REFRESH: '/auth/refresh',
  CHANGE_PASSWORD: '/auth/change-password',
  RESET_PASSWORD: '/auth/reset-password',
  CONFIRM_RESET: '/auth/confirm-reset',
  UPDATE_PROFILE: '/auth/profile',
} as const;

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export const authService = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      AUTH_ENDPOINTS.LOGIN,
      credentials
    );
    
    const authData = response.data.data;
    
    // Store tokens
    tokenStorage.setTokens(authData.accessToken, authData.refreshToken);
    
    return authData;
  },

  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      AUTH_ENDPOINTS.REGISTER,
      data
    );
    
    const authData = response.data.data;
    
    // Store tokens
    tokenStorage.setTokens(authData.accessToken, authData.refreshToken);
    
    return authData;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await api.post(AUTH_ENDPOINTS.LOGOUT);
    } finally {
      // Always clear tokens, even if API call fails
      tokenStorage.clearTokens();
    }
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(AUTH_ENDPOINTS.ME);
    return response.data.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = tokenStorage.getRefreshToken();
    
    const response = await api.post<ApiResponse<AuthResponse>>(
      AUTH_ENDPOINTS.REFRESH,
      { refreshToken }
    );
    
    const authData = response.data.data;
    tokenStorage.setTokens(authData.accessToken, authData.refreshToken);
    
    return authData;
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, data);
  },

  /**
   * Request password reset
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await api.post(AUTH_ENDPOINTS.RESET_PASSWORD, data);
  },

  /**
   * Confirm password reset with token
   */
  confirmResetPassword: async (data: ConfirmResetPasswordRequest): Promise<void> => {
    await api.post(AUTH_ENDPOINTS.CONFIRM_RESET, data);
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>(
      AUTH_ENDPOINTS.UPDATE_PROFILE,
      data
    );
    return response.data.data;
  },

  /**
   * Check if user has any of the specified roles
   */
  hasRole: (user: User | null, roles: string[]): boolean => {
    if (!user) return false;
    return user.roles.some((role) => roles.includes(role));
  },

  /**
   * Check if user is admin
   */
  isAdmin: (user: User | null): boolean => {
    return authService.hasRole(user, ['ADMIN']);
  },

  /**
   * Check if user is supervisor
   */
  isSupervisor: (user: User | null): boolean => {
    return authService.hasRole(user, ['SUPERVISOR', 'ADMIN']);
  },

  /**
   * Check if user is student
   */
  isStudent: (user: User | null): boolean => {
    return authService.hasRole(user, ['STUDENT']);
  },
};

export default authService;
