/**
 * Subscription Configuration
 * Product IDs for App Store and Google Play subscriptions
 *
 * IMPORTANT: Replace these with your actual product IDs from:
 * - App Store Connect (iOS)
 * - Google Play Console (Android)
 */

export const SUBSCRIPTION_PRODUCTS = {
  // Monthly subscription
  monthly: {
    ios: 'com.lotterypro.subscription.monthly',
    android: 'com.lotterypro.subscription.monthly',
  },
  // Yearly subscription
  yearly: {
    ios: 'com.lotterypro.subscription.yearly',
    android: 'com.lotterypro.subscription.yearly',
  },
};

// Get product ID based on platform
export const getProductId = (type: 'monthly' | 'yearly'): string => {
  const platform = require('react-native').Platform.OS;
  return SUBSCRIPTION_PRODUCTS[type][platform as 'ios' | 'android'];
};

// All product IDs for loading
export const getAllProductIds = (): string[] => {
  const platform = require('react-native').Platform.OS;
  return [
    SUBSCRIPTION_PRODUCTS.monthly[platform as 'ios' | 'android'],
    SUBSCRIPTION_PRODUCTS.yearly[platform as 'ios' | 'android'],
  ];
};

// Subscription tiers with pricing info
export interface SubscriptionTier {
  id: 'monthly' | 'yearly';
  title: string;
  description: string;
  savings?: string;
  popular?: boolean;
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'monthly',
    title: 'Monthly',
    description: 'Billed monthly',
  },
  {
    id: 'yearly',
    title: 'Annual',
    description: 'Billed yearly',
    savings: 'Save 20%',
    popular: true,
  },
];
