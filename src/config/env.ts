/**
 * Environment Configuration
 * Centralized configuration for API endpoints and environment-specific settings
 */

interface EnvironmentConfig {
  API_BASE_URL: string;
  API_TIMEOUT: number;
  ENABLE_LOGGING: boolean;
  APP_VERSION: string;
}

// For now, use production environment
// In a real app, you'd use expo-constants or environment variables
const ENV = 'production';

const environments: Record<string, EnvironmentConfig> = {
  development: {
    API_BASE_URL: 'http://localhost:3000/api',
    API_TIMEOUT: 30000,
    ENABLE_LOGGING: true,
    APP_VERSION: '1.0.0-dev',
  },
  staging: {
    API_BASE_URL: 'https://lotto-pro-api-staging.up.railway.app/api',
    API_TIMEOUT: 20000,
    ENABLE_LOGGING: true,
    APP_VERSION: '1.0.0-staging',
  },
  production: {
    API_BASE_URL: 'https://lotto-pro-api-production.up.railway.app/api',
    API_TIMEOUT: 15000,
    ENABLE_LOGGING: false,
    APP_VERSION: '1.0.0',
  },
};

// Export current environment config
export const config: EnvironmentConfig = environments[ENV];

// Helper to check if in development mode
export const isDevelopment = ENV === 'development';
export const isProduction = ENV === 'production';

// Storage keys (centralized for consistency)
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
  STORE_DATA: '@store_data',
  USER_TYPE: '@user_type',
  THEME_MODE: '@theme_mode',
  ONBOARDING_COMPLETE: '@onboarding_complete',
} as const;
