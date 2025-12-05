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
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Game Image */}
        <View style={styles.imageContainer}>
          {game.imageUrl ? (
            <Image source={{ uri: game.imageUrl }} style={styles.gameImage} resizeMode="cover" />
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
              <Text style={styles.gameName}>{game.name}</Text>
              <Text style={styles.gameNumber}>Game #{game.gameNumber}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: game.available ? colors.success + '15' : colors.textMuted + '15' }]}>
              <View style={[styles.statusDot, { backgroundColor: game.available ? colors.success : colors.textMuted }]} />
              <Text style={[styles.statusText, { color: game.available ? colors.success : colors.textMuted }]}>
                {game.available ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Ticket Price</Text>
            <View style={[styles.priceContainer, { backgroundColor: getPriceColor(game.price) + '15' }]}>
              <Text style={[styles.priceText, { color: getPriceColor(game.price) }]}>${game.price}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailBox}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="trophy" size={24} color={colors.warning} />
              </View>
              <Text style={styles.detailLabel}>Top Prize</Text>
              <Text style={styles.detailValue}>{game.topPrize}</Text>
            </View>

            <View style={styles.detailBox}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="analytics" size={24} color={colors.info} />
              </View>
              <Text style={styles.detailLabel}>Overall Odds</Text>
              <Text style={styles.detailValue}>{game.odds}</Text>
            </View>

            <View style={styles.detailBox}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="calendar" size={24} color={colors.primary} />
              </View>
              <Text style={styles.detailLabel}>Launch Date</Text>
              <Text style={styles.detailValue}>{game.launchDate}</Text>
            </View>

            <View style={styles.detailBox}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="pricetag" size={24} color={colors.success} />
              </View>
              <Text style={styles.detailLabel}>Game Number</Text>
              <Text style={styles.detailValue}>#{game.gameNumber}</Text>
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
            <Text style={styles.infoValue}>{game.available ? 'Available for Purchase' : 'Not Available'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Price Point Category</Text>
            <Text style={styles.infoValue}>
              {game.price >= 20 ? 'Premium' : game.price >= 10 ? 'High' : game.price >= 5 ? 'Medium' : 'Budget'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Game Type</Text>
            <Text style={styles.infoValue}>Scratch-Off Lottery</Text>
          </View>

          {game.startNumber && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Start Number</Text>
              <Text style={styles.infoValue}>{game.startNumber}</Text>
            </View>
          )}

          {game.endNumber && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>End Number</Text>
              <Text style={styles.infoValue}>{game.endNumber}</Text>
            </View>
          )}

          {game.startNumber && game.endNumber && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Tickets</Text>
              <Text style={styles.infoValue}>
                {(parseInt(game.endNumber) - parseInt(game.startNumber) + 1).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => console.log('Edit game')}
          >
            <Ionicons name="create-outline" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Edit Game</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: game.available ? colors.textMuted : colors.success }]}
            onPress={() => console.log('Toggle availability')}
          >
            <Ionicons
              name={game.available ? 'pause-outline' : 'play-outline'}
              size={20}
              color={colors.white}
            />
            <Text style={styles.actionButtonText}>
              {game.available ? 'Deactivate' : 'Activate'}
            </Text>
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
    height: 250,
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
