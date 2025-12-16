import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import { storeService } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/env';

type StoreListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'StoreList'>;

type Props = {
  navigation: StoreListScreenNavigationProp;
};

type Store = {
  id: number;
  owner_id: number;
  store_name: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  lottery_ac_no: string;
  lottery_pw: string;
  created_at: string;
  updated_at?: string;
};

export default function StoreListScreen({ navigation }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ownerName, setOwnerName] = useState<string>('');

  useEffect(() => {
    fetchOwnerName();
    fetchStores();
  }, []);

  const fetchOwnerName = async () => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (userData) {
        const user = JSON.parse(userData);
        // Try different possible field names for the user's name
        const fullName = user.full_name || user.name || user.owner_name || '';
        // Extract only the first name
        const firstName = fullName.split(' ')[0];
        setOwnerName(firstName);
      }
    } catch (error) {
      console.error('Error fetching owner name:', error);
    }
  };

  const fetchStores = async () => {
    try {
      setLoading(true);
      const result = await storeService.getStores();

      if (result.success && result.data) {
        // API might return stores in result.data.stores or directly in result.data
        const storesData = Array.isArray(result.data) ? result.data : result.data.stores || [];
        setStores(storesData);
      } else {
        // Silently handle error - just show empty state
        setStores([]);
      }
    } catch (error) {
      // Silently handle error - just show empty state
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStores();
    setRefreshing(false);
  };

  const handleStorePress = (store: Store) => {
    navigation.navigate('Dashboard', {
      storeId: store.id.toString(),
      storeName: store.store_name,
      state: store.state || ''
    });
  };

  const formatAddress = (store: Store) => {
    const parts = [store.address, store.city, store.state, store.zipcode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'No address provided';
  };

  const getStoreIcon = (index: number) => {
    const icons = ['🏪', '🏬', '🏢', '🏛️', '🏦', '🏭'];
    return icons[index % icons.length];
  };

  const renderStoreItem = ({ item, index }: { item: Store; index: number }) => (
    <View style={styles.storeCard}>
      <TouchableOpacity
        onPress={() => handleStorePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.storeIconContainer}>
            <Text style={styles.storeIcon}>{getStoreIcon(index)}</Text>
          </View>
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>{item.store_name}</Text>
            <Text style={styles.storeAddress}>{formatAddress(item)}</Text>
          </View>
          <View style={styles.arrowContainer}>
            <Text style={styles.arrowText}>›</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>••••{item.lottery_ac_no.slice(-4)}</Text>
            <Text style={styles.statLabel}>Account No.</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
            <Text style={styles.statLabel}>Created</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>✓</Text>
            </View>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Quick Action Buttons */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            navigation.navigate('StoreLotteryDashboard', {
              storeId: item.id,
              storeName: item.store_name
            });
          }}
        >
          <Ionicons name="cube-outline" size={18} color={colors.primary} />
          <Text style={styles.actionButtonText}>My Inventory</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('PrintReport', {
            storeId: item.id.toString(),
            storeName: item.store_name
          })}
        >
          <Ionicons name="document-text-outline" size={18} color={colors.secondary} />
          <Text style={styles.actionButtonText}>Reports</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHeader = () => {
    const totalStores = stores.length;

    return (
      <View style={styles.headerSection}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>
              Welcome back{ownerName ? `, ${ownerName}` : ''}! 👋
            </Text>
            <Text style={styles.subtitle}>Manage your store's lottery</Text>
          </View>
        </View>

        <View style={styles.overviewCards}>
          <View style={[styles.overviewCard, { backgroundColor: colors.primary + '15' }]}>
            <Text style={styles.overviewValue} adjustsFontSizeToFit numberOfLines={1}>{totalStores}</Text>
            <Text style={styles.overviewLabel} adjustsFontSizeToFit numberOfLines={2}>Total Stores</Text>
          </View>
          <View style={[styles.overviewCard, { backgroundColor: colors.secondary + '15' }]}>
            <Text style={styles.overviewValue} adjustsFontSizeToFit numberOfLines={1}>{stores.filter(s => s.lottery_ac_no).length}</Text>
            <Text style={styles.overviewLabel} adjustsFontSizeToFit numberOfLines={2}>Active Accounts</Text>
          </View>
          <View style={[styles.overviewCard, { backgroundColor: colors.accent + '15' }]}>
            <Text style={styles.overviewValue} adjustsFontSizeToFit numberOfLines={1}>
              {stores.length > 0 ? new Date(Math.max(...stores.map(s => new Date(s.created_at).getTime()))).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
            </Text>
            <Text style={styles.overviewLabel} adjustsFontSizeToFit numberOfLines={2}>Latest Store</Text>
          </View>
        </View>

        <Text style={styles.storesTitle}>Your Stores</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🏪</Text>
      <Text style={styles.emptyTitle}>No Stores Yet</Text>
      <Text style={styles.emptyText}>Create your first store to get started</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle={colors === useTheme() && colors.background === '#F5F5F5' ? 'dark-content' : 'light-content'} backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading stores...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={colors === useTheme() && colors.background === '#F5F5F5' ? 'dark-content' : 'light-content'} backgroundColor={colors.background} />
      <FlatList
        data={stores}
        renderItem={renderStoreItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
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
  listContainer: {
    paddingBottom: 20,
  },
  headerSection: {
    padding: 20,
    paddingTop: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  overviewCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 8,
  },
  overviewCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 70,
    justifyContent: 'center',
  },
  overviewValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 13,
  },
  storesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 5,
  },
  storeCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  storeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  storeIcon: {
    fontSize: 24,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundDark,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  activeBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  activeBadgeText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  createButton: {
    position: 'absolute',
    bottom: 35,
    left: 20,
    right: 20,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  createButtonIcon: {
    color: colors.textLight,
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  createButtonText: {
    color: colors.textLight,
    fontSize: 17,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
