/**
 * Authentication Types
 */

// User role enum matching backend
export type UserRole = 
  | 'ADMIN'
  | 'SUPERVISOR'
  | 'STUDENT'
  | 'FYP_COMMITTEE'
  | 'EVALUATION_COMMITTEE';

// User entity from API
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  rollNumber?: string;
  department?: string;
  profileImageUrl?: string;
  roles: UserRole[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Login request payload
export interface LoginRequest {
  email: string;
  password: string;
}

// Register request payload
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  rollNumber?: string;
  department?: string;
}

// Auth response from login/register
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

// Change password request
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Reset password request
export interface ResetPasswordRequest {
  email: string;
}

// Confirm reset password
export interface ConfirmResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Update profile request
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  department?: string;
  profileImageUrl?: string;
}

// Auth state in context
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
