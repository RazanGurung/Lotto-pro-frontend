import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';

type StoreListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'StoreList'>;

type Props = {
  navigation: StoreListScreenNavigationProp;
};

type Store = {
  id: string;
  name: string;
  address: string;
  activeTickets: number;
  todaySales: number;
  monthRevenue: number;
  icon: string;
};

// Mock data - replace with API call
const MOCK_STORES: Store[] = [
  {
    id: '1',
    name: 'Downtown Store',
    address: '123 Main St, City',
    activeTickets: 5,
    todaySales: 24,
    monthRevenue: 15420,
    icon: '🏪'
  },
  {
    id: '2',
    name: 'Westside Store',
    address: '456 West Ave, City',
    activeTickets: 3,
    todaySales: 18,
    monthRevenue: 12350,
    icon: '🏬'
  },
  {
    id: '3',
    name: 'Eastside Store',
    address: '789 East Blvd, City',
    activeTickets: 4,
    todaySales: 31,
    monthRevenue: 18900,
    icon: '🏢'
  },
  {
    id: '4',
    name: 'North Branch',
    address: '321 North Rd, City',
    activeTickets: 6,
    todaySales: 42,
    monthRevenue: 21500,
    icon: '🏛️'
  },
];

export default function StoreListScreen({ navigation }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);

  const handleStorePress = (store: Store) => {
    navigation.navigate('Dashboard', { storeId: store.id, storeName: store.name });
  };

  const handleLogout = () => {
    navigation.replace('Login');
  };

  const renderStoreItem = ({ item }: { item: Store }) => (
    <TouchableOpacity
      style={styles.storeCard}
      onPress={() => handleStorePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.storeIconContainer}>
          <Text style={styles.storeIcon}>{item.icon}</Text>
        </View>
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{item.name}</Text>
          <Text style={styles.storeAddress}>{item.address}</Text>
        </View>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrowText}>›</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>${(item.monthRevenue / 1000).toFixed(1)}k</Text>
          <Text style={styles.statLabel}>Month Revenue</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{item.todaySales}</Text>
          <Text style={styles.statLabel}>Today's Sales</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>{item.activeTickets}</Text>
          </View>
          <Text style={styles.statLabel}>Active Types</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => {
    const totalStores = MOCK_STORES.length;
    const totalRevenue = MOCK_STORES.reduce((sum, store) => sum + store.monthRevenue, 0);
    const totalSales = MOCK_STORES.reduce((sum, store) => sum + store.todaySales, 0);

    return (
      <View style={styles.headerSection}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>Welcome back! 👋</Text>
            <Text style={styles.subtitle}>Here's your business overview</Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.overviewCards}>
          <View style={[styles.overviewCard, { backgroundColor: colors.primary + '15' }]}>
            <Text style={styles.overviewValue}>{totalStores}</Text>
            <Text style={styles.overviewLabel}>Total Stores</Text>
          </View>
          <View style={[styles.overviewCard, { backgroundColor: colors.secondary + '15' }]}>
            <Text style={styles.overviewValue}>${(totalRevenue / 1000).toFixed(1)}k</Text>
            <Text style={styles.overviewLabel}>Month Revenue</Text>
          </View>
          <View style={[styles.overviewCard, { backgroundColor: colors.accent + '15' }]}>
            <Text style={styles.overviewValue}>{totalSales}</Text>
            <Text style={styles.overviewLabel}>Today's Sales</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={colors === useTheme() && colors.background === '#F5F5F5' ? 'dark-content' : 'light-content'} backgroundColor={colors.background} />
      <FlatList
        data={MOCK_STORES}
        renderItem={renderStoreItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    paddingBottom: 100,
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
  logoutButton: {
    backgroundColor: colors.error + '15',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  logoutText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  overviewCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  overviewCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
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
});
