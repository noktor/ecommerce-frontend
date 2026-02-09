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

// Get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

export interface Product {
  id: string;
  storeId?: string | null;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  createdAt: string;
  longDescription?: string; // Optional detailed description
  imageUrl?: string; // Main product image (e.g. product page)
  thumbnailUrl?: string; // Smaller image for cards (optional; falls back to imageUrl)
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  id: string | null;
  userId: string;
  items: CartItem[];
  updatedAt: string;
  expiresAt?: string; // Cart expiration timestamp (ISO string)
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
  userId: string | null;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  shippingAddress: string;
}

export interface Store {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  ownerId?: string;
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
    ...((options?.headers as Record<string, string>) || {}),
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
  stores: {
    listMine: (): Promise<Store[]> => {
      return fetchApi<Store[]>('/stores/mine');
    },
    create: (payload: {
      name: string;
      description?: string;
      imageUrl?: string;
      phone?: string;
      address?: string;
    }): Promise<Store> => {
      return fetchApi<Store>('/stores', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    update: (
      id: string,
      payload: {
        name?: string;
        description?: string;
        imageUrl?: string;
        phone?: string;
        address?: string;
      }
    ): Promise<Store> => {
      return fetchApi<Store>(`/stores/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
  },
  products: {
    getAll: (category?: string): Promise<Product[]> => {
      const query = category ? `?category=${encodeURIComponent(category)}` : '';
      return fetchApi<Product[]>(`/products${query}`);
    },
    getById: (id: string): Promise<Product> => {
      return fetchApi<Product>(`/products/${id}`);
    },
  },
  retailerProducts: {
    list: (storeId: string): Promise<Product[]> => {
      return fetchApi<Product[]>(`/backoffice/stores/${storeId}/products`);
    },
    create: (
      storeId: string,
      payload: {
        name: string;
        description: string;
        price: number;
        stock: number;
        category: string;
        imageUrl?: string;
        thumbnailUrl?: string;
        longDescription?: string;
      }
    ): Promise<Product> => {
      return fetchApi<Product>(`/backoffice/stores/${storeId}/products`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    update: (
      productId: string,
      payload: {
        name?: string;
        description?: string;
        price?: number;
        stock?: number;
        category?: string;
        imageUrl?: string;
        thumbnailUrl?: string;
        longDescription?: string;
      }
    ): Promise<Product> => {
      return fetchApi<Product>(`/backoffice/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
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
  uploads: {
    /** Upload a product image (data URL from file); returns Cloudinary URLs. */
    uploadProductImage: (imageDataUrl: string): Promise<{ imageUrl: string; thumbnailUrl: string; publicId: string }> => {
      return fetchApi<{ imageUrl: string; thumbnailUrl: string; publicId: string }>(
        '/backoffice/uploads/products',
        {
          method: 'POST',
          body: JSON.stringify({ imageDataUrl }),
        }
      );
    },
  },
  orders: {
    create: (
      items: Array<{ productId: string; quantity: number }>,
      shippingAddress: string,
      guestEmail?: string,
      guestName?: string
    ): Promise<Order> => {
      return fetchApi<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items,
          shippingAddress,
          ...(guestEmail && { guestEmail }),
          ...(guestName && { guestName }),
        }),
      });
    },
    getById: (id: string): Promise<Order> => {
      return fetchApi<Order>(`/orders/${id}`);
    },
  },
};
