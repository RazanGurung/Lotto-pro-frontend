import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';

type LotteryGameDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LotteryGameDetail'>;
type LotteryGameDetailScreenRouteProp = RouteProp<RootStackParamList, 'LotteryGameDetail'>;

type Props = {
  navigation: LotteryGameDetailScreenNavigationProp;
  route: LotteryGameDetailScreenRouteProp;
};

export default function LotteryGameDetailScreen({ navigation, route }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);
  const { game } = route.params;

  const getPriceColor = (price: number) => {
    if (price >= 20) return colors.error;
    if (price >= 10) return colors.warning;
    if (price >= 5) return colors.info;
    return colors.success;
  };

  const priceNum = parseFloat(game.price);
  const isActive = game.status === 'active';
  const totalTickets = game.end_number - game.start_number + 1;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Game Details</Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditLotteryGame', { game })}
        >
          <Ionicons name="create-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

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
        </View>

        {/* Game Info Card */}
        <View style={styles.infoCard}>
          {/* Title and Status */}
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.gameName}>{game.lottery_name}</Text>
              <Text style={styles.gameNumber}>Game #{game.lottery_number}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: isActive ? colors.success + '15' : colors.textMuted + '15' }]}>
              <View style={[styles.statusDot, { backgroundColor: isActive ? colors.success : colors.textMuted }]} />
              <Text style={[styles.statusText, { color: isActive ? colors.success : colors.textMuted }]}>
                {isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Ticket Price</Text>
            <View style={[styles.priceContainer, { backgroundColor: getPriceColor(priceNum) + '15' }]}>
              <Text style={[styles.priceText, { color: getPriceColor(priceNum) }]}>${game.price}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailBox}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="receipt" size={24} color={colors.warning} />
              </View>
              <Text style={styles.detailLabel}>Ticket Range</Text>
              <Text style={styles.detailValue}>{game.start_number}-{game.end_number}</Text>
            </View>

            <View style={styles.detailBox}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="calculator" size={24} color={colors.info} />
              </View>
              <Text style={styles.detailLabel}>Total Tickets</Text>
              <Text style={styles.detailValue}>{totalTickets.toLocaleString()}</Text>
            </View>

            <View style={styles.detailBox}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="calendar" size={24} color={colors.primary} />
              </View>
              <Text style={styles.detailLabel}>Launch Date</Text>
              <Text style={styles.detailValue}>
                {game.launch_date
                  ? new Date(game.launch_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Not Set'}
              </Text>
            </View>

            <View style={styles.detailBox}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="location" size={24} color={colors.success} />
              </View>
              <Text style={styles.detailLabel}>State</Text>
              <Text style={styles.detailValue}>{game.state}</Text>
            </View>
          </View>
        </View>

        {/* Additional Information */}
        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Game Information</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Availability Status</Text>
            <Text style={styles.infoValue}>{isActive ? 'Available for Purchase' : 'Not Available'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Price Point Category</Text>
            <Text style={styles.infoValue}>
              {priceNum >= 20 ? 'Premium' : priceNum >= 10 ? 'High' : priceNum >= 5 ? 'Medium' : 'Budget'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Game Type</Text>
            <Text style={styles.infoValue}>Scratch-Off Lottery</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Lottery Number</Text>
            <Text style={styles.infoValue}>{game.lottery_number}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Start Number</Text>
            <Text style={styles.infoValue}>{game.start_number}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>End Number</Text>
            <Text style={styles.infoValue}>{game.end_number}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created Date</Text>
            <Text style={styles.infoValue}>
              {new Date(game.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          </View>

          {game.creator && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Created By</Text>
              <Text style={styles.infoValue}>{game.creator.name}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('EditLotteryGame', { game })}
          >
            <Ionicons name="create-outline" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Edit Game</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.backgroundDark,
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  gameName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  gameNumber: {
    fontSize: 14,
    color: colors.textMuted,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  priceContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  priceText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
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
  },
  detailIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
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
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginTop: 15,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  bottomPadding: {
    height: 30,
  },
});
