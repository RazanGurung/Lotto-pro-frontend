/**
 * API Service Layer
 * Centralized API communication with error handling, retries, and timeouts
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { config, STORAGE_KEYS } from '../config/env';
import {
  NetworkError,
  AuthenticationError,
  ServerError,
  TimeoutError,
  ValidationError,
} from '../utils/errors';

// ==================== INTERFACES ====================

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface StoreData {
  owner_id: number;
  store_name: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  lottery_ac_no: string;
  lottery_pw: string;
}

interface ProfileData {
  full_name?: string;
  email?: string;
  phone?: string;
  position?: string;
}

interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface LotteryData {
  lottery_name: string;
  lottery_number: string;
  state: string;
  price: number;
  start_number: number;
  end_number: number;
  launch_date?: string;
  status?: string;
  image_url?: string;
}

interface TicketData {
  store_id: number;
  lottery_game_number: string;
  lottery_game_name: string;
  pack_number: string;
  ticket_number: string;
  barcode_raw: string;
  scanned_at: string;
  price?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  msg?: string;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get auth token from AsyncStorage
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    return null;
  }
};

/**
 * Clear all auth data on logout
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
      AsyncStorage.removeItem(STORAGE_KEYS.USER_TYPE),
    ]);
  } catch (error) {
    // Silent fail on logout cleanup
  }
};

/**
 * Fetch with timeout support
 */
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = config.API_TIMEOUT
): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error: any) {
    throw new NetworkError(error.message || 'Network request failed');
  }
};

/**
 * Retry logic for failed requests
 */
const retryFetch = async <T>(
  fetchFn: () => Promise<T>,
  maxRetries: number = 2,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on auth errors or validation errors
      if (error instanceof AuthenticationError || error instanceof ValidationError) {
        throw error;
      }

      // Don't retry if this is the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
    }
  }

  throw lastError || new NetworkError();
};

/**
 * Make authenticated API request
 */
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  requiresAuth: boolean = true
): Promise<ApiResponse<T>> => {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if required
    if (requiresAuth) {
      const token = await getAuthToken();
      if (!token) {
        throw new AuthenticationError('No authentication token found. Please login again.');
      }
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${config.API_BASE_URL}${endpoint}`;

    const response = await fetchWithTimeout(url, {
      ...options,
      headers,
    });

    const result = await response.json();

    // Handle HTTP error codes
    if (!response.ok) {
      if (response.status === 401) {
        // Clear auth data on 401
        await clearAuthData();
        throw new AuthenticationError(result.error || result.message || 'Session expired. Please login again.');
      }

      if (response.status === 400) {
        throw new ValidationError(result.error || result.message || 'Invalid request data');
      }

      if (response.status >= 500) {
        throw new ServerError(result.error || result.message);
      }

      return {
        success: false,
        error: result.error || result.message || 'Request failed',
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    if (error instanceof AuthenticationError ||
        error instanceof ValidationError ||
        error instanceof ServerError ||
        error instanceof TimeoutError) {
      throw error;
    }

    throw new NetworkError(error.message);
  }
};

// ==================== AUTH SERVICE ====================

export const authService = {
  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<ApiResponse<any>> => {
    try {
      return await retryFetch(() =>
        apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify(data),
        }, false)
      );
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Registration failed',
      };
    }
  },

  /**
   * Login user
   */
  login: async (data: LoginData): Promise<ApiResponse<any>> => {
    try {
      return await retryFetch(() =>
        apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify(data),
        }, false)
      );
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  },

  /**
   * Get user profile
   */
  getProfile: async (): Promise<ApiResponse<any>> => {
    try {
      return await retryFetch(() => apiRequest('/auth/profile'));
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch profile',
      };
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: ProfileData): Promise<ApiResponse<any>> => {
    try {
      return await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update profile',
      };
    }
  },

  /**
   * Change user password
   */
  changePassword: async (data: ChangePasswordData): Promise<ApiResponse<any>> => {
    try {
      return await apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: data.current_password,
          new_password: data.new_password,
        }),
      });
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to change password',
      };
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await clearAuthData();
  },
};

// ==================== STORE SERVICE ====================

export const storeService = {
  /**
   * Get all stores for the authenticated user
   */
  getStores: async (): Promise<ApiResponse<any>> => {
    try {
      return await retryFetch(() => apiRequest('/stores'));
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch stores',
      };
    }
  },

  /**
   * Create a new store
   */
  createStore: async (data: StoreData): Promise<ApiResponse<any>> => {
    try {
      return await apiRequest('/store', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create store',
      };
    }
  },

  /**
   * Update an existing store
   */
  updateStore: async (storeId: number, data: Partial<StoreData>): Promise<ApiResponse<any>> => {
    try {
      return await apiRequest(`/store/${storeId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update store',
      };
    }
  },
};

// ==================== LOTTERY SERVICE ====================

export const lotteryService = {
  /**
   * Create a new lottery game (Super Admin only)
   */
  createLottery: async (data: LotteryData): Promise<ApiResponse<any>> => {
    try {
      return await apiRequest('/super-admin/lotteries', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create lottery',
      };
    }
  },

  /**
   * Get all lottery games (Super Admin only)
   */
  getLotteries: async (): Promise<ApiResponse<any>> => {
    try {
      return await retryFetch(() => apiRequest('/super-admin/lotteries'));
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch lotteries',
      };
    }
  },

  /**
   * Get lottery games for store owners (public access, filtered by state)
   */
  getPublicLotteries: async (state?: string): Promise<ApiResponse<any>> => {
    try {
      const endpoint = state ? `/lotteries?state=${state}` : '/lotteries';
      return await retryFetch(() => apiRequest(endpoint));
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch lotteries',
      };
    }
  },

  /**
   * Update a lottery game
   */
  updateLottery: async (lotteryId: number, data: LotteryData): Promise<ApiResponse<any>> => {
    try {
      return await apiRequest(`/super-admin/lotteries/${lotteryId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update lottery',
      };
    }
  },

  /**
   * Delete a lottery game
   */
  deleteLottery: async (lotteryId: number): Promise<ApiResponse<any>> => {
    try {
      return await apiRequest(`/super-admin/lotteries/${lotteryId}`, {
        method: 'DELETE',
      });
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete lottery',
      };
    }
  },
};

// ==================== TICKET SERVICE ====================

export const ticketService = {
  /**
   * Save scanned ticket to inventory
   */
  saveTicket: async (data: TicketData): Promise<ApiResponse<any>> => {
    try {
      return await apiRequest('/tickets', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to save ticket',
      };
    }
  },

  /**
   * Get tickets for a store
   */
  getTickets: async (storeId: number): Promise<ApiResponse<any>> => {
    try {
      return await retryFetch(() => apiRequest(`/tickets?store_id=${storeId}`));
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch tickets',
      };
    }
  },
};
