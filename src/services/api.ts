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
    VITE_API_URL: import.meta.env.VITE_API_URL
  });
  throw new Error(error);
}

const API_URL = getApiUrl();

// Get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  createdAt: string;
  longDescription?: string; // Optional detailed description
  imageUrl?: string; // Optional product image URL
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  id: string | null;
  customerId: string;
  items: CartItem[];
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  shippingAddress: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    statusCode: number;
  };
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error?.message || 'API request failed');
  }

  return data.data;
}

export const api = {
  products: {
    getAll: (category?: string): Promise<Product[]> => {
      const query = category ? `?category=${encodeURIComponent(category)}` : '';
      return fetchApi<Product[]>(`/products${query}`);
    },
    getById: (id: string): Promise<Product> => {
      return fetchApi<Product>(`/products/${id}`);
    },
  },
  cart: {
    getByCustomerId: (): Promise<Cart> => {
      return fetchApi<Cart>('/cart/me');
    },
    addItem: (productId: string, quantity: number): Promise<Cart> => {
      return fetchApi<Cart>('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      });
    },
    removeItem: (productId: string): Promise<Cart> => {
      return fetchApi<Cart>('/cart/item', {
        method: 'DELETE',
        body: JSON.stringify({ productId }),
      });
    },
  },
  orders: {
    create: (items: Array<{ productId: string; quantity: number }>, shippingAddress: string): Promise<Order> => {
      return fetchApi<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify({ items, shippingAddress }),
      });
    },
    getById: (id: string): Promise<Order> => {
      return fetchApi<Order>(`/orders/${id}`);
    },
  },
};

