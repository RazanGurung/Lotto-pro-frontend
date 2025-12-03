import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, StatusBar, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';

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

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const renderLotteryCard = (lottery: ScratchOffLottery) => {
    return (
      <TouchableOpacity
        key={lottery.id}
        style={styles.lotteryCard}
        onPress={() => navigation.navigate('LotteryDetail', { lottery })}
      >
        <View style={styles.imageContainer}>
          <Text style={styles.lotteryImage}>{lottery.image}</Text>
        </View>
        <View style={styles.lotteryInfo}>
          <Text style={styles.lotteryName}>{lottery.name}</Text>
          <Text style={styles.lotteryPrice}>${lottery.price}</Text>
          <View style={styles.countContainer}>
            <View style={styles.countBadge}>
              <Text style={styles.countLabel}>Current</Text>
              <Text style={styles.countNumber}>{lottery.currentCount}</Text>
            </View>
            <Text style={styles.countSeparator}>/</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countLabel}>Total</Text>
              <Text style={styles.countNumber}>{lottery.totalCount}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Fixed Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>{storeName}</Text>
            <Text style={styles.headerSubtitle}>Scratch-Off Lottery Inventory</Text>
          </View>
          <TouchableOpacity
            style={styles.printButton}
            onPress={() => navigation.navigate('PrintReport', { storeId: route.params.storeId, storeName })}
          >
            <Text style={styles.printButtonText}>📊 Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView>
        <View style={styles.gridContainer}>
          {MOCK_SCRATCH_OFF_LOTTERIES.map(renderLotteryCard)}
        </View>
      </ScrollView>

      {/* Fixed Floating Scan Button */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate('ScanTicket', { storeId: route.params.storeId, storeName })}
      >
        <Text style={styles.scanButtonText}>📷</Text>
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
    backgroundColor: colorScheme === 'dark' ? colors.background : colors.primary,
    padding: 20,
    paddingTop: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.9,
  },
  printButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  printButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  logoutButton: {
    backgroundColor: colors.error,
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  logoutButtonText: {
    fontSize: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  lotteryCard: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: 6,
    width: '23.5%',
    marginBottom: 8,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.backgroundDark,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  lotteryImage: {
    fontSize: 24,
  },
  lotteryInfo: {
    width: '100%',
    alignItems: 'center',
  },
  lotteryName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  lotteryPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 3,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    alignItems: 'center',
  },
  countLabel: {
    fontSize: 7,
    color: colors.primary,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  countNumber: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: 'bold',
  },
  countSeparator: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: 'bold',
    marginHorizontal: 2,
  },
  scanButton: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    backgroundColor: colors.accent,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  scanButtonText: {
    fontSize: 28,
  },
  scanButtonLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 2,
  },
});
