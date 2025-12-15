const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || "An error occurred");
  }
  return response.json();
};

// Auth API
export const authApi = {
  signup: async (data: { name: string; email: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  login: async (data: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

// Product API
export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export const productApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await fetch(`${API_URL}/products`);
    return handleResponse(response);
  },

  getById: async (id: string): Promise<Product> => {
    const response = await fetch(`${API_URL}/products/${id}`);
    return handleResponse(response);
  },

  create: async (data: Omit<Product, "_id">): Promise<Product> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: Partial<Product>): Promise<Product> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string): Promise<void> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse(response);
  },
};

// Cart API
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
}

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/cart`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse(response);
  },

  addToCart: async (data: {
    productId: string;
    quantity: number;
  }): Promise<Cart> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateCartItem: async (
    productId: string,
    quantity: number
  ): Promise<Cart> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/cart/items/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ quantity }),
    });
    return handleResponse(response);
  },

  removeFromCart: async (productId: string): Promise<Cart> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/cart/items/${productId}`, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse(response);
  },

  clearCart: async (): Promise<Cart> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/cart`, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse(response);
  },
};

// Order API
export interface Order {
  _id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  discountAmount: number;
  discountCode: string | null;
  finalAmount: number;
  status: string;
  orderNumber: number;
  createdAt: string;
}

export interface DiscountCode {
  _id: string;
  code: string;
  discountPercentage: number;
  isUsed: boolean;
  usedAt: Date | null;
  generatedForOrderNumber: number;
}

export const orderApi = {
  checkout: async (discountCode?: string): Promise<Order> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/orders/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ discountCode }),
    });
    return handleResponse(response);
  },

  getUserOrders: async (): Promise<Order[]> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/orders`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse(response);
  },

  getOrderById: async (id: string): Promise<Order> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/orders/${id}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse(response);
  },

  getAvailableDiscount: async (): Promise<DiscountCode | null> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/orders/available-discount/check`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse(response);
  },
};

// Admin API
export interface Analytics {
  totalItemsPurchased: number;
  totalPurchaseAmount: number;
  totalDiscountAmount: number;
  totalOrders: number;
  discountCodes: Array<{
    code: string;
    discountPercentage: number;
    isUsed: boolean;
    usedAt: Date | null;
    generatedForOrderNumber: number;
  }>;
}

export const adminApi = {
  adminLogin: async (data: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  generateDiscountCode: async (orderNumber: number) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/admin/discount-code/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ orderNumber }),
    });
    return handleResponse(response);
  },

  createManualDiscount: async (data: {
    userIds?: string[];
    discountPercentage: number;
    forAllUsers?: boolean;
  }) => {
    const token = getAuthToken();
    const response = await fetch(
      `${API_URL}/admin/discount-code/create-manual`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      }
    );
    return handleResponse(response);
  },

  getAnalytics: async (): Promise<Analytics> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/admin/analytics`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse(response);
  },

  getNthOrderValue: async (): Promise<{ nthOrder: number }> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/admin/nth-order-value`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse(response);
  },

  getAllOrders: async (): Promise<Order[]> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/admin/orders`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse(response);
  },

  getAllUsers: async (): Promise<any[]> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse(response);
  },

  getAllProducts: async (): Promise<Product[]> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/admin/products`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse(response);
  },
};

// Discount API
export const discountApi = {
  getAllDiscountCodes: async (): Promise<DiscountCode[]> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/discount`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse(response);
  },

  getAvailableDiscountCodes: async (): Promise<DiscountCode[]> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/discount/available`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse(response);
  },

  getUsedDiscountCodes: async (): Promise<DiscountCode[]> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/discount/used`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse(response);
  },
};
