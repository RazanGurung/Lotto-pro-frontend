/**
 * Payment Service
 * Handles In-App Purchases for both iOS and Android using react-native-iap
 *
 * Features:
 * - Initialize IAP connection
 * - Load subscription products
 * - Purchase subscriptions
 * - Restore purchases
 * - Validate receipts
 * - Check subscription status
 */

import {
  initConnection,
  endConnection,
  getSubscriptions,
  requestSubscription,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  getAvailablePurchases,
  type ProductPurchase,
  type Subscription,
  type PurchaseError,
} from 'react-native-iap';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllProductIds, getProductId } from '../config/subscriptionConfig';

// Storage keys
const STORAGE_KEYS = {
  SUBSCRIPTION_STATUS: '@subscription_status',
  LAST_RECEIPT: '@last_receipt',
  SUBSCRIPTION_EXPIRY: '@subscription_expiry',
};

// Subscription status type
export interface SubscriptionStatus {
  isActive: boolean;
  productId: string | null;
  expiryDate: string | null;
  platform: 'ios' | 'android' | null;
}

class PaymentService {
  private purchaseUpdateSubscription: any = null;
  private purchaseErrorSubscription: any = null;
  private isInitialized = false;

  /**
   * Initialize IAP connection
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return true;
      }

      const connected = await initConnection();
      if (connected) {
        this.isInitialized = true;
        this.setupListeners();
        // Auto-check subscription status on init
        await this.checkSubscriptionStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize IAP:', error);
      return false;
    }
  }

  /**
   * Setup purchase listeners
   */
  private setupListeners() {
    // Purchase update listener
    this.purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: ProductPurchase) => {
        const receipt = purchase.transactionReceipt;
        if (receipt) {
          try {
            // Save receipt for server validation if needed
            await this.saveReceipt(purchase);

            // Finish the transaction
            await finishTransaction({ purchase, isConsumable: false });

            // Update subscription status
            await this.updateSubscriptionStatus(purchase);
          } catch (error) {
            console.error('Error processing purchase:', error);
          }
        }
      }
    );

    // Purchase error listener
    this.purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        if (error.code !== 'E_USER_CANCELLED') {
          console.error('Purchase error:', error);
          Alert.alert('Purchase Failed', error.message || 'An error occurred during purchase');
        }
      }
    );
  }

  /**
   * Get available subscription products
   */
  async getProducts(): Promise<Subscription[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const productIds = getAllProductIds();
      const products = await getSubscriptions({ skus: productIds });
      return products;
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  /**
   * Purchase a subscription
   */
  async purchaseSubscription(type: 'monthly' | 'yearly'): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const productId = getProductId(type);
      await requestSubscription({ sku: productId });
      return true;
    } catch (error: any) {
      console.error('Error purchasing subscription:', error);
      if (error.code !== 'E_USER_CANCELLED') {
        Alert.alert(
          'Purchase Failed',
          'Unable to complete the purchase. Please try again.'
        );
      }
      return false;
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const purchases = await getAvailablePurchases();

      if (purchases && purchases.length > 0) {
        // Find the most recent valid purchase
        const validPurchase = purchases.find(
          (p) => p.productId && getAllProductIds().includes(p.productId)
        );

        if (validPurchase) {
          await this.updateSubscriptionStatus(validPurchase);
          Alert.alert('Success', 'Your subscription has been restored!');
          return true;
        }
      }

      Alert.alert('No Purchases Found', 'No previous purchases were found to restore.');
      return false;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      Alert.alert('Restore Failed', 'Unable to restore purchases. Please try again.');
      return false;
    }
  }

  /**
   * Check current subscription status
   */
  async checkSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      // First check local storage
      const localStatus = await this.getLocalSubscriptionStatus();

      // If we have a valid subscription in local storage, return it
      if (localStatus.isActive) {
        return localStatus;
      }

      // Otherwise, check with the store
      if (!this.isInitialized) {
        await this.initialize();
      }

      const purchases = await getAvailablePurchases();

      if (purchases && purchases.length > 0) {
        const validPurchase = purchases.find(
          (p) => p.productId && getAllProductIds().includes(p.productId)
        );

        if (validPurchase) {
          await this.updateSubscriptionStatus(validPurchase);
          return await this.getLocalSubscriptionStatus();
        }
      }

      // No active subscription found
      return {
        isActive: false,
        productId: null,
        expiryDate: null,
        platform: null,
      };
    } catch (error) {
      console.error('Error checking subscription status:', error);
      // Return local status as fallback
      return await this.getLocalSubscriptionStatus();
    }
  }

  /**
   * Get subscription status from local storage
   */
  private async getLocalSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const statusJson = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_STATUS);
      if (statusJson) {
        const status: SubscriptionStatus = JSON.parse(statusJson);

        // Check if subscription has expired
        if (status.expiryDate) {
          const expiryDate = new Date(status.expiryDate);
          const now = new Date();

          if (expiryDate < now) {
            // Subscription expired
            status.isActive = false;
            await this.saveSubscriptionStatus(status);
          }
        }

        return status;
      }
    } catch (error) {
      console.error('Error getting local subscription status:', error);
    }

    return {
      isActive: false,
      productId: null,
      expiryDate: null,
      platform: null,
    };
  }

  /**
   * Update subscription status after purchase
   */
  private async updateSubscriptionStatus(purchase: ProductPurchase) {
    const status: SubscriptionStatus = {
      isActive: true,
      productId: purchase.productId,
      expiryDate: this.calculateExpiryDate(purchase),
      platform: Platform.OS as 'ios' | 'android',
    };

    await this.saveSubscriptionStatus(status);
  }

  /**
   * Calculate subscription expiry date
   * Note: This is an estimate. For production, validate with your backend
   */
  private calculateExpiryDate(purchase: ProductPurchase): string {
    const now = new Date();
    const productId = purchase.productId;

    // Determine subscription duration based on product ID
    if (productId.includes('monthly')) {
      now.setMonth(now.getMonth() + 1);
    } else if (productId.includes('yearly')) {
      now.setFullYear(now.getFullYear() + 1);
    }

    return now.toISOString();
  }

  /**
   * Save subscription status to local storage
   */
  private async saveSubscriptionStatus(status: SubscriptionStatus) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SUBSCRIPTION_STATUS,
        JSON.stringify(status)
      );
    } catch (error) {
      console.error('Error saving subscription status:', error);
    }
  }

  /**
   * Save purchase receipt
   */
  private async saveReceipt(purchase: ProductPurchase) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_RECEIPT,
        JSON.stringify(purchase)
      );
    } catch (error) {
      console.error('Error saving receipt:', error);
    }
  }

  /**
   * Clear subscription data (for testing/logout)
   */
  async clearSubscriptionData() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.SUBSCRIPTION_STATUS,
        STORAGE_KEYS.LAST_RECEIPT,
        STORAGE_KEYS.SUBSCRIPTION_EXPIRY,
      ]);
    } catch (error) {
      console.error('Error clearing subscription data:', error);
    }
  }

  /**
   * Disconnect IAP
   */
  async disconnect() {
    try {
      if (this.purchaseUpdateSubscription) {
        this.purchaseUpdateSubscription.remove();
        this.purchaseUpdateSubscription = null;
      }
      if (this.purchaseErrorSubscription) {
        this.purchaseErrorSubscription.remove();
        this.purchaseErrorSubscription = null;
      }
      await endConnection();
      this.isInitialized = false;
    } catch (error) {
      console.error('Error disconnecting IAP:', error);
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
