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
      AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY),
      AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
      AsyncStorage.removeItem(STORAGE_KEYS.USER_TYPE),
    ]);
  } catch (error) {
    // Silent fail on logout cleanup
  }
};

/**
 * Save auth tokens with expiry time
 * @param token - Access token
 * @param refreshToken - Refresh token (optional)
 * @param expiresIn - Token expiry duration in seconds (default 24 hours)
 */
export const saveAuthTokens = async (
  token: string,
  refreshToken?: string,
  expiresIn?: number
): Promise<void> => {
  try {
    const expiryDuration = expiresIn || 86400; // Default 24 hours in seconds
    const expiryTime = Date.now() + (expiryDuration * 1000); // Convert to milliseconds

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token),
      AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString()),
      refreshToken ? AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken) : Promise.resolve(),
    ]);
  } catch (error) {
    console.error('Error saving auth tokens:', error);
  }
};

/**
 * Check if the current token is expired or about to expire
 * Returns true if token expires within the next 5 minutes
 */
const isTokenExpired = async (): Promise<boolean> => {
  try {
    const expiryTimeStr = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    if (!expiryTimeStr) {
      return true; // No expiry time means token is invalid
    }

    const expiryTime = parseInt(expiryTimeStr, 10);
    const currentTime = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer

    return currentTime >= (expiryTime - bufferTime);
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true; // On error, assume token is expired
  }
};

/**
 * Get refresh token from AsyncStorage
 */
const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    return null;
  }
};

/**
 * Refresh the authentication token
 */
const refreshAuthToken = async (): Promise<boolean> => {
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    const url = `${config.API_BASE_URL}/auth/refresh`;
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const result = await response.json();

    if (response.ok && result.token) {
      // Save new tokens
      await saveAuthTokens(
        result.token,
        result.refresh_token || refreshToken, // Use new refresh token if provided
        result.expires_in
      );
      return true;
    }

    // Refresh failed, clear auth data
    await clearAuthData();
    return false;
  } catch (error) {
    console.error('Error refreshing token:', error);
    await clearAuthData();
    return false;
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
 * Make authenticated API request with automatic token refresh
 */
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  requiresAuth: boolean = true,
  isRetryAfterRefresh: boolean = false
): Promise<ApiResponse<T>> => {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if required
    if (requiresAuth) {
      // Check if token is expired and refresh if needed
      const tokenExpired = await isTokenExpired();
      if (tokenExpired && !isRetryAfterRefresh) {
        console.log('Token expired, attempting to refresh...');
        const refreshed = await refreshAuthToken();

        if (!refreshed) {
          throw new AuthenticationError('Session expired. Please login again.');
        }

        console.log('Token refreshed successfully');
      }

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
        // Try refreshing token once on 401
        if (!isRetryAfterRefresh) {
          console.log('Got 401, attempting token refresh...');
          const refreshed = await refreshAuthToken();

          if (refreshed) {
            // Retry the request with new token
            return await apiRequest<T>(endpoint, options, requiresAuth, true);
          }
        }

        // Clear auth data and throw error
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

  /**
   * Delete user account
   */
  deleteAccount: async (): Promise<ApiResponse<any>> => {
    try {
      return await apiRequest('/auth/profile', {
        method: 'DELETE',
      });
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete account',
      };
    }
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
      return await apiRequest('/stores', {
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
      return await apiRequest(`/stores/${storeId}`, {
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

  /**
   * Delete a store
   */
  deleteStore: async (storeId: number): Promise<ApiResponse<any>> => {
    try {
      return await apiRequest(`/stores/${storeId}`, {
        method: 'DELETE',
      });
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete store',
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
   * @deprecated Use getLotteryTypes instead
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
   * Get lottery types based on logged-in user's state (using bearer token)
   * Returns same data structure as super-admin/lotteries
   */
  getLotteryTypes: async (storeId: number): Promise<ApiResponse<any>> => {
    try {
      const result = await retryFetch(() => apiRequest(`/lottery/types/store/${storeId}`));
      return result;
    } catch (error: any) {
      console.error('Lottery Types Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch lottery types',
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
   * Scan barcode and process ticket (sends raw barcode to backend)
   */
  scanTicket: async (rawBarcode: string, storeId: number, direction?: 'asc' | 'desc'): Promise<ApiResponse<any>> => {
    try {
      const body: any = {
        barcode_data: rawBarcode,
        store_id: storeId,
      };

      if (direction) {
        body.direction = direction;
      }

      return await apiRequest('/lotteries/scan', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to scan ticket',
      };
    }
  },

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
  getTickets: async (storeId: number, state: string): Promise<ApiResponse<any>> => {
    try {
      const result = await retryFetch(() => apiRequest(`/lottery/types`));
      return result;
    } catch (error: any) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch tickets',
      };
    }
  },

  /**
   * Get inventory for a store with pagination
   * @param storeId - Store ID
   * @param options - Pagination and filter options
   */
  getStoreInventory: async (
    storeId: number,
    options?: {
      page?: number;
      limit?: number;
      lottery_id?: number;
      status?: 'active' | 'inactive';
    }
  ): Promise<ApiResponse<any>> => {
    try {
      // Build query string
      let queryParams = '';
      if (options) {
        const queryParts: string[] = [];

        if (options.page) {
          queryParts.push(`page=${options.page}`);
        }
        if (options.limit) {
          queryParts.push(`limit=${options.limit}`);
        }
        if (options.lottery_id) {
          queryParts.push(`lottery_id=${options.lottery_id}`);
        }
        if (options.status) {
          queryParts.push(`status=${options.status}`);
        }

        if (queryParts.length > 0) {
          queryParams = '?' + queryParts.join('&');
        }
      }

      const endpoint = `/lottery/store/${storeId}/inventory${queryParams}`;
      const result = await retryFetch(() => apiRequest(endpoint));
      return result;
    } catch (error: any) {
      console.error('Inventory API Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch store inventory',
      };
    }
  },

  /**
   * Get clerk dashboard for a store (for store account login)
   */
  getClerkDashboard: async (storeId: number): Promise<ApiResponse<any>> => {
    try {
      const result = await retryFetch(() => apiRequest(`/stores/clerk/${storeId}/dashboard`));
      return result;
    } catch (error: any) {
      console.error('Clerk Dashboard API Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch clerk dashboard',
      };
    }
  },

  /**
   * Get daily report for a store with validation
   * Supports multiple query types:
   * - Today (default): no params
   * - Specific date: date=2025-12-15
   * - Last 7 days: range=last7
   * - This month: range=this_month
   * - Custom range: range=custom&start_date=2025-12-01&end_date=2025-12-15
   *
   * Maximum date range: 90 days to prevent server overload
   */
  getDailyReport: async (storeId: number, params?: {
    date?: string;
    range?: 'last7' | 'this_month' | 'custom';
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> => {
    try {
      // Validate custom date range if provided
      if (params?.range === 'custom' && params.start_date && params.end_date) {
        const startDate = new Date(params.start_date);
        const endDate = new Date(params.end_date);

        // Check if dates are valid
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return {
            success: false,
            error: 'Invalid date format. Please use YYYY-MM-DD format.',
          };
        }

        // Check if start date is after end date
        if (startDate > endDate) {
          return {
            success: false,
            error: 'Start date cannot be after end date.',
          };
        }

        // Check if dates are in the future
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        if (startDate > now || endDate > now) {
          return {
            success: false,
            error: 'Report dates cannot be in the future.',
          };
        }

        // Check date range doesn't exceed 90 days
        const diffTime = endDate.getTime() - startDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const MAX_RANGE_DAYS = 90;

        if (diffDays > MAX_RANGE_DAYS) {
          return {
            success: false,
            error: `Date range cannot exceed ${MAX_RANGE_DAYS} days. Selected range: ${diffDays} days. Please select a shorter date range.`,
          };
        }
      }

      // Build query string
      let queryParams = '';
      if (params) {
        const queryParts: string[] = [];

        if (params.date) {
          queryParts.push(`date=${params.date}`);
        } else if (params.range) {
          queryParts.push(`range=${params.range}`);
          if (params.range === 'custom' && params.start_date && params.end_date) {
            queryParts.push(`start_date=${params.start_date}`);
            queryParts.push(`end_date=${params.end_date}`);
          }
        }

        // Add pagination parameters
        if (params.page) {
          queryParts.push(`page=${params.page}`);
        }
        if (params.limit) {
          const limit = Math.min(params.limit, 1000); // Cap at 1000 records
          queryParts.push(`limit=${limit}`);
        }

        if (queryParts.length > 0) {
          queryParams = '?' + queryParts.join('&');
        }
      }

      const endpoint = `/reports/store/${storeId}/daily${queryParams}`;
      const result = await retryFetch(() => apiRequest(endpoint));
      return result;
    } catch (error: any) {
      console.error('Daily Report API Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch daily report',
      };
    }
  },
};

// ==================== NOTIFICATION SERVICE ====================

export const notificationService = {
  /**
   * Get all notifications for the authenticated user
   */
  getNotifications: async (): Promise<ApiResponse<any>> => {
    try {
      return await retryFetch(() => apiRequest('/notifications'));
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch notifications',
      };
    }
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (notificationId: number): Promise<ApiResponse<any>> => {
    try {
      return await apiRequest(`/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to mark notification as read',
      };
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<ApiResponse<any>> => {
    try {
      return await apiRequest('/notifications/read-all', {
        method: 'PUT',
      });
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to mark all notifications as read',
      };
    }
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (notificationId: number): Promise<ApiResponse<any>> => {
    try {
      return await apiRequest(`/notifications/${notificationId}`, {
        method: 'DELETE',
      });
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete notification',
      };
    }
  },
};
