export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
}

export interface AuthState {
  username: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
