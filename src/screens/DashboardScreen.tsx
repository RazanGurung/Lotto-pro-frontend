import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, StatusBar, useColorScheme, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

type DashboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
type DashboardScreenRouteProp = RouteProp<RootStackParamList, 'Dashboard'>;

type Props = {
  navigation: DashboardScreenNavigationProp;
  route: DashboardScreenRouteProp;
};

type ScratchOffLottery = {
  id: string;
  name: string;
  price: number;
  totalCount: number;
  currentCount: number;
  image: string;
};

// Mock data - replace with API call (50 different scratch-off lotteries)
const MOCK_SCRATCH_OFF_LOTTERIES: ScratchOffLottery[] = [
  { id: '1', name: 'Lucky 7s', price: 1, totalCount: 100, currentCount: 45, image: '🎰' },
  { id: '2', name: 'Triple Match', price: 2, totalCount: 100, currentCount: 32, image: '💎' },
  { id: '3', name: 'Gold Rush', price: 5, totalCount: 75, currentCount: 28, image: '🏆' },
  { id: '4', name: 'Diamond Jackpot', price: 10, totalCount: 50, currentCount: 15, image: '💰' },
  { id: '5', name: 'Cash Blast', price: 1, totalCount: 100, currentCount: 50, image: '💵' },
  { id: '6', name: 'Money Tree', price: 2, totalCount: 100, currentCount: 38, image: '🌳' },
  { id: '7', name: 'Fortune Cookie', price: 3, totalCount: 75, currentCount: 22, image: '🥠' },
  { id: '8', name: 'Wild Cherries', price: 1, totalCount: 100, currentCount: 41, image: '🍒' },
  { id: '9', name: 'Lucky Clover', price: 5, totalCount: 75, currentCount: 19, image: '🍀' },
  { id: '10', name: 'Star Power', price: 2, totalCount: 100, currentCount: 35, image: '⭐' },
  { id: '11', name: 'Cash Cow', price: 3, totalCount: 75, currentCount: 27, image: '🐄' },
  { id: '12', name: 'Treasure Hunt', price: 10, totalCount: 50, currentCount: 12, image: '🗺️' },
  { id: '13', name: 'Rainbow Riches', price: 1, totalCount: 100, currentCount: 48, image: '🌈' },
  { id: '14', name: 'Royal Flush', price: 5, totalCount: 75, currentCount: 21, image: '👑' },
  { id: '15', name: 'Lucky Dice', price: 2, totalCount: 100, currentCount: 33, image: '🎲' },
  { id: '16', name: 'Money Bag', price: 3, totalCount: 75, currentCount: 25, image: '💰' },
  { id: '17', name: 'Golden Ticket', price: 10, totalCount: 50, currentCount: 8, image: '🎫' },
  { id: '18', name: 'Cash Explosion', price: 1, totalCount: 100, currentCount: 44, image: '💥' },
  { id: '19', name: 'Win Big', price: 5, totalCount: 75, currentCount: 18, image: '🎉' },
  { id: '20', name: 'Jackpot Fever', price: 2, totalCount: 100, currentCount: 31, image: '🔥' },
  { id: '21', name: 'Lucky Numbers', price: 1, totalCount: 100, currentCount: 47, image: '🔢' },
  { id: '22', name: 'Cash Wave', price: 3, totalCount: 75, currentCount: 24, image: '🌊' },
  { id: '23', name: 'Money Mania', price: 5, totalCount: 75, currentCount: 16, image: '💸' },
  { id: '24', name: 'Winning Streak', price: 2, totalCount: 100, currentCount: 36, image: '🏃' },
  { id: '25', name: 'Pot of Gold', price: 10, totalCount: 50, currentCount: 10, image: '🍯' },
  { id: '26', name: 'Fast Cash', price: 1, totalCount: 100, currentCount: 42, image: '⚡' },
  { id: '27', name: 'Lucky Stars', price: 2, totalCount: 100, currentCount: 30, image: '✨' },
  { id: '28', name: 'Cash Bonanza', price: 5, totalCount: 75, currentCount: 20, image: '🎊' },
  { id: '29', name: 'Money Multiplier', price: 3, totalCount: 75, currentCount: 26, image: '✖️' },
  { id: '30', name: 'Mega Bucks', price: 10, totalCount: 50, currentCount: 9, image: '💲' },
  { id: '31', name: 'Lucky Break', price: 1, totalCount: 100, currentCount: 46, image: '🎯' },
  { id: '32', name: 'Cash Prize', price: 2, totalCount: 100, currentCount: 34, image: '🏅' },
  { id: '33', name: 'Golden Fortune', price: 5, totalCount: 75, currentCount: 17, image: '🔱' },
  { id: '34', name: 'Money Magic', price: 3, totalCount: 75, currentCount: 23, image: '🪄' },
  { id: '35', name: 'Jackpot King', price: 10, totalCount: 50, currentCount: 11, image: '👸' },
  { id: '36', name: 'Cash Flow', price: 1, totalCount: 100, currentCount: 43, image: '💧' },
  { id: '37', name: 'Win Spin', price: 2, totalCount: 100, currentCount: 29, image: '🎡' },
  { id: '38', name: 'Lucky Wheel', price: 5, totalCount: 75, currentCount: 14, image: '🎰' },
  { id: '39', name: 'Money Madness', price: 3, totalCount: 75, currentCount: 28, image: '🤪' },
  { id: '40', name: 'Cash Kingdom', price: 10, totalCount: 50, currentCount: 7, image: '🏰' },
  { id: '41', name: 'Lucky Day', price: 1, totalCount: 100, currentCount: 49, image: '☀️' },
  { id: '42', name: 'Instant Win', price: 2, totalCount: 100, currentCount: 37, image: '⚡' },
  { id: '43', name: 'Golden Gates', price: 5, totalCount: 75, currentCount: 13, image: '🚪' },
  { id: '44', name: 'Money Rush', price: 3, totalCount: 75, currentCount: 22, image: '🏃‍♂️' },
  { id: '45', name: 'Super Jackpot', price: 10, totalCount: 50, currentCount: 6, image: '🦸' },
  { id: '46', name: 'Cash Carnival', price: 1, totalCount: 100, currentCount: 40, image: '🎪' },
  { id: '47', name: 'Lucky Spin', price: 2, totalCount: 100, currentCount: 28, image: '🔄' },
  { id: '48', name: 'Gold Mine', price: 5, totalCount: 75, currentCount: 15, image: '⛏️' },
  { id: '49', name: 'Money Storm', price: 3, totalCount: 75, currentCount: 21, image: '⛈️' },
  { id: '50', name: 'Mega Fortune', price: 10, totalCount: 50, currentCount: 5, image: '🎰' },
];

export default function DashboardScreen({ route, navigation }: Props) {
  const colors = useTheme();
  const colorScheme = useColorScheme();
  const styles = createStyles(colors, colorScheme);
  const { storeName } = route.params;
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const filteredLotteries = MOCK_SCRATCH_OFF_LOTTERIES.filter(lottery =>
    lottery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lottery.price.toString().includes(searchQuery)
  );

  const getStockStatus = (current: number, total: number) => {
    const percentage = (current / total) * 100;
    if (percentage === 0) return { status: 'sold-out', color: colors.error, label: 'Sold Out' };
    if (percentage <= 20) return { status: 'low', color: colors.warning, label: 'Low Stock' };
    if (percentage <= 50) return { status: 'medium', color: colors.accentOrange, label: 'Medium' };
    return { status: 'good', color: colors.success, label: 'In Stock' };
  };

  const renderLotteryCard = (lottery: ScratchOffLottery) => {
    const stockInfo = getStockStatus(lottery.currentCount, lottery.totalCount);
    const stockPercentage = (lottery.currentCount / lottery.totalCount) * 100;

    return (
      <TouchableOpacity
        key={lottery.id}
        style={styles.lotteryCard}
        onPress={() => navigation.navigate('LotteryDetail', { lottery })}
        activeOpacity={0.7}
      >
        {/* Status Indicator Dot */}
        <View style={[styles.statusDot, { backgroundColor: stockInfo.color }]} />

        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight + '15' }]}>
          <Ionicons name="ticket" size={32} color={colors.primary} />
        </View>

        {/* Name */}
        <Text style={styles.lotteryName} numberOfLines={2}>{lottery.name}</Text>

        {/* Price */}
        <Text style={styles.lotteryPrice}>${lottery.price.toFixed(2)}</Text>

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
            <Text style={styles.countCurrent}>{lottery.currentCount}</Text>
            <Text style={styles.countSeparator}>/</Text>
            <Text style={styles.countTotal}>{lottery.totalCount}</Text>
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
            <Text style={styles.statNumber}>{MOCK_SCRATCH_OFF_LOTTERIES.length}</Text>
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
              {MOCK_SCRATCH_OFF_LOTTERIES.filter(l => (l.currentCount / l.totalCount) <= 0.2).length}
            </Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredLotteries.length > 0 ? (
          <View style={styles.gridContainer}>
            {filteredLotteries.map(renderLotteryCard)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyStateTitle}>No Results Found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search terms
            </Text>
          </View>
        )}
      </ScrollView>

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
});
