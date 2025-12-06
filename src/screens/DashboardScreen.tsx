import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, StatusBar, useColorScheme, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { lotteryService } from '../services/api';
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
  creator?: {
    super_admin_id: number;
    name: string;
    email: string;
  };
};

export default function DashboardScreen({ route, navigation }: Props) {
  const colors = useTheme();
  const colorScheme = useColorScheme();
  const styles = createStyles(colors, colorScheme);
  const { storeName, state } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
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
      const result = await lotteryService.getLotteries();

      if (result.success && result.data) {
        const lotteriesData = Array.isArray(result.data) ? result.data : result.data.lotteries || [];
        // Filter by state
        const stateLotteries = lotteriesData.filter((lot: Lottery) => lot.state === state);
        setLotteries(stateLotteries);
      } else {
        setLotteries([]);
      }
    } catch (error) {
      setLotteries([]);
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
    const currentStock = Math.floor(totalTickets * 0.6); // Mock current stock
    const stockInfo = getStockStatus(lottery.start_number, lottery.end_number);
    const stockPercentage = (currentStock / totalTickets) * 100;
    const priceNum = parseFloat(lottery.price);

    return (
      <TouchableOpacity
        key={lottery.lottery_id}
        style={styles.lotteryCard}
        onPress={() => navigation.navigate('LotteryGameDetail', { game: lottery })}
        activeOpacity={0.7}
      >
        {/* Status Indicator Dot */}
        <View style={[styles.statusDot, { backgroundColor: stockInfo.color }]} />

        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight + '15' }]}>
          <Ionicons name="ticket" size={32} color={colors.primary} />
        </View>

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

        {/* Count */}
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            <Text style={styles.countCurrent}>{currentStock}</Text>
            <Text style={styles.countSeparator}>/</Text>
            <Text style={styles.countTotal}>{totalTickets}</Text>
          </Text>
          <Text style={[styles.stockStatus, { color: stockInfo.color }]}>
            {stockPercentage.toFixed(0)}%
          </Text>
        </View>
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
            <Text style={styles.headerSubtitle}>Lottery Inventory Management</Text>
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
                const total = l.end_number - l.start_number + 1;
                const current = Math.floor(total * 0.6);
                return (current / total) <= 0.2;
              }).length}
            </Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>
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
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countText: {
    fontSize: 13,
  },
  countCurrent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  countSeparator: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  countTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  stockStatus: {
    fontSize: 12,
    fontWeight: '700',
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
