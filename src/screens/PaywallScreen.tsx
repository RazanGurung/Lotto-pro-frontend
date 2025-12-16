/**
 * Paywall Screen
 * Displays subscription options and handles purchases
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
// import { paymentService } from '../services/paymentService';
import { SUBSCRIPTION_TIERS } from '../config/subscriptionConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/env';
// import type { Subscription } from 'react-native-iap';

// Temporary type until react-native-iap is installed
type Subscription = {
  productId: string;
  localizedPrice: string;
};

type Props = {
  navigation: any;
};

export default function PaywallScreen({ navigation }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);

  const [products, setProducts] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  useEffect(() => {
    initializePaywall();
  }, []);

  const initializePaywall = async () => {
    // First check if user already has an active subscription
    await checkExistingSubscription();
    // Then load products
    await loadProducts();
  };

  const checkExistingSubscription = async () => {
    try {
      // TEMPORARY: Auto-navigate until react-native-iap is installed
      // TODO: Uncomment this after installing react-native-iap
      /*
      const status = await paymentService.checkSubscriptionStatus();

      if (status.isActive) {
        // User already has active subscription, navigate to main app
        await navigateToMainApp();
      }
      */

      // For now, just go to main app
      await navigateToMainApp();
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Continue to show paywall if check fails
    }
  };

  const navigateToMainApp = async () => {
    try {
      const userType = await AsyncStorage.getItem(STORAGE_KEYS.USER_TYPE);

      if (userType === 'store') {
        navigation.replace('StoreDashboard');
      } else {
        // Check if onboarding is complete
        const onboardingComplete = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);

        if (onboardingComplete === 'true') {
          navigation.replace('MainTabs');
        } else {
          navigation.replace('ThemeSelection');
        }
      }
    } catch (error) {
      console.error('Error navigating to main app:', error);
      // Default to MainTabs if error
      navigation.replace('MainTabs');
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);

      // TEMPORARY: Mock products until react-native-iap is installed
      // TODO: Uncomment this after installing react-native-iap
      /*
      const availableProducts = await paymentService.getProducts();
      setProducts(availableProducts);
      */

      // Mock products for now
      const mockProducts: Subscription[] = [
        { productId: 'monthly', localizedPrice: '$9.99' },
        { productId: 'yearly', localizedPrice: '$99.99' },
      ];
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Unable to load subscription plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      setPurchasing(true);

      // TEMPORARY: Mock purchase until react-native-iap is installed
      // TODO: Uncomment this after installing react-native-iap
      /*
      const success = await paymentService.purchaseSubscription(selectedPlan);

      if (success) {
        Alert.alert(
          'Purchase Successful',
          'Thank you for subscribing! You now have full access to Lottery Pro.',
          [
            {
              text: 'Continue',
              onPress: async () => {
                await navigateToMainApp();
              },
            },
          ]
        );
      }
      */

      // For now, show a message that payment is not yet configured
      Alert.alert(
        'Payment Not Configured',
        'Please install react-native-iap package first.\n\nRun: npm install react-native-iap',
        [
          {
            text: 'Skip for Now',
            onPress: async () => {
              await navigateToMainApp();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setPurchasing(true);

      // TEMPORARY: Mock restore until react-native-iap is installed
      // TODO: Uncomment this after installing react-native-iap
      /*
      const restored = await paymentService.restorePurchases();

      if (restored) {
        await navigateToMainApp();
      }
      */

      // For now, just navigate to main app
      Alert.alert(
        'Payment Not Configured',
        'Please install react-native-iap package first.\n\nRun: npm install react-native-iap',
        [
          {
            text: 'Skip for Now',
            onPress: async () => {
              await navigateToMainApp();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Restore error:', error);
    } finally {
      setPurchasing(false);
    }
  };

  const getProductPrice = (planId: 'monthly' | 'yearly'): string => {
    const product = products.find((p) =>
      p.productId.toLowerCase().includes(planId)
    );
    return product?.localizedPrice || '...';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading subscription plans...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="lock-closed" size={64} color={colors.primary} />
          <Text style={styles.title}>Unlock Lottery Pro</Text>
          <Text style={styles.subtitle}>
            Subscribe to access all features and manage your lottery business
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What's Included:</Text>

          {[
            'Unlimited store management',
            'Real-time inventory tracking',
            'Advanced sales analytics',
            'Ticket scanning & validation',
            'Detailed reports & exports',
            'Priority customer support',
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Subscription Plans */}
        <View style={styles.plansContainer}>
          {SUBSCRIPTION_TIERS.map((tier) => {
            const isSelected = selectedPlan === tier.id;
            const price = getProductPrice(tier.id);

            return (
              <TouchableOpacity
                key={tier.id}
                style={[
                  styles.planCard,
                  isSelected && styles.planCardSelected,
                  tier.popular && styles.planCardPopular,
                ]}
                onPress={() => setSelectedPlan(tier.id)}
                activeOpacity={0.8}
              >
                {tier.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>MOST POPULAR</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <View style={styles.radioButton}>
                    {isSelected && <View style={styles.radioButtonInner} />}
                  </View>
                  <View style={styles.planInfo}>
                    <Text style={styles.planTitle}>{tier.title}</Text>
                    <Text style={styles.planDescription}>{tier.description}</Text>
                  </View>
                  <Text style={styles.planPrice}>{price}</Text>
                </View>

                {tier.savings && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>{tier.savings}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity
          style={[styles.subscribeButton, purchasing && styles.subscribeButtonDisabled]}
          onPress={handlePurchase}
          disabled={purchasing}
          activeOpacity={0.8}
        >
          {purchasing ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
          )}
        </TouchableOpacity>

        {/* Restore Button */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={purchasing}
        >
          <Text style={styles.restoreButtonText}>Restore Purchase</Text>
        </TouchableOpacity>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            Subscription automatically renews unless auto-renew is turned off at least 24
            hours before the end of the current period.
          </Text>
          <TouchableOpacity style={styles.termsLink}>
            <Text style={styles.termsLinkText}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.termsLink}>
            <Text style={styles.termsLinkText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
    },
    scrollContent: {
      padding: 24,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary,
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginTop: 16,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    featuresContainer: {
      marginBottom: 32,
    },
    featuresTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 16,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    featureText: {
      fontSize: 16,
      color: colors.textPrimary,
      marginLeft: 12,
    },
    plansContainer: {
      marginBottom: 24,
    },
    planCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: colors.border,
    },
    planCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    planCardPopular: {
      borderColor: colors.success,
    },
    popularBadge: {
      position: 'absolute',
      top: -10,
      right: 12,
      backgroundColor: colors.success,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    popularText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: colors.white,
    },
    planHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    radioButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    radioButtonInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.primary,
    },
    planInfo: {
      flex: 1,
    },
    planTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    planDescription: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    planPrice: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    savingsBadge: {
      marginTop: 8,
      backgroundColor: colors.warning + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      alignSelf: 'flex-start',
      marginLeft: 36,
    },
    savingsText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.warning,
    },
    subscribeButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 12,
    },
    subscribeButtonDisabled: {
      opacity: 0.6,
    },
    subscribeButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.white,
    },
    restoreButton: {
      padding: 12,
      alignItems: 'center',
      marginBottom: 24,
    },
    restoreButtonText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
    },
    termsContainer: {
      alignItems: 'center',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    termsText: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 18,
      marginBottom: 12,
    },
    termsLink: {
      marginVertical: 4,
    },
    termsLinkText: {
      fontSize: 14,
      color: colors.primary,
      textDecorationLine: 'underline',
    },
  });
