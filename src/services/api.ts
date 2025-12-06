const API_URL = 'https://lotto-pro-api-production.up.railway.app/api';

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

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper function to get auth token from AsyncStorage
const getAuthToken = async (): Promise<string | null> => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem('@auth_token');
  } catch (error) {
    return null;
  }
};

export const authService = {
  register: async (data: RegisterData): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Registration failed',
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error. Please check your connection.',
      };
    }
  },

  login: async (data: LoginData): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Login failed',
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error. Please check your connection.',
      };
    }
  },

  getProfile: async (): Promise<ApiResponse<any>> => {
    try {
      const token = await getAuthToken();

      console.log('Auth Token:', token ? 'Token exists' : 'No token');

      if (!token) {
        return {
          success: false,
          error: 'No authentication token found. Please login again.',
        };
      }

      console.log('Fetching profile from:', `${API_URL}/auth/profile`);

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Profile Response Status:', response.status);

      const result = await response.json();
      console.log('Profile Response Body:', result);

      if (!response.ok) {
        return {
          success: false,
          error: result.error || result.message || 'Failed to fetch profile',
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error('Profile Fetch Error:', error);
      return {
        success: false,
        error: error.message || 'Network error. Please check your connection.',
      };
    }
  },

  updateProfile: async (data: ProfileData): Promise<ApiResponse<any>> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        return {
          success: false,
          error: 'No authentication token found',
        };
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to update profile',
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error. Please check your connection.',
      };
    }
  },
};

export const storeService = {
  getStores: async (): Promise<ApiResponse<any>> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        return {
          success: false,
          error: 'No authentication token found',
        };
      }

      // Get user data from AsyncStorage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const userData = await AsyncStorage.getItem('@user_data');

      if (!userData) {
        return {
          success: false,
          error: 'User data not found',
        };
      }

      const url = `${API_URL}/stores`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || result.message || 'Failed to fetch stores',
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error. Please check your connection.',
      };
    }
  },

  createStore: async (data: StoreData): Promise<ApiResponse<any>> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        return {
          success: false,
          error: 'No authentication token found',
        };
      }

      const response = await fetch(`${API_URL}/store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to create store',
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error. Please check your connection.',
      };
    }
  },
};

export const lotteryService = {
  createLottery: async (data: LotteryData): Promise<ApiResponse<any>> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        return {
          success: false,
          error: 'No authentication token found',
        };
      }

      const response = await fetch(`${API_URL}/super-admin/lotteries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || result.message || 'Failed to create lottery',
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error. Please check your connection.',
      };
    }
  },

  getLotteries: async (): Promise<ApiResponse<any>> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        return {
          success: false,
          error: 'No authentication token found',
        };
      }

      const response = await fetch(`${API_URL}/super-admin/lotteries`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || result.message || 'Failed to fetch lotteries',
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error. Please check your connection.',
      };
    }
  },

  updateLottery: async (lotteryId: number, data: LotteryData): Promise<ApiResponse<any>> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        return {
          success: false,
          error: 'No authentication token found',
        };
      }

      const response = await fetch(`${API_URL}/super-admin/lotteries/${lotteryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || result.message || 'Failed to update lottery',
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error. Please check your connection.',
      };
    }
  },
};
