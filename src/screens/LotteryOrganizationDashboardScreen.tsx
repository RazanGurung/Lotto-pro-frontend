import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import { lotteryService } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

type LotteryOrganizationDashboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LotteryOrganizationDashboard'>;
type LotteryOrganizationDashboardScreenRouteProp = RouteProp<RootStackParamList, 'LotteryOrganizationDashboard'>;

type Props = {
  navigation: LotteryOrganizationDashboardScreenNavigationProp;
  route: LotteryOrganizationDashboardScreenRouteProp;
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

export default function LotteryOrganizationDashboardScreen({ navigation, route }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);
  const { organizationId, organizationName, state } = route.params;
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
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

  const filteredGames = lotteries.filter(game => {
    if (filter === 'active') return game.status === 'active';
    if (filter === 'inactive') return game.status !== 'active';
    return true;
  });

  const getPriceColor = (price: number) => {
    if (price >= 20) return colors.error;
    if (price >= 10) return colors.warning;
    if (price >= 5) return colors.info;
    return colors.success;
  };

  const renderGameCard = ({ item }: { item: Lottery }) => {
    const priceNum = parseFloat(item.price);
    const isActive = item.status === 'active';

    return (
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
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.gameImage} resizeMode="contain" />
          ) : (
            <View style={[styles.gameImagePlaceholder, { backgroundColor: colors.backgroundDark }]}>
              <Ionicons name="ticket" size={40} color={colors.textMuted} />
            </View>
          )}
        </View>

        <View style={styles.gameHeader}>
          <View style={[styles.priceTag, { backgroundColor: getPriceColor(priceNum) + '15' }]}>
            <Text style={[styles.priceText, { color: getPriceColor(priceNum) }]}>${item.price}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isActive ? colors.success + '15' : colors.textMuted + '15' }]}>
            <View style={[styles.statusDot, { backgroundColor: isActive ? colors.success : colors.textMuted }]} />
            <Text style={[styles.statusText, { color: isActive ? colors.success : colors.textMuted }]}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <Text style={styles.gameName}>{item.lottery_name}</Text>
        <Text style={styles.gameNumber}>Game #{item.lottery_number}</Text>

        <View style={styles.gameDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="receipt" size={16} color={colors.warning} />
            <Text style={styles.detailLabel}>Range</Text>
            <Text style={styles.detailValue}>{item.start_number}-{item.end_number}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Ionicons name="location" size={16} color={colors.info} />
            <Text style={styles.detailLabel}>State</Text>
            <Text style={styles.detailValue}>{item.state}</Text>
          </View>
        </View>

        <View style={styles.gameFooter}>
          <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
          <Text style={styles.launchDate}>
            {item.launch_date
              ? `Launch: ${new Date(item.launch_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
              : `Created: ${new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
            }
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const activeGamesCount = lotteries.filter(g => g.status === 'active').length;
  const inactiveGamesCount = lotteries.filter(g => g.status !== 'active').length;

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
            All ({lotteries.length})
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
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading lottery games...</Text>
        </View>
      ) : filteredGames.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="ticket-outline" size={80} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No Games Found</Text>
          <Text style={styles.emptyText}>
            {filter === 'all'
              ? 'No lottery games available for this state yet'
              : `No ${filter} lottery games available`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredGames}
          renderItem={renderGameCard}
          keyExtractor={(item) => item.lottery_id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}

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
    aspectRatio: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
