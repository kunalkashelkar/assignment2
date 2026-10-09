export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export type UserRole = "user" | "admin";

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
}
