// API URL configuration:
// - In development: use '/api' to leverage Vite proxy (proxies to http://localhost:3000/api)
// - In production: use VITE_API_URL environment variable (set in .env.production or Netlify environment variables)
//   Example: VITE_API_URL=https://your-backend.onrender.com/api
function getApiUrl(): string {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // In development, use proxy
  if (import.meta.env.DEV) {
    return '/api';
  }

  // In production, VITE_API_URL must be set
  // If not set, show error in console and throw
  const error = 'VITE_API_URL is not configured! Please set it in Netlify environment variables.';
  console.error('❌', error);
  console.error('Current environment:', {
    MODE: import.meta.env.MODE,
    PROD: import.meta.env.PROD,
    DEV: import.meta.env.DEV,
    VITE_API_URL: import.meta.env.VITE_API_URL,
  });
  throw new Error(error);
}

const API_URL = getApiUrl();

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  status?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  id: string;
  email: string;
  name: string;
}

const TOKEN_KEY = 'auth_token';

export const authService = {
  // Store token in localStorage
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Remove token from localStorage
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Register new user
  async register(email: string, password: string, name: string): Promise<RegisterResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Registration failed');
    }

    return data.data;
  },

  // Login user
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Login failed');
    }

    // Store token
    this.setToken(data.data.token);

    return data.data;
  },

  // Logout user
  logout(): void {
    this.removeToken();
  },

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/verify/${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Email verification failed');
    }
  },

  // Request password reset
  async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Password reset request failed');
    }
  },

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Password reset failed');
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      if (response.status === 401) {
        this.removeToken();
      }
      throw new Error(data.message || 'Failed to get user');
    }

    return data.data;
  },
};
