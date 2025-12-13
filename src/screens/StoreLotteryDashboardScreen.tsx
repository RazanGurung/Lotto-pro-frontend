/**
 * Store Lottery Dashboard Screen
 * Displays lottery inventory, sales, and stock levels for a specific store
 */

console.log('=== StoreLotteryDashboardScreen.tsx FILE LOADED ===');

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import { ticketService, lotteryService } from '../services/api';
import { getUserFriendlyError } from '../utils/errors';
import AsyncStorage from '@react-native-async-storage/async-storage';

type StoreLotteryDashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'StoreLotteryDashboard'>;
type StoreLotteryDashboardRouteProp = RouteProp<RootStackParamList, 'StoreLotteryDashboard'>;

type Props = {
  navigation: StoreLotteryDashboardNavigationProp;
  route: StoreLotteryDashboardRouteProp;
};

// Cache configuration
const LOTTERY_TYPES_CACHE_KEY = 'lottery_types_cache';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

interface InventoryBook {
  id: number;
  store_id: number;
  lottery_id: number;
  serial_number: string;
  total_count: number; // Total number of tickets in book (e.g., 30 for tickets 0-29)
  current_count: number; // Current ticket number scanned (e.g., 7 means ticket #7)
  direction: 'asc' | 'desc';
  status: string; // Book status: 'active' (unlocked/scanned) or 'inactive' (locked/not scanned yet)
  created_at: string;
}

interface BookInventoryCard {
  // Book details
  book_id: number;
  serial_number: string;
  total_count: number;
  current_count: number; // Remaining tickets count (calculated based on direction)
  direction: 'asc' | 'desc';
  sold_count: number;
  book_value: number;

  // Lottery details (for display)
  lottery_id: number;
  lottery_game_number: string;
  lottery_game_name: string;
  price: number;
  status?: string; // Book status: 'active' (unlocked) or 'inactive' (locked)
  image_url?: string;
}

interface RecentTicket {
  ticket_id: number;
  lottery_game_name: string;
  lottery_game_number: string;
  pack_number: string;
  ticket_number: string;
  scanned_at: string;
  price: number;
}

interface DashboardStats {
  total_inventory_value: number;
  total_games: number;
  total_packs: number;
  total_tickets: number;
  last_updated: string;
}

export default function StoreLotteryDashboardScreen({ navigation, route }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);
  const { storeId, storeName } = route.params;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🖥️  DASHBOARD SCREEN RENDERED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Store ID:', storeId);
  console.log('Store Name:', storeName);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inventory, setInventory] = useState<BookInventoryCard[]>([]);
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  const [lotteryTypes, setLotteryTypes] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_inventory_value: 0,
    total_games: 0,
    total_packs: 0,
    total_tickets: 0,
    last_updated: new Date().toISOString(),
  });

  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 useFocusEffect triggered - about to fetch data');
      fetchDashboardData();
    }, [storeId])
  );

  /**
   * Get cached lottery types if available and not expired
   * Validates that cached data includes image URLs
   */
  const getCachedLotteryTypes = async (storeId: number): Promise<any[] | null> => {
    try {
      const cacheKey = `${LOTTERY_TYPES_CACHE_KEY}_${storeId}`;
      const cached = await AsyncStorage.getItem(cacheKey);

      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;

        if (age < CACHE_DURATION_MS) {
          // Check if data is valid array
          if (!Array.isArray(data) || data.length === 0) {
            console.log('⚠️ Invalid cached data, invalidating cache');
            await AsyncStorage.removeItem(cacheKey);
            return null;
          }

          // Count how many items have images
          const itemsWithImages = data.filter(item => item.image_url).length;
          console.log(`✅ Using cached lottery types (age: ${Math.round(age / 1000 / 60)} min, ${itemsWithImages}/${data.length} with images)`);

          return data;
        } else {
          console.log('⏰ Cache expired, will fetch fresh data');
          await AsyncStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.error('Error reading cache:', error);
    }

    return null;
  };

  /**
   * Save lottery types to cache
   */
  const setCachedLotteryTypes = async (storeId: number, data: any[]) => {
    try {
      // Validate data is a valid array before caching
      if (!Array.isArray(data) || data.length === 0) {
        console.log('⚠️ Not caching empty or invalid data');
        return;
      }

      const cacheKey = `${LOTTERY_TYPES_CACHE_KEY}_${storeId}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));

      const itemsWithImages = data.filter(item => item.image_url).length;
      console.log(`💾 Lottery types cached (${data.length} items, ${itemsWithImages} with images)`);
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📦 LOADING STORE INVENTORY DATA');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🏪 Store ID:', storeId);
      console.log('🏪 Store Name:', storeName);
      console.log('📍 Endpoint: /lottery/store/' + storeId + '/inventory');

      // Check cache for lottery types first
      let lotteryTypesData: any[] | null = await getCachedLotteryTypes(storeId);
      let inventoryResult;

      if (lotteryTypesData) {
        // Cache hit - only fetch inventory
        console.log('📦 Using cached lottery types, fetching inventory only');
        inventoryResult = await ticketService.getStoreInventory(storeId);
      } else {
        // Cache miss - fetch both in parallel
        console.log('📦 Cache miss, fetching both inventory and lottery types');
        const [invResult, lotteryTypesResult] = await Promise.all([
          ticketService.getStoreInventory(storeId),
          lotteryService.getLotteryTypes(storeId)
        ]);

        inventoryResult = invResult;

        console.log('\n🎮 LOTTERY TYPES API RESPONSE:');
        console.log('Success:', lotteryTypesResult.success);

        // Extract and cache lottery types
        if (lotteryTypesResult.success && lotteryTypesResult.data) {
          lotteryTypesData = lotteryTypesResult.data.lotteryTypes || lotteryTypesResult.data.data || lotteryTypesResult.data;
          if (Array.isArray(lotteryTypesData)) {
            console.log('Lottery types loaded:', lotteryTypesData.length);

            // Log first item to check image_url
            if (lotteryTypesData.length > 0) {
              console.log('First lottery type sample:', {
                lottery_id: lotteryTypesData[0].lottery_id,
                lottery_name: lotteryTypesData[0].lottery_name,
                image_url: lotteryTypesData[0].image_url,
                has_image: !!lotteryTypesData[0].image_url
              });
            }

            await setCachedLotteryTypes(storeId, lotteryTypesData);
          }
        } else {
          lotteryTypesData = [];
        }
      }

      // Update state
      if (Array.isArray(lotteryTypesData)) {
        setLotteryTypes(lotteryTypesData);
      }

      console.log('\n📊 INVENTORY API RESPONSE:');
      console.log('Success:', inventoryResult.success);
      console.log('Full Response:', JSON.stringify(inventoryResult, null, 2));

      if (inventoryResult.success && inventoryResult.data) {
        const inventoryData = inventoryResult.data.inventory || inventoryResult.data.data || inventoryResult.data;

        console.log('\n✅ INVENTORY DATA RECEIVED:');
        console.log('Type:', Array.isArray(inventoryData) ? 'Array' : typeof inventoryData);
        console.log('Count:', Array.isArray(inventoryData) ? inventoryData.length : 'N/A');

        if (Array.isArray(inventoryData) && inventoryData.length > 0) {
          console.log('\n📋 INVENTORY ITEMS:');
          inventoryData.forEach((item, index) => {
            console.log(`\nItem ${index + 1}:`, {
              lottery_game_name: item.lottery_game_name || item.lottery_name,
              lottery_game_number: item.lottery_game_number || item.lottery_number,
              pack_number: item.pack_number,
              ticket_number: item.ticket_number,
              price: item.price,
              scanned_at: item.scanned_at
            });
          });
          console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          processTicketData(inventoryData, lotteryTypesData || []);
        } else {
          console.log('\n⚠️ NO INVENTORY ITEMS FOUND');
          console.log('Showing empty state');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          setInventory([]);
          setRecentTickets([]);
        }
      } else {
        console.log('\n❌ INVENTORY FETCH FAILED');
        console.log('Error:', inventoryResult.error);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        setInventory([]);
        setRecentTickets([]);
      }
    } catch (error) {
      console.error('\n💥 ERROR FETCHING INVENTORY:', error);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      Alert.alert('Error', getUserFriendlyError(error));
    } finally {
      setLoading(false);
      console.log('\n✓ Dashboard loading complete');
    }
  };

  const processTicketData = (inventoryBooks: InventoryBook[], lotteryTypesData: any[]) => {
    console.log('=== PROCESSING INVENTORY DATA ===');
    console.log('Total books received:', inventoryBooks.length);
    console.log('Lottery types available:', lotteryTypesData.length);
    console.log('First book sample:', JSON.stringify(inventoryBooks[0], null, 2));

    // Create a map of lottery types by lottery_id for quick lookup
    const lotteryTypeMap = new Map<number, any>();
    lotteryTypesData.forEach(lottery => {
      lotteryTypeMap.set(lottery.lottery_id, lottery);
    });

    // Create individual cards for each book
    const bookCards: BookInventoryCard[] = [];
    const uniqueGameIds = new Set<number>();

    inventoryBooks.forEach((book, index) => {
      console.log(`Processing book ${index}:`, book);
      const lotteryType = lotteryTypeMap.get(book.lottery_id);

      if (!lotteryType) {
        console.warn(`⚠️ No lottery type found for lottery_id ${book.lottery_id}`);
        return;
      }

      console.log(`Lottery type for book ${index}:`, {
        lottery_id: lotteryType.lottery_id,
        lottery_name: lotteryType.lottery_name,
        image_url: lotteryType.image_url,
        has_image: !!lotteryType.image_url
      });

      uniqueGameIds.add(book.lottery_id);

      const price = parseFloat(lotteryType.price) || 0;

      // Calculate sold and remaining based on direction
      // current_count is the current ticket number (e.g., 7)
      // total_count is the total number of tickets (e.g., 30 for tickets 0-29)
      let soldCount = 0;
      let remainingCount = 0;

      if (book.direction === 'asc') {
        // Ascending: tickets sold from 0 upwards (0, 1, 2, ..., current_count)
        // If current_count = 7, then tickets 0-7 are sold (8 tickets)
        soldCount = book.current_count + 1;
        remainingCount = book.total_count - soldCount;
      } else {
        // Descending: tickets sold from max downwards
        // If total = 30 (0-29) and current_count = 7, then tickets 29-8 are sold (22 tickets)
        soldCount = book.total_count - book.current_count - 1;
        remainingCount = book.current_count + 1;
      }

      const bookValue = remainingCount * price;

      console.log(`Book ${index} calculation:`, {
        lottery_name: lotteryType.lottery_name,
        direction: book.direction,
        total_count: book.total_count,
        current_count: book.current_count,
        sold: soldCount,
        remaining: remainingCount,
        bookValue,
        book_status: book.status,
        lottery_status: lotteryType.status
      });

      bookCards.push({
        // Book details
        book_id: book.id,
        serial_number: book.serial_number,
        total_count: book.total_count,
        current_count: remainingCount, // Store remaining count for display
        direction: book.direction,
        sold_count: soldCount,
        book_value: bookValue,

        // Lottery details
        lottery_id: book.lottery_id,
        lottery_game_number: lotteryType.lottery_number,
        lottery_game_name: lotteryType.lottery_name,
        price: price,
        status: book.status, // Use book status from inventory, not lottery type status
        image_url: lotteryType.image_url,
      });
    });

    // Calculate stats
    const totalValue = bookCards.reduce((sum, card) => sum + card.book_value, 0);
    const totalBooks = bookCards.length;
    const totalTickets = bookCards.reduce((sum, card) => sum + card.current_count, 0);
    const totalGames = uniqueGameIds.size;

    console.log('=== PROCESSED RESULTS ===');
    console.log('Total book cards:', bookCards.length);
    console.log('Unique games:', totalGames);
    console.log('Stats:', {
      totalValue,
      totalBooks,
      totalTickets,
      totalGames
    });

    // Debug: Check status values before sorting
    console.log('=== BEFORE SORTING ===');
    console.log('Books before sort:', bookCards.map(b => ({
      name: b.lottery_game_name,
      status: b.status,
      status_lower: b.status?.toLowerCase(),
      price: b.price
    })));

    // Sort books: active first (unlocked), inactive last (locked), then by price (ascending)
    // Create a new array to ensure React detects the state change
    const sortedBookCards = [...bookCards].sort((a, b) => {
      // First sort by status (active/unlocked first, inactive/locked last)
      const aStatus = a.status?.toLowerCase() || '';
      const bStatus = b.status?.toLowerCase() || '';

      // active = unlocked (should appear first)
      // inactive = locked (should appear last)
      const aIsActive = aStatus === 'active' ? 1 : 0;
      const bIsActive = bStatus === 'active' ? 1 : 0;

      console.log(`Comparing: ${a.lottery_game_name} (status="${aStatus}", active=${aIsActive}) vs ${b.lottery_game_name} (status="${bStatus}", active=${bIsActive})`);

      if (aIsActive !== bIsActive) {
        return bIsActive - aIsActive; // Active (1) comes before inactive (0)
      }

      // Then sort by price (ascending)
      return a.price - b.price;
    });

    console.log('=== AFTER SORTING ===');
    console.log('Books sorted: active first (unlocked), inactive last (locked), then by price ascending');
    console.log('All sorted books:');
    sortedBookCards.forEach((book, idx) => {
      const isActive = book.status?.toLowerCase() === 'active';
      console.log(`  ${idx + 1}. ${book.lottery_game_name} - Status: "${book.status}" (${isActive ? 'ACTIVE/UNLOCKED ✓' : 'INACTIVE/LOCKED ✗'}), Price: $${book.price}`);
    });

    setInventory(sortedBookCards);
    setRecentTickets([]); // No recent tickets in this data structure
    setStats({
      total_inventory_value: totalValue,
      total_games: totalGames,
      total_packs: totalBooks,
      total_tickets: totalTickets,
      last_updated: new Date().toISOString(),
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleScanTicket = () => {
    navigation.navigate('ScanTicket', {
      storeId,
      storeName
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading inventory...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{storeName}</Text>
          <Text style={styles.headerSubtitle}>Scanned Tickets Inventory</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <Ionicons name="cash-outline" size={32} color={colors.primary} />
            <Text style={styles.statValue}>{formatCurrency(stats.total_inventory_value)}</Text>
            <Text style={styles.statLabel}>Total Inventory Value</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="game-controller-outline" size={28} color={colors.secondary} />
            <Text style={styles.statValue}>{stats.total_games}</Text>
            <Text style={styles.statLabel}>Active Books</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="albums-outline" size={28} color={colors.accentOrange} />
            <Text style={styles.statValue}>{stats.total_packs}</Text>
            <Text style={styles.statLabel}>Total Books</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="ticket-outline" size={28} color={colors.accentPurple} />
            <Text style={styles.statValue}>{stats.total_tickets}</Text>
            <Text style={styles.statLabel}>Remaining Tickets</Text>
          </View>
        </View>

        {/* Quick Action Button */}
        <TouchableOpacity style={styles.scanButton} onPress={handleScanTicket}>
          <Ionicons name="scan" size={24} color={colors.white} />
          <Text style={styles.scanButtonText}>Scan New Ticket</Text>
        </TouchableOpacity>

        {/* Inventory by Game */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inventory by Game</Text>

          {inventory.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={64} color={colors.textMuted} />
              <Text style={styles.emptyStateTitle}>No Inventory Yet</Text>
              <Text style={styles.emptyStateText}>
                Start scanning lottery tickets to build your inventory
              </Text>
              <TouchableOpacity style={styles.emptyStateButton} onPress={handleScanTicket}>
                <Text style={styles.emptyStateButtonText}>Scan First Ticket</Text>
              </TouchableOpacity>
            </View>
          ) : (
            inventory.map((book, index) => {
              const isActive = book.status?.toLowerCase() === 'active';
              const soldPercentage = (book.sold_count / book.total_count) * 100;

              return (
                <View key={book.book_id} style={styles.inventoryCard}>
                  <View style={styles.inventoryHeader}>
                    {book.image_url ? (
                      <View style={styles.inventoryImageContainer}>
                        <Image
                          source={{ uri: book.image_url }}
                          style={styles.inventoryImage}
                          resizeMode="cover"
                        />
                      </View>
                    ) : (
                      <View style={styles.inventoryIcon}>
                        <Ionicons name="ticket" size={24} color={colors.primary} />
                      </View>
                    )}
                    <View style={styles.inventoryInfo}>
                      <Text style={styles.inventoryGameName}>{book.lottery_game_name}</Text>
                      <Text style={styles.inventoryGameNumber}>Game #{book.lottery_game_number}</Text>
                      <Text style={styles.inventoryPackNumbers}>
                        Book: {book.serial_number}
                      </Text>
                    </View>
                    <View style={styles.inventoryValue}>
                      <Text style={styles.inventoryPrice}>{formatCurrency(book.book_value)}</Text>
                    </View>
                  </View>

                  <View style={styles.inventoryStats}>
                    <View style={styles.inventoryStat}>
                      <Text style={styles.inventoryStatValue}>{book.total_count}</Text>
                      <Text style={styles.inventoryStatLabel}>Total</Text>
                    </View>
                    <View style={styles.inventoryStatDivider} />
                    <View style={styles.inventoryStat}>
                      <Text style={styles.inventoryStatValue}>{book.current_count}</Text>
                      <Text style={styles.inventoryStatLabel}>Remaining</Text>
                    </View>
                    <View style={styles.inventoryStatDivider} />
                    <View style={styles.inventoryStat}>
                      <Text style={styles.inventoryStatValue}>{book.sold_count}</Text>
                      <Text style={styles.inventoryStatLabel}>Sold</Text>
                    </View>
                    <View style={styles.inventoryStatDivider} />
                    <View style={styles.inventoryStat}>
                      <Text style={styles.inventoryStatValue}>{formatCurrency(book.price)}</Text>
                      <Text style={styles.inventoryStatLabel}>Price</Text>
                    </View>
                  </View>

                  <View style={styles.inventoryFooter}>
                    <View style={styles.inventoryProgressContainer}>
                      <View style={styles.inventoryProgressBar}>
                        <View
                          style={[
                            styles.inventoryProgressFill,
                            { width: `${soldPercentage.toFixed(0)}%` }
                          ]}
                        />
                      </View>
                      <Text style={styles.inventoryProgressText}>
                        {soldPercentage.toFixed(1)}% sold • {book.direction === 'asc' ? 'Ascending' : 'Descending'}
                      </Text>
                    </View>
                  </View>

                  {/* Inactive Overlay */}
                  {!isActive && (
                    <View style={styles.inactiveOverlay}>
                      <View style={styles.inactiveBadge}>
                        <Ionicons name="lock-closed" size={20} color={colors.white} />
                        <Text style={styles.inactiveText}>INACTIVE</Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* Recent Activity - Hidden as data not available */}
        {/* {recentTickets.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Scans</Text>

            {recentTickets.map((ticket, index) => (
              <View key={index} style={styles.activityCard}>
                <View style={styles.activityIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityGame}>{ticket.lottery_game_name}</Text>
                  <Text style={styles.activityDetails}>
                    Pack {ticket.pack_number} • Ticket {ticket.ticket_number}
                  </Text>
                </View>
                <View style={styles.activityMeta}>
                  <Text style={styles.activityPrice}>{formatCurrency(ticket.price)}</Text>
                  <Text style={styles.activityTime}>{formatDate(ticket.scanned_at)}</Text>
                </View>
              </View>
            ))}
          </View>
        )} */}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.primary,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    headerTextContainer: {
      flex: 1,
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.textLight,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 13,
      color: colors.textLight,
      opacity: 0.85,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 12,
      gap: 12,
    },
    statCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statCardPrimary: {
      backgroundColor: colors.primary + '15',
      borderColor: colors.primary + '30',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginTop: 8,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
      textAlign: 'center',
    },
    scanButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.secondary,
      marginHorizontal: 20,
      marginVertical: 12,
      padding: 18,
      borderRadius: 12,
      gap: 12,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    scanButtonText: {
      fontSize: 17,
      fontWeight: 'bold',
      color: colors.white,
    },
    section: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 16,
    },
    inventoryCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      position: 'relative',
    },
    inventoryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    inventoryIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    inventoryImageContainer: {
      width: 48,
      height: 48,
      borderRadius: 8,
      overflow: 'hidden',
      marginRight: 12,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inventoryImage: {
      width: '100%',
      height: '100%',
    },
    inventoryInfo: {
      flex: 1,
    },
    inventoryGameName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    inventoryGameNumber: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    inventoryPackNumbers: {
      fontSize: 11,
      color: colors.textMuted,
      fontStyle: 'italic',
    },
    inventoryValue: {
      alignItems: 'flex-end',
    },
    inventoryPrice: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.success,
    },
    inventoryStats: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    inventoryStat: {
      flex: 1,
      alignItems: 'center',
    },
    inventoryStatValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    inventoryStatLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    inventoryStatDivider: {
      width: 1,
      height: 32,
      backgroundColor: colors.border,
    },
    inventoryFooter: {
      marginTop: 12,
    },
    inventoryProgressContainer: {
      width: '100%',
    },
    inventoryProgressBar: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
      marginBottom: 6,
    },
    inventoryProgressFill: {
      height: '100%',
      backgroundColor: colors.success,
      borderRadius: 3,
    },
    inventoryProgressText: {
      fontSize: 11,
      color: colors.textMuted,
      textAlign: 'center',
    },
    inventoryLastScanned: {
      fontSize: 12,
      color: colors.textMuted,
    },
    activityCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 10,
      padding: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    activityIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.success + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    activityInfo: {
      flex: 1,
    },
    activityGame: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    activityDetails: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    activityMeta: {
      alignItems: 'flex-end',
    },
    activityPrice: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    activityTime: {
      fontSize: 11,
      color: colors.textMuted,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 48,
    },
    emptyStateTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyStateText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      paddingHorizontal: 32,
    },
    emptyStateButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    emptyStateButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.white,
    },
    bottomSpacing: {
      height: 40,
    },
    inactiveOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    inactiveBadge: {
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    inactiveText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
  });
