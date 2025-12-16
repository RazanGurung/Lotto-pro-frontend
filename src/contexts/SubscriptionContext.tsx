/**
 * Subscription Context
 * Provides subscription status and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { paymentService, type SubscriptionStatus } from '../services/paymentService';

interface SubscriptionContextType {
  subscriptionStatus: SubscriptionStatus;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
  isSubscribed: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isActive: false,
    productId: null,
    expiryDate: null,
    platform: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and check subscription on mount
  useEffect(() => {
    initializeSubscription();

    // Cleanup on unmount
    return () => {
      paymentService.disconnect();
    };
  }, []);

  const initializeSubscription = async () => {
    try {
      setIsLoading(true);
      await paymentService.initialize();
      await refreshSubscription();
    } catch (error) {
      console.error('Error initializing subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSubscription = async () => {
    try {
      const status = await paymentService.checkSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    }
  };

  const value: SubscriptionContextType = {
    subscriptionStatus,
    isLoading,
    refreshSubscription,
    isSubscribed: subscriptionStatus.isActive,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Custom hook to use subscription context
export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
