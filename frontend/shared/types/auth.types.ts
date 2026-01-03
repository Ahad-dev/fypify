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

// User entity from API (matches backend UserDto)
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;  // Single role from backend
  isActive: boolean;
  createdAt: string;
}

// Login request payload
export interface LoginRequest {
  email: string;
  password: string;
}

// Register request payload (admin only)
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

// Auth response from login/register
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

// Change password request
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Forgot password request (request reset link)
export interface ForgotPasswordRequest {
  email: string;
}

// Reset password request (with token from email)
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Update profile request
export interface UpdateProfileRequest {
  fullName?: string;
}

// Auth state in context
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
