import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';

type LotteryOrganizationDashboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LotteryOrganizationDashboard'>;
type LotteryOrganizationDashboardScreenRouteProp = RouteProp<RootStackParamList, 'LotteryOrganizationDashboard'>;

type Props = {
  navigation: LotteryOrganizationDashboardScreenNavigationProp;
  route: LotteryOrganizationDashboardScreenRouteProp;
};

type ScratchOffGame = {
  id: string;
  name: string;
  price: number;
  topPrize: string;
  odds: string;
  available: boolean;
  launchDate: string;
  gameNumber: string;
  startNumber?: string;
  endNumber?: string;
  imageUrl?: string;
};

// Mock data - this would come from API based on organization
const MOCK_LOTTERY_GAMES: ScratchOffGame[] = [
  { id: '1', name: 'Lucky 7s', price: 1, topPrize: '$7,777', odds: '1 in 4.5', available: true, launchDate: '2024-01-15', gameNumber: '1234' },
  { id: '2', name: 'Gold Rush', price: 2, topPrize: '$50,000', odds: '1 in 3.8', available: true, launchDate: '2024-02-01', gameNumber: '1235' },
  { id: '3', name: 'Diamond Jackpot', price: 5, topPrize: '$250,000', odds: '1 in 3.2', available: true, launchDate: '2024-01-20', gameNumber: '1236' },
  { id: '4', name: 'Cash Explosion', price: 10, topPrize: '$500,000', odds: '1 in 3.0', available: true, launchDate: '2024-03-01', gameNumber: '1237' },
  { id: '5', name: 'Millionaire Maker', price: 20, topPrize: '$1,000,000', odds: '1 in 2.9', available: true, launchDate: '2024-02-15', gameNumber: '1238' },
  { id: '6', name: 'Triple Play', price: 3, topPrize: '$75,000', odds: '1 in 4.0', available: true, launchDate: '2024-01-10', gameNumber: '1239' },
  { id: '7', name: 'Bonus Bonanza', price: 5, topPrize: '$100,000', odds: '1 in 3.5', available: true, launchDate: '2024-02-20', gameNumber: '1240' },
  { id: '8', name: 'Super Cash', price: 10, topPrize: '$750,000', odds: '1 in 2.8', available: true, launchDate: '2024-03-10', gameNumber: '1241' },
  { id: '9', name: 'Big Money', price: 30, topPrize: '$3,000,000', odds: '1 in 2.5', available: true, launchDate: '2024-02-28', gameNumber: '1242' },
  { id: '10', name: 'Quick Win', price: 1, topPrize: '$5,000', odds: '1 in 5.0', available: false, launchDate: '2023-12-01', gameNumber: '1243' },
  { id: '11', name: 'Treasure Hunt', price: 2, topPrize: '$25,000', odds: '1 in 4.2', available: true, launchDate: '2024-01-25', gameNumber: '1244' },
  { id: '12', name: 'Mega Millions Match', price: 5, topPrize: '$200,000', odds: '1 in 3.3', available: true, launchDate: '2024-03-05', gameNumber: '1245' },
];

export default function LotteryOrganizationDashboardScreen({ navigation, route }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);
  const { organizationId, organizationName, state } = route.params;
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredGames = MOCK_LOTTERY_GAMES.filter(game => {
    if (filter === 'active') return game.available;
    if (filter === 'inactive') return !game.available;
    return true;
  });

  const getPriceColor = (price: number) => {
    if (price >= 20) return colors.error;
    if (price >= 10) return colors.warning;
    if (price >= 5) return colors.info;
    return colors.success;
  };

  const renderGameCard = ({ item }: { item: ScratchOffGame }) => (
    <TouchableOpacity
      style={styles.gameCard}
      activeOpacity={0.7}
      onPress={() => {
        navigation.navigate('LotteryGameDetail', {
          game: item,
        });
      }}
    >
      {/* Game Image */}
      <View style={styles.gameImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.gameImage} resizeMode="cover" />
        ) : (
          <View style={[styles.gameImagePlaceholder, { backgroundColor: colors.backgroundDark }]}>
            <Ionicons name="ticket" size={40} color={colors.textMuted} />
          </View>
        )}
      </View>

      <View style={styles.gameHeader}>
        <View style={[styles.priceTag, { backgroundColor: getPriceColor(item.price) + '15' }]}>
          <Text style={[styles.priceText, { color: getPriceColor(item.price) }]}>${item.price}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.available ? colors.success + '15' : colors.textMuted + '15' }]}>
          <View style={[styles.statusDot, { backgroundColor: item.available ? colors.success : colors.textMuted }]} />
          <Text style={[styles.statusText, { color: item.available ? colors.success : colors.textMuted }]}>
            {item.available ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <Text style={styles.gameName}>{item.name}</Text>
      <Text style={styles.gameNumber}>Game #{item.gameNumber}</Text>

      <View style={styles.gameDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="trophy" size={16} color={colors.warning} />
          <Text style={styles.detailLabel}>Top Prize</Text>
          <Text style={styles.detailValue}>{item.topPrize}</Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailItem}>
          <Ionicons name="analytics" size={16} color={colors.info} />
          <Text style={styles.detailLabel}>Odds</Text>
          <Text style={styles.detailValue}>{item.odds}</Text>
        </View>
      </View>

      <View style={styles.gameFooter}>
        <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
        <Text style={styles.launchDate}>Launched: {item.launchDate}</Text>
      </View>
    </TouchableOpacity>
  );

  const activeGamesCount = MOCK_LOTTERY_GAMES.filter(g => g.available).length;
  const inactiveGamesCount = MOCK_LOTTERY_GAMES.filter(g => !g.available).length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{organizationName}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            All ({MOCK_LOTTERY_GAMES.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'active' && styles.activeFilterTab]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterText, filter === 'active' && styles.activeFilterText]}>
            Active ({activeGamesCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'inactive' && styles.activeFilterTab]}
          onPress={() => setFilter('inactive')}
        >
          <Text style={[styles.filterText, filter === 'inactive' && styles.activeFilterText]}>
            Inactive ({inactiveGamesCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Games List */}
      <FlatList
        data={filteredGames}
        renderItem={renderGameCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => {
          navigation.navigate('AddLotteryGame', {
            state,
            organizationName,
          });
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
    gap: 10,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeFilterText: {
    color: colors.white,
  },
  listContainer: {
    padding: 15,
    paddingTop: 5,
  },
  row: {
    justifyContent: 'space-between',
  },
  gameCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    marginHorizontal: 6,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  gameImageContainer: {
    width: '100%',
    height: 100,
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gameImage: {
    width: '100%',
    height: '100%',
  },
  gameImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  gameName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  gameNumber: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
  },
  gameDetails: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundDark,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  detailLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  gameFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  launchDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 4,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
