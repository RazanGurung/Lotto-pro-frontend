import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import { ticketService } from '../services/api';

type StoreLotteryGameDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'StoreLotteryGameDetail'>;
type StoreLotteryGameDetailScreenRouteProp = RouteProp<RootStackParamList, 'StoreLotteryGameDetail'>;

type Props = {
  navigation: StoreLotteryGameDetailScreenNavigationProp;
  route: StoreLotteryGameDetailScreenRouteProp;
};

export default function StoreLotteryGameDetailScreen({ navigation, route }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);
  const { game, storeId, storeName } = route.params;

  const [loading, setLoading] = useState(true);
  const [inventoryCount, setInventoryCount] = useState(0);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      // Fetch inventory for this specific lottery game
      const result = await ticketService.getTickets(storeId, game.lottery_number);

      if (result.success && result.data) {
        const tickets = result.data.tickets || result.data.data || result.data;
        const count = Array.isArray(tickets) ? tickets.length : 0;
        setInventoryCount(count);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriceColor = (price: number) => {
    if (price >= 20) return colors.error;
    if (price >= 10) return colors.warning;
    if (price >= 5) return colors.info;
    return colors.success;
  };

  const priceNum = parseFloat(game.price);
  // Check if lottery is assigned based on inventory (new logic)
  const isAssignedToStore = game.is_assigned === true || game.assigned_to_caller === true;
  const totalTickets = game.end_number - game.start_number + 1;
  const stockPercentage = totalTickets > 0 ? (inventoryCount / totalTickets) * 100 : 0;

  // Determine stock status
  let stockInfo;
  if (inventoryCount === 0) {
    stockInfo = { status: 'none', color: colors.error, label: 'No Stock', icon: 'close-circle' };
  } else if (stockPercentage <= 20) {
    stockInfo = { status: 'low', color: colors.warning, label: 'Low Stock', icon: 'alert-circle' };
  } else if (stockPercentage <= 50) {
    stockInfo = { status: 'medium', color: colors.accentOrange, label: 'Medium Stock', icon: 'radio-button-on' };
  } else {
    stockInfo = { status: 'good', color: colors.success, label: 'Good Stock', icon: 'checkmark-circle' };
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Lottery Details</Text>
          <Text style={styles.headerSubtitle}>{storeName}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.contentWrapper}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Game Image */}
        <View style={styles.imageContainer}>
          {game.image_url ? (
            <Image source={{ uri: game.image_url }} style={styles.gameImage} resizeMode="contain" />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.backgroundDark }]}>
              <Ionicons name="ticket" size={80} color={colors.textMuted} />
            </View>
          )}

          {/* Assignment Status Badge */}
          {!isAssignedToStore && (
            <View style={styles.notAssignedBadge}>
              <Ionicons name="lock-closed" size={16} color={colors.white} />
              <Text style={styles.notAssignedText}>NOT ASSIGNED</Text>
            </View>
          )}
        </View>

        {/* Game Info Card */}
        <View style={styles.infoCard}>
          {/* Title and Price */}
          <View style={styles.titleSection}>
            <Text style={styles.gameName}>{game.lottery_name}</Text>
            <Text style={styles.gameNumber}>Game #{game.lottery_number}</Text>
            <View style={[styles.priceTag, { backgroundColor: getPriceColor(priceNum) + '15' }]}>
              <Text style={[styles.priceText, { color: getPriceColor(priceNum) }]}>${game.price}</Text>
              <Text style={styles.priceLabel}>per ticket</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Inventory Status */}
          <View style={styles.inventorySection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cube" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Your Inventory</Text>
            </View>

            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
            ) : (
              <>
                <View style={styles.inventoryCard}>
                  <View style={[styles.inventoryIconContainer, { backgroundColor: stockInfo.color + '15' }]}>
                    <Ionicons name={stockInfo.icon} size={32} color={stockInfo.color} />
                  </View>
                  <View style={styles.inventoryInfo}>
                    <Text style={styles.inventoryCount}>{inventoryCount}</Text>
                    <Text style={styles.inventoryLabel}>Tickets in Stock</Text>
                    <Text style={[styles.inventoryStatus, { color: stockInfo.color }]}>{stockInfo.label}</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                {inventoryCount > 0 && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${stockPercentage}%`, backgroundColor: stockInfo.color }
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {stockPercentage.toFixed(1)}% of total capacity ({inventoryCount}/{totalTickets})
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Game Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailBox}>
              <View style={[styles.detailIconContainer, { backgroundColor: colors.warning + '15' }]}>
                <Ionicons name="receipt" size={24} color={colors.warning} />
              </View>
              <Text style={styles.detailLabel}>Ticket Range</Text>
              <Text style={styles.detailValue}>{game.start_number}-{game.end_number}</Text>
            </View>

            <View style={styles.detailBox}>
              <View style={[styles.detailIconContainer, { backgroundColor: colors.info + '15' }]}>
                <Ionicons name="calculator" size={24} color={colors.info} />
              </View>
              <Text style={styles.detailLabel}>Total Tickets</Text>
              <Text style={styles.detailValue}>{totalTickets.toLocaleString()}</Text>
            </View>

            <View style={styles.detailBox}>
              <View style={[styles.detailIconContainer, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="location" size={24} color={colors.success} />
              </View>
              <Text style={styles.detailLabel}>State</Text>
              <Text style={styles.detailValue}>{game.state}</Text>
            </View>

            <View style={styles.detailBox}>
              <View style={[styles.detailIconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="calendar" size={24} color={colors.primary} />
              </View>
              <Text style={styles.detailLabel}>Launch Date</Text>
              <Text style={styles.detailValue}>
                {game.launch_date
                  ? new Date(game.launch_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'Not Set'}
              </Text>
            </View>
          </View>
        </View>

        {/* Assignment Information */}
        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Status Information</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Assignment Status</Text>
            <View style={[styles.assignmentBadge, { backgroundColor: isAssignedToStore ? colors.success + '15' : colors.error + '15' }]}>
              <Text style={[styles.assignmentText, { color: isAssignedToStore ? colors.success : colors.error }]}>
                {isAssignedToStore ? 'Assigned' : 'Not Assigned'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Lottery Department Status</Text>
            <View style={[styles.assignmentBadge, { backgroundColor: game.status === 'active' ? colors.success + '15' : colors.textMuted + '15' }]}>
              <Text style={[styles.assignmentText, { color: game.status === 'active' ? colors.success : colors.textMuted }]}>
                {game.status === 'active' ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Price Category</Text>
            <Text style={styles.infoValue}>
              {priceNum >= 20 ? 'Premium' : priceNum >= 10 ? 'High' : priceNum >= 5 ? 'Medium' : 'Budget'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Game Type</Text>
            <Text style={styles.infoValue}>Scratch-Off Lottery</Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* NOT ASSIGNED Overlay - Shows when lottery is not assigned to this store */}
      {!isAssignedToStore && (
        <View style={styles.notAssignedOverlay}>
          <View style={styles.notAssignedOverlayBadge}>
            <Ionicons name="lock-closed" size={28} color={colors.white} />
            <Text style={styles.notAssignedOverlayText}>NOT ASSIGNED</Text>
            <Text style={styles.notAssignedOverlaySubtext}>
              This lottery game is not assigned to your store yet
            </Text>
          </View>
        </View>
      )}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
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
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.backgroundDark,
    position: 'relative',
  },
  gameImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notAssignedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  notAssignedText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 15,
    marginTop: 15,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  gameName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  gameNumber: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 16,
  },
  priceTag: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  priceText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },
  inventorySection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  loader: {
    marginVertical: 20,
  },
  inventoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundDark,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  inventoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  inventoryInfo: {
    flex: 1,
  },
  inventoryCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  inventoryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  inventoryStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  detailBox: {
    width: '50%',
    padding: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  detailIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  assignmentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  assignmentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 30,
  },
  notAssignedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'none', // Allow touch events to pass through to scroll view
  },
  notAssignedOverlayBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    maxWidth: '80%',
    pointerEvents: 'auto', // Keep badge itself clickable (but no buttons inside)
  },
  notAssignedOverlayText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginTop: 12,
    marginBottom: 8,
  },
  notAssignedOverlaySubtext: {
    color: colors.white,
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 20,
  },
});
