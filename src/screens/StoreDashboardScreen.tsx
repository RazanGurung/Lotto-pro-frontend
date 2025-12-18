import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/env';
import { authService, ticketService } from '../services/api';

type Props = {
  navigation: any;
};

interface TodayStats {
  scans: number;
  sales: number;
  lowStock: number;
}

export default function StoreDashboardScreen({ navigation }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);
  const [storeName, setStoreName] = useState('');
  const [storeId, setStoreId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayStats, setTodayStats] = useState<TodayStats>({
    scans: 0,
    sales: 0,
    lowStock: 0,
  });

  useEffect(() => {
    loadStoreData();
  }, []);

  useEffect(() => {
    if (storeId) {
      fetchTodayStats();
    }
  }, [storeId]);

  const loadStoreData = async () => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      console.log('=== STORE DASHBOARD USER DATA ===');
      console.log('Raw user data:', userData);

      if (userData) {
        const user = JSON.parse(userData);
        console.log('Parsed user object:', user);
        console.log('All user fields:', Object.keys(user));
        console.log('Store name field:', user.store_name);
        console.log('Name field:', user.name);
        console.log('Store ID field:', user.store_id);
        console.log('ID field:', user.id);

        // For store account login, the store ID should be in the data
        const storeIdValue = user.store_id || user.id || null;
        const storeNameValue = user.store_name || user.name || 'Store';

        console.log('Final store ID:', storeIdValue);
        console.log('Final store name:', storeNameValue);

        setStoreName(storeNameValue);
        setStoreId(storeIdValue);
      }
    } catch (error) {
      console.error('Error loading store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayStats = async () => {
    try {
      if (!storeId) return;

      console.log('Fetching today stats for store:', storeId);
      const result = await ticketService.getDailyReport(storeId);

      if (result.success && result.data) {
        const data = result.data;
        console.log('Today report data:', data);

        // Extract stats from report
        const scans = data.breakdown?.length || 0;
        const sales = data.total_revenue || 0;
        const lowStock = 0; // TODO: Calculate from inventory

        setTodayStats({
          scans,
          sales,
          lowStock,
        });
      }
    } catch (error) {
      console.error('Error fetching today stats:', error);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigation.replace('Login');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.storeName}>{storeName}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Today's Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="scan-outline" size={24} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>{todayStats.scans}</Text>
              <Text style={styles.statLabel}>Books Sold</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="cash-outline" size={24} color={colors.success} />
              </View>
              <Text style={styles.statValue}>${todayStats.sales.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Sales</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.warning + '20' }]}>
                <Ionicons name="alert-circle-outline" size={24} color={colors.warning} />
              </View>
              <Text style={styles.statValue}>{todayStats.lowStock}</Text>
              <Text style={styles.statLabel}>Low Stock</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={() => {
              if (storeId) {
                navigation.navigate('ScanTicket', {
                  storeId: storeId.toString(),
                  storeName: storeName,
                });
              } else {
                Alert.alert('Error', 'Store information not available');
              }
            }}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="scan" size={28} color={colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Scan Tickets</Text>
              <Text style={styles.actionDescription}>Scan lottery tickets to add to inventory</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={async () => {
              if (storeId) {
                try {
                  console.log('Fetching clerk dashboard for store:', storeId);
                  const result = await ticketService.getClerkDashboard(storeId);

                  console.log('Clerk dashboard result:', result);

                  if (result.success && result.data) {
                    // Only navigate if API call was successful
                    navigation.navigate('StoreLotteryDashboard', {
                      storeId: storeId,
                      storeName: storeName,
                    });
                  } else {
                    // Show error and don't navigate
                    const errorMsg = result.error || 'Access denied. You may not have permission to view this inventory.';
                    console.error('Clerk dashboard error:', errorMsg);
                    Alert.alert('Access Denied', errorMsg);
                  }
                } catch (error: any) {
                  console.error('Clerk dashboard exception:', error);
                  Alert.alert('Error', error.message || 'Failed to load inventory');
                }
              } else {
                Alert.alert('Error', 'Store information not available');
              }
            }}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="albums" size={28} color={colors.success} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>View Inventory</Text>
              <Text style={styles.actionDescription}>Check current lottery ticket stock</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={() => {
              if (storeId) {
                navigation.navigate('PrintReport', {
                  storeId: storeId.toString(),
                  storeName: storeName,
                });
              } else {
                Alert.alert('Error', 'Store information not available');
              }
            }}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: colors.info + '15' }]}>
              <Ionicons name="bar-chart" size={28} color={colors.info} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Today's Report</Text>
              <Text style={styles.actionDescription}>View sales and activity reports</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  logoutButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: colors.error + '10',
  },
  container: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
