// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
  details: any;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// User Types
export enum UserRole {
  STUDENT = "STUDENT",
  SUPERVISOR = "SUPERVISOR",
  EVALUATOR = "EVALUATOR",
  COMMITTEE = "COMMITTEE",
  ADMIN = "ADMIN",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
}
