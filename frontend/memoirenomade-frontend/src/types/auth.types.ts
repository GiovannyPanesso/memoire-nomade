export interface AdminUser {
  id: number;
  email: string;
  name: string;
  isSuperAdmin: boolean;
}

export interface AuthState {
  user: AdminUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}
