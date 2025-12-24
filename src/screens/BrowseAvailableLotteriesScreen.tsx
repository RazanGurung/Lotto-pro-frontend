import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, useColorScheme, TextInput, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { lotteryService, ticketService } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

type BrowseAvailableLotteriesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BrowseAvailableLotteries'>;
type BrowseAvailableLotteriesScreenRouteProp = RouteProp<RootStackParamList, 'BrowseAvailableLotteries'>;

type Props = {
  navigation: BrowseAvailableLotteriesScreenNavigationProp;
  route: BrowseAvailableLotteriesScreenRouteProp;
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
  is_assigned?: boolean;
  inventory_count?: number;
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

export default function BrowseAvailableLotteriesScreen({ route, navigation }: Props) {
  const colors = useTheme();
  const colorScheme = useColorScheme();
  const styles = createStyles(colors, colorScheme);
  const { storeId, storeName, state } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchAvailableLotteries();
    }, [state])
  );

  const fetchAvailableLotteries = async () => {
    try {
      setLoading(true);

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🛒 BROWSE AVAILABLE: Loading Data');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🏪 Store ID:', storeId);
      console.log('📍 State:', state);

      // Fetch lottery types
      const lotteriesResult = await lotteryService.getLotteryTypes(parseInt(storeId, 10));
      let lotteriesData: Lottery[] = [];

      if (lotteriesResult.success && lotteriesResult.data) {
        lotteriesData = lotteriesResult.data.lotteryTypes ||
                        lotteriesResult.data.lotteries ||
                        (Array.isArray(lotteriesResult.data) ? lotteriesResult.data : []);
      } else {
        console.log('❌ Lotteries fetch failed:', lotteriesResult.error);
        setLotteries([]);
        setLoading(false);
        return;
      }

      // Fetch inventory data to determine what's NOT assigned
      const inventoryResult = await ticketService.getStoreInventory(parseInt(storeId, 10));

      if (inventoryResult.success && inventoryResult.data) {
        const inventoryData: InventoryItem[] = inventoryResult.data.inventory || inventoryResult.data.data || inventoryResult.data;

        if (Array.isArray(inventoryData)) {
          // Match inventory with lotteries
          const updatedLotteries = lotteriesData.map((lottery: Lottery) => {
            const inventoryItem = inventoryData.find(
              (item: InventoryItem) => item.lottery_id === lottery.lottery_id && item.status === 'active'
            );

            return {
              ...lottery,
              is_assigned: !!inventoryItem,
              inventory_count: inventoryItem?.current_count || 0
            };
          });

          // Filter to show ONLY non-activated lotteries
          const nonActivatedLotteries = updatedLotteries.filter((lottery: Lottery) => !lottery.is_assigned);

          console.log('📋 Total non-activated lotteries:', nonActivatedLotteries.length);

          // Sort by price (ascending)
          const sortedLotteries = [...nonActivatedLotteries].sort((a: Lottery, b: Lottery) => {
            const priceA = parseFloat(a.price) || 0;
            const priceB = parseFloat(b.price) || 0;
            return priceA - priceB;
          });

          setLotteries(sortedLotteries);
        }
      } else {
        console.log('❌ Inventory fetch failed, showing all lotteries');
        setLotteries(lotteriesData);
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (error) {
      console.log('❌ ERROR: Failed to load available lotteries:', error);
      setLotteries([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAvailableLotteries();
    setRefreshing(false);
  };

  const filteredLotteries = lotteries.filter(lottery =>
    lottery.lottery_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lottery.price.toString().includes(searchQuery)
  );

  const renderLotteryCard = (lottery: Lottery) => {
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
        {/* Badge - Not in Store */}
        <View style={styles.notInStoreBadge}>
          <Ionicons name="alert-circle" size={12} color={colors.white} />
          <Text style={styles.notInStoreBadgeText}>NOT IN STORE</Text>
        </View>

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

        {/* Info */}
        <View style={styles.infoContainer}>
          <View style={[styles.infoRow, { backgroundColor: colors.warning + '15', padding: 8, borderRadius: 6, marginBottom: 6 }]}>
            <Ionicons name="information-circle" size={14} color={colors.warning} />
            <Text style={[styles.infoLabel, { color: colors.warning, fontWeight: '600' }]}>Not in your store</Text>
          </View>
          <Text style={styles.tapHint}>Tap to view details & add</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Available Lotteries</Text>
          <Text style={styles.headerSubtitle}>
            Browse lotteries from {state} lottery department
          </Text>
        </View>
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

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={16} color={colors.primary} />
        <Text style={styles.infoBannerText}>
          {lotteries.length} lotteries available. Scan or order to add them to your store.
        </Text>
      </View>

      {/* Scrollable Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading available lotteries...</Text>
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
              <Ionicons name="checkmark-circle-outline" size={64} color={colors.success} />
              <Text style={styles.emptyStateTitle}>
                {lotteries.length === 0 ? 'All Lotteries Activated!' : 'No Results Found'}
              </Text>
              <Text style={styles.emptyStateText}>
                {lotteries.length === 0
                  ? 'You have activated all available lotteries from the lottery department.'
                  : 'Try adjusting your search terms'}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: any, colorScheme: 'light' | 'dark' | null | undefined) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 8,
    gap: 8,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    paddingBottom: 40,
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
    borderWidth: 2,
    borderColor: colors.warning + '50',
    position: 'relative',
  },
  notInStoreBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  notInStoreBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 0.5,
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
  infoContainer: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  tapHint: {
    fontSize: 11,
    color: colors.primary,
    marginLeft: 18,
    fontStyle: 'italic',
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
    paddingHorizontal: 40,
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
