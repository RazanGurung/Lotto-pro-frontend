import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, StatusBar, useColorScheme, TextInput, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { lotteryService, ticketService } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

type DashboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
type DashboardScreenRouteProp = RouteProp<RootStackParamList, 'Dashboard'>;

type Props = {
  navigation: DashboardScreenNavigationProp;
  route: DashboardScreenRouteProp;
};

type Lottery = {
  lottery_id: number;
  lottery_name: string;
  lottery_number: string;
  state: string;
  price: string;
  start_number: number;
  end_number: number;
  launch_date?: string;
  status: string;
  created_at: string;
  image_url?: string;
  assigned_to_caller?: boolean;
  is_assigned?: boolean; // Added: true if lottery has active inventory
  inventory_count?: number; // Added: current count from inventory
  creator?: {
    super_admin_id: number;
    name: string;
    email: string;
  };
};

interface InventoryItem {
  id: number;
  store_id: number;
  lottery_id: number;
  serial_number: string;
  total_count: number;
  current_count: number;
  status: string;
  created_at: string;
}

interface InventoryCount {
  [gameNumber: string]: number; // gameNumber -> ticket count
}

export default function DashboardScreen({ route, navigation }: Props) {
  const colors = useTheme();
  const colorScheme = useColorScheme();
  const styles = createStyles(colors, colorScheme);
  const { storeId, storeName, state } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [inventoryCounts, setInventoryCounts] = useState<InventoryCount>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchLotteries();
    }, [state])
  );

  const fetchLotteries = async () => {
    try {
      setLoading(true);

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📦 DASHBOARD: Loading Data');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🏪 Store ID:', storeId);
      console.log('🏪 Store Name:', storeName);
      console.log('📍 State:', state);

      // Fetch lottery types using bearer token + store ID
      console.log('\n1️⃣ Fetching lottery types...');
      const lotteriesResult = await lotteryService.getLotteryTypes(parseInt(storeId, 10));

      console.log('📊 Lottery Types Result:', lotteriesResult.success);

      // Declare lotteriesData outside the if block so it's accessible later
      let lotteriesData: Lottery[] = [];

      // Process lotteries - already filtered by state from backend
      if (lotteriesResult.success && lotteriesResult.data) {
        // Extract lotteryTypes from response { lotteryTypes: [...] }
        lotteriesData = lotteriesResult.data.lotteryTypes ||
                        lotteriesResult.data.lotteries ||
                        (Array.isArray(lotteriesResult.data) ? lotteriesResult.data : []);

        console.log('📋 Total lotteries received:', lotteriesData.length);

        // Show all lotteries (active and inactive)
        lotteriesData.forEach((lottery: Lottery) => {
          const isActive = lottery.status?.toLowerCase() === 'active';
          console.log(`🎫 Lottery ${lottery.lottery_name} (${lottery.lottery_number}): status=${lottery.status}, active=${isActive}`);
        });

        // Don't set lotteries here - will set after inventory matching
      } else {
        console.log('❌ Lotteries fetch failed:', lotteriesResult.error);
        setLotteries([]);
        setLoading(false);
        return; // Exit early if no lotteries
      }

      // Fetch inventory data
      console.log('\n2️⃣ Fetching inventory data...');
      const inventoryResult = await ticketService.getStoreInventory(parseInt(storeId, 10));

      console.log('📦 Inventory Result:', inventoryResult.success);

      if (inventoryResult.success && inventoryResult.data) {
        const inventoryData: InventoryItem[] = inventoryResult.data.inventory || inventoryResult.data.data || inventoryResult.data;

        console.log('✅ Inventory items received:', Array.isArray(inventoryData) ? inventoryData.length : 'N/A');

        if (Array.isArray(inventoryData)) {
          console.log('\n📊 Processing inventory assignments...');

          if (inventoryData.length === 0) {
            console.log('⚠️ No inventory items - all lotteries marked as NOT ASSIGNED');
            // No inventory, mark all as not assigned
            const updatedLotteries = lotteriesData.map((lottery: Lottery) => ({
              ...lottery,
              is_assigned: false,
              inventory_count: 0
            }));
            setLotteries(updatedLotteries);
            setInventoryCounts({});
          } else {
            // Match inventory with lotteries by lottery_id
            const updatedLotteries = lotteriesData.map((lottery: Lottery) => {
              // Find inventory for this lottery
              const inventoryItem = inventoryData.find(
                (item: InventoryItem) => item.lottery_id === lottery.lottery_id && item.status === 'active'
              );

              if (inventoryItem) {
                console.log(`✓ Lottery #${lottery.lottery_number} (${lottery.lottery_name}) is ASSIGNED - Count: ${inventoryItem.current_count}/${inventoryItem.total_count}`);
                return {
                  ...lottery,
                  is_assigned: true,
                  inventory_count: inventoryItem.current_count
                };
              } else {
                console.log(`✗ Lottery #${lottery.lottery_number} (${lottery.lottery_name}) is NOT ASSIGNED`);
                return {
                  ...lottery,
                  is_assigned: false,
                  inventory_count: 0
                };
              }
            });

            console.log('\n📋 Final lottery assignments (before sorting):');
            updatedLotteries.forEach((lottery: Lottery) => {
              console.log(`  - ${lottery.lottery_name}: ${lottery.is_assigned ? 'ASSIGNED' : 'NOT ASSIGNED'} (${lottery.inventory_count} tickets)`);
            });

            // Sort: ASSIGNED (active) lotteries first, then NOT ASSIGNED (inactive)
            const sortedLotteries = [...updatedLotteries].sort((a: Lottery, b: Lottery) => {
              // First sort by assignment status (assigned first)
              if (a.is_assigned && !b.is_assigned) {
                return -1; // a (assigned) comes before b (not assigned)
              }
              if (!a.is_assigned && b.is_assigned) {
                return 1; // b (assigned) comes before a (not assigned)
              }

              // Same status: sort by price (ascending)
              const priceA = parseFloat(a.price) || 0;
              const priceB = parseFloat(b.price) || 0;
              return priceA - priceB;
            });

            console.log('\n✅ Final lottery assignments (after sorting - ASSIGNED first):');
            sortedLotteries.forEach((lottery: Lottery, idx: number) => {
              console.log(`  ${idx + 1}. ${lottery.lottery_name}: ${lottery.is_assigned ? '✓ ASSIGNED' : '✗ NOT ASSIGNED'} (Price: $${lottery.price})`);
            });

            setLotteries(sortedLotteries);

            // Also set inventory counts for backward compatibility
            const counts: InventoryCount = {};
            inventoryData.forEach((item: InventoryItem) => {
              const matchedLottery = lotteriesData.find((l: Lottery) => l.lottery_id === item.lottery_id);
              if (matchedLottery) {
                counts[matchedLottery.lottery_number] = item.current_count;
              }
            });

            console.log('📊 Inventory counts by game:', counts);
            setInventoryCounts(counts);
          }
        }
      } else {
        console.log('❌ Inventory fetch failed:', inventoryResult.error);

        // Mark all lotteries as not assigned if inventory fetch fails
        const updatedLotteries = lotteriesData.map((lottery: Lottery) => ({
          ...lottery,
          is_assigned: false,
          inventory_count: 0
        }));
        setLotteries(updatedLotteries);
        setInventoryCounts({});
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (error) {
      console.log('❌ ERROR: Failed to load dashboard data:', error);
      setLotteries([]);
      setInventoryCounts({});
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLotteries();
    setRefreshing(false);
  };

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const filteredLotteries = lotteries.filter(lottery =>
    lottery.lottery_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lottery.price.toString().includes(searchQuery)
  );

  const getStockStatus = (start: number, end: number) => {
    const total = end - start + 1;
    const current = Math.floor(total * 0.6); // Mock current stock at 60%
    const percentage = (current / total) * 100;
    if (percentage === 0) return { status: 'sold-out', color: colors.error, label: 'Sold Out' };
    if (percentage <= 20) return { status: 'low', color: colors.warning, label: 'Low Stock' };
    if (percentage <= 50) return { status: 'medium', color: colors.accentOrange, label: 'Medium' };
    return { status: 'good', color: colors.success, label: 'In Stock' };
  };

  const renderLotteryCard = (lottery: Lottery) => {
    const totalTickets = lottery.end_number - lottery.start_number + 1;

    // Check if lottery is active from lottery department
    const isDepartmentActive = lottery.status?.toLowerCase() === 'active';

    // Check if lottery is assigned to this store (based on active inventory)
    const isAssignedToStore = lottery.is_assigned === true;

    // Get REAL inventory count for this game
    const currentStock = lottery.inventory_count || inventoryCounts[lottery.lottery_number] || 0;
    const stockPercentage = totalTickets > 0 ? (currentStock / totalTickets) * 100 : 0;

    // Determine stock status based on actual inventory
    let stockInfo;
    if (currentStock === 0) {
      stockInfo = { status: 'sold-out', color: colors.error, label: 'No Stock' };
    } else if (stockPercentage <= 20) {
      stockInfo = { status: 'low', color: colors.warning, label: 'Low Stock' };
    } else if (stockPercentage <= 50) {
      stockInfo = { status: 'medium', color: colors.accentOrange, label: 'Medium Stock' };
    } else {
      stockInfo = { status: 'good', color: colors.success, label: 'In Stock' };
    }

    const priceNum = parseFloat(lottery.price);

    return (
      <TouchableOpacity
        key={lottery.lottery_id}
        style={styles.lotteryCard}
        onPress={() => navigation.navigate('StoreLotteryGameDetail', {
          game: lottery,
          storeId,
          storeName
        })}
        activeOpacity={0.7}
      >
        {/* Status Indicator Dot */}
        <View style={[styles.statusDot, { backgroundColor: stockInfo.color }]} />

        {/* Lottery Image */}
        {lottery.image_url ? (
          <Image
            source={{ uri: lottery.image_url }}
            style={styles.lotteryImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight + '15' }]}>
            <Ionicons name="ticket" size={32} color={colors.primary} />
          </View>
        )}

        {/* Name */}
        <Text style={styles.lotteryName} numberOfLines={2}>{lottery.lottery_name}</Text>

        {/* Price */}
        <Text style={styles.lotteryPrice}>${priceNum.toFixed(2)}</Text>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${stockPercentage}%`,
                  backgroundColor: stockInfo.color
                }
              ]}
            />
          </View>
        </View>

        {/* Stock Info */}
        <View style={styles.stockInfoContainer}>
          <View style={styles.stockRow}>
            <Ionicons name="cube-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.stockLabel}>Your Stock: </Text>
            <Text style={[styles.stockValue, { color: stockInfo.color }]}>
              {currentStock === 0 ? 'None' : `${currentStock} tickets`}
            </Text>
          </View>
          {currentStock > 0 && (
            <Text style={styles.stockPercentage}>
              {stockPercentage.toFixed(0)}% of capacity
            </Text>
          )}
          {currentStock === 0 && (
            <Text style={[styles.noStockText, { color: colors.error }]}>
              Tap to scan or order
            </Text>
          )}
        </View>

        {/* Inactive Overlay - Shows when lottery is not activated for this store */}
        {!isAssignedToStore && (
          <View style={styles.inactiveOverlay}>
            <View style={styles.inactiveBadge}>
              <Ionicons name="lock-closed" size={24} color={colors.white} />
              <Text style={styles.inactiveText}>NOT ACTIVATED</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colorScheme === 'dark' ? colors.background : colors.primary}
      />

      {/* Fixed Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{storeName}</Text>
            <Text style={styles.headerSubtitle}>Available Lottery Games - {state}</Text>
          </View>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => navigation.navigate('PrintReport', { storeId: route.params.storeId, storeName })}
          >
            <Ionicons name="bar-chart" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or price..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{lotteries.length}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{filteredLotteries.length}</Text>
            <Text style={styles.statLabel}>Showing</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {lotteries.filter(l => {
                const stock = inventoryCounts[l.lottery_number] || 0;
                return stock === 0;
              }).length}
            </Text>
            <Text style={styles.statLabel}>No Stock</Text>
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={16} color={colors.primary} />
          <Text style={styles.infoBannerText}>
            {lotteries.filter(l => l.is_assigned).length} activated • {lotteries.filter(l => !l.is_assigned).length} not activated
          </Text>
        </View>
      </View>

      {/* Scrollable Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading lottery games...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {filteredLotteries.length > 0 ? (
            <View style={styles.gridContainer}>
              {filteredLotteries.map(renderLotteryCard)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color={colors.textMuted} />
              <Text style={styles.emptyStateTitle}>
                {lotteries.length === 0 ? 'No Lottery Games' : 'No Results Found'}
              </Text>
              <Text style={styles.emptyStateText}>
                {lotteries.length === 0
                  ? `No lottery games available for ${state || 'this state'} yet`
                  : 'Try adjusting your search terms'}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Fixed Floating Scan Button */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate('ScanTicket', { storeId: route.params.storeId, storeName })}
        activeOpacity={0.8}
      >
        <Ionicons name="scan" size={28} color={colors.white} />
        <Text style={styles.scanButtonLabel}>Scan</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, colorScheme: 'light' | 'dark' | null | undefined) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colorScheme === 'dark' ? colors.surface : colors.primary,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colorScheme === 'dark' ? colors.textPrimary : colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colorScheme === 'dark' ? colors.textSecondary : colors.white,
    opacity: 0.9,
  },
  reportButton: {
    backgroundColor: colorScheme === 'dark' ? colors.primary : colors.secondary,
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colorScheme === 'dark' ? colors.background : colors.white + '20',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: colorScheme === 'dark' ? 1 : 0,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colorScheme === 'dark' ? colors.textPrimary : colors.white,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colorScheme === 'dark' ? colors.background : colors.white + '15',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colorScheme === 'dark' ? colors.textPrimary : colors.white,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colorScheme === 'dark' ? colors.textSecondary : colors.white,
    opacity: 0.85,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colorScheme === 'dark' ? colors.border : colors.white + '30',
  },
  scrollContent: {
    flexGrow: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    paddingBottom: 100,
    gap: 12,
  },
  lotteryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    width: '48%',
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: colorScheme === 'dark' ? colors.border : colors.border + '40',
    position: 'relative',
  },
  iconContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  lotteryImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },
  statusDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.surface,
    zIndex: 10,
  },
  lotteryName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 18,
    marginBottom: 6,
    minHeight: 36,
  },
  lotteryPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  stockInfoContainer: {
    marginTop: 8,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stockLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  stockValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  stockPercentage: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 18,
  },
  noStockText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 18,
    fontStyle: 'italic',
  },
  inactiveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  inactiveBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  inactiveText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scanButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: colors.accent,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  scanButtonLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
    marginTop: 2,
    textTransform: 'uppercase',
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
});
