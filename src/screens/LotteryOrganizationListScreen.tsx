import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline } from 'react-native-svg';

type Props = {
  navigation: any;
};

type LotteryOrganization = {
  id: string;
  name: string;
  state: string;
  activeStores: number;
  totalRevenue: number;
  status: 'active' | 'inactive';
  trendData: number[];
};

// Helper function to generate realistic trend data
const generateTrendData = (current: number, points: number = 12): number[] => {
  const data: number[] = [];
  let value = current * 0.5; // Start at 50% of current
  const growth = (current - value) / points;
  const volatility = growth * 0.3;

  for (let i = 0; i < points; i++) {
    data.push(Math.max(0, Math.round(value + (Math.random() - 0.5) * volatility)));
    value += growth + (Math.random() - 0.5) * volatility * 0.5;
  }
  data[points - 1] = current; // Ensure last point is current value
  return data;
};

// Mock data for lottery organizations
const LOTTERY_ORGANIZATIONS: LotteryOrganization[] = [
  { id: '1', name: 'North Carolina Education Lottery', state: 'NC', activeStores: 142, totalRevenue: 2450000, status: 'active', trendData: generateTrendData(142) },
  { id: '2', name: 'California State Lottery', state: 'CA', activeStores: 356, totalRevenue: 5780000, status: 'active', trendData: generateTrendData(356) },
  { id: '3', name: 'New York Lottery', state: 'NY', activeStores: 298, totalRevenue: 4920000, status: 'active', trendData: generateTrendData(298) },
  { id: '4', name: 'Florida Lottery', state: 'FL', activeStores: 267, totalRevenue: 4150000, status: 'active', trendData: generateTrendData(267) },
  { id: '5', name: 'Texas Lottery Commission', state: 'TX', activeStores: 312, totalRevenue: 4680000, status: 'active', trendData: generateTrendData(312) },
  { id: '6', name: 'Pennsylvania Lottery', state: 'PA', activeStores: 189, totalRevenue: 3210000, status: 'active', trendData: generateTrendData(189) },
  { id: '7', name: 'Georgia Lottery Corporation', state: 'GA', activeStores: 176, totalRevenue: 2980000, status: 'active', trendData: generateTrendData(176) },
  { id: '8', name: 'Ohio Lottery Commission', state: 'OH', activeStores: 203, totalRevenue: 3450000, status: 'active', trendData: generateTrendData(203) },
  { id: '9', name: 'Michigan Lottery', state: 'MI', activeStores: 167, totalRevenue: 2870000, status: 'active', trendData: generateTrendData(167) },
  { id: '10', name: 'Illinois Lottery', state: 'IL', activeStores: 198, totalRevenue: 3120000, status: 'active', trendData: generateTrendData(198) },
  { id: '11', name: 'New Jersey Lottery', state: 'NJ', activeStores: 154, totalRevenue: 2650000, status: 'active', trendData: generateTrendData(154) },
  { id: '12', name: 'Virginia Lottery', state: 'VA', activeStores: 145, totalRevenue: 2340000, status: 'active', trendData: generateTrendData(145) },
  { id: '13', name: 'Washington Lottery', state: 'WA', activeStores: 134, totalRevenue: 2180000, status: 'active', trendData: generateTrendData(134) },
  { id: '14', name: 'Massachusetts State Lottery', state: 'MA', activeStores: 128, totalRevenue: 2890000, status: 'active', trendData: generateTrendData(128) },
  { id: '15', name: 'Arizona Lottery', state: 'AZ', activeStores: 142, totalRevenue: 2120000, status: 'active', trendData: generateTrendData(142) },
  { id: '16', name: 'Tennessee Education Lottery', state: 'TN', activeStores: 119, totalRevenue: 1980000, status: 'active', trendData: generateTrendData(119) },
  { id: '17', name: 'Indiana Hoosier Lottery', state: 'IN', activeStores: 136, totalRevenue: 2240000, status: 'active', trendData: generateTrendData(136) },
  { id: '18', name: 'Maryland Lottery', state: 'MD', activeStores: 112, totalRevenue: 2450000, status: 'active', trendData: generateTrendData(112) },
  { id: '19', name: 'Wisconsin Lottery', state: 'WI', activeStores: 98, totalRevenue: 1760000, status: 'active', trendData: generateTrendData(98) },
  { id: '20', name: 'Colorado Lottery', state: 'CO', activeStores: 105, totalRevenue: 1890000, status: 'active', trendData: generateTrendData(105) },
  { id: '21', name: 'Missouri Lottery', state: 'MO', activeStores: 124, totalRevenue: 2010000, status: 'active', trendData: generateTrendData(124) },
  { id: '22', name: 'Minnesota State Lottery', state: 'MN', activeStores: 92, totalRevenue: 1650000, status: 'active', trendData: generateTrendData(92) },
  { id: '23', name: 'South Carolina Education Lottery', state: 'SC', activeStores: 89, totalRevenue: 1520000, status: 'active', trendData: generateTrendData(89) },
  { id: '24', name: 'Kentucky Lottery Corporation', state: 'KY', activeStores: 94, totalRevenue: 1680000, status: 'active', trendData: generateTrendData(94) },
  { id: '25', name: 'Oregon Lottery', state: 'OR', activeStores: 87, totalRevenue: 1540000, status: 'active', trendData: generateTrendData(87) },
  { id: '26', name: 'Oklahoma Lottery Commission', state: 'OK', activeStores: 76, totalRevenue: 1320000, status: 'active', trendData: generateTrendData(76) },
  { id: '27', name: 'Connecticut Lottery Corporation', state: 'CT', activeStores: 82, totalRevenue: 1780000, status: 'active', trendData: generateTrendData(82) },
  { id: '28', name: 'Iowa Lottery', state: 'IA', activeStores: 71, totalRevenue: 1240000, status: 'active', trendData: generateTrendData(71) },
  { id: '29', name: 'Kansas Lottery', state: 'KS', activeStores: 68, totalRevenue: 1180000, status: 'active', trendData: generateTrendData(68) },
  { id: '30', name: 'Arkansas Scholarship Lottery', state: 'AR', activeStores: 63, totalRevenue: 1090000, status: 'active', trendData: generateTrendData(63) },
  { id: '31', name: 'Mississippi Lottery Corporation', state: 'MS', activeStores: 58, totalRevenue: 980000, status: 'active', trendData: generateTrendData(58) },
  { id: '32', name: 'Nevada Lottery', state: 'NV', activeStores: 54, totalRevenue: 1450000, status: 'active', trendData: generateTrendData(54) },
  { id: '33', name: 'Louisiana Lottery Corporation', state: 'LA', activeStores: 78, totalRevenue: 1340000, status: 'active', trendData: generateTrendData(78) },
  { id: '34', name: 'West Virginia Lottery', state: 'WV', activeStores: 52, totalRevenue: 890000, status: 'active', trendData: generateTrendData(52) },
  { id: '35', name: 'Nebraska Lottery', state: 'NE', activeStores: 49, totalRevenue: 850000, status: 'active', trendData: generateTrendData(49) },
  { id: '36', name: 'New Mexico Lottery', state: 'NM', activeStores: 46, totalRevenue: 780000, status: 'active', trendData: generateTrendData(46) },
  { id: '37', name: 'Idaho Lottery', state: 'ID', activeStores: 42, totalRevenue: 720000, status: 'active', trendData: generateTrendData(42) },
  { id: '38', name: 'Maine State Lottery', state: 'ME', activeStores: 38, totalRevenue: 650000, status: 'active', trendData: generateTrendData(38) },
  { id: '39', name: 'New Hampshire Lottery', state: 'NH', activeStores: 41, totalRevenue: 710000, status: 'active', trendData: generateTrendData(41) },
  { id: '40', name: 'Rhode Island Lottery', state: 'RI', activeStores: 35, totalRevenue: 620000, status: 'active', trendData: generateTrendData(35) },
  { id: '41', name: 'Vermont Lottery Commission', state: 'VT', activeStores: 28, totalRevenue: 480000, status: 'active', trendData: generateTrendData(28) },
  { id: '42', name: 'Delaware Lottery', state: 'DE', activeStores: 32, totalRevenue: 560000, status: 'active', trendData: generateTrendData(32) },
  { id: '43', name: 'South Dakota Lottery', state: 'SD', activeStores: 26, totalRevenue: 440000, status: 'active', trendData: generateTrendData(26) },
  { id: '44', name: 'North Dakota Lottery', state: 'ND', activeStores: 24, totalRevenue: 410000, status: 'active', trendData: generateTrendData(24) },
  { id: '45', name: 'Montana Lottery', state: 'MT', activeStores: 29, totalRevenue: 490000, status: 'active', trendData: generateTrendData(29) },
  { id: '46', name: 'Wyoming Lottery Corporation', state: 'WY', activeStores: 21, totalRevenue: 360000, status: 'active', trendData: generateTrendData(21) },
  { id: '47', name: 'Alaska Lottery', state: 'AK', activeStores: 18, totalRevenue: 310000, status: 'inactive', trendData: generateTrendData(18) },
  { id: '48', name: 'Hawaii Lottery Commission', state: 'HI', activeStores: 15, totalRevenue: 270000, status: 'inactive', trendData: generateTrendData(15) },
  { id: '49', name: 'Alabama Education Lottery', state: 'AL', activeStores: 67, totalRevenue: 1150000, status: 'active', trendData: generateTrendData(67) },
  { id: '50', name: 'District of Columbia Lottery', state: 'DC', activeStores: 44, totalRevenue: 780000, status: 'active', trendData: generateTrendData(44) },
];

export default function LotteryOrganizationListScreen({ navigation }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOrganizationPress = (organization: LotteryOrganization) => {
    navigation.navigate('LotteryOrganizationDashboard', {
      organizationId: organization.id,
      organizationName: organization.name,
      state: organization.state,
    });
  };

  // Filter organizations based on search query
  const filteredOrganizations = LOTTERY_ORGANIZATIONS.filter(org => {
    const query = searchQuery.toLowerCase();
    return (
      org.name.toLowerCase().includes(query) ||
      org.state.toLowerCase().includes(query)
    );
  });

  // Convert trend data to SVG points
  const getTrendPoints = (data: number[], width: number, height: number): string => {
    if (data.length === 0) return '';

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    });

    return points.join(' ');
  };

  const renderOrganizationItem = ({ item }: { item: LotteryOrganization }) => {
    const graphWidth = 80;
    const graphHeight = 40;
    const trendPoints = getTrendPoints(item.trendData, graphWidth, graphHeight);

    // Determine if trend is going up or down
    const firstValue = item.trendData[0];
    const lastValue = item.trendData[item.trendData.length - 1];
    const isPositiveTrend = lastValue >= firstValue;

    return (
      <TouchableOpacity
        style={styles.organizationCard}
        onPress={() => handleOrganizationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.stateIconContainer}>
            <Text style={styles.stateText}>{item.state}</Text>
          </View>
          <View style={styles.organizationInfo}>
            <Text style={styles.organizationName}>{item.name}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: item.status === 'active' ? colors.success : colors.textMuted }]} />
              <Text style={[styles.statusText, { color: item.status === 'active' ? colors.success : colors.textMuted }]}>
                {item.status === 'active' ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={22} color={colors.primary} />
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Ionicons name="storefront" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{item.activeStores}</Text>
            <Text style={styles.statLabel}>Stores Signed Up</Text>
          </View>

          <View style={styles.trendGraphContainer}>
            <Text style={styles.trendLabel}>Growth Trend</Text>
            <Svg width={graphWidth} height={graphHeight} style={styles.trendGraph}>
              <Polyline
                points={trendPoints}
                fill="none"
                stroke={isPositiveTrend ? colors.success : colors.error}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <View style={styles.trendIndicator}>
              <Ionicons
                name={isPositiveTrend ? 'trending-up' : 'trending-down'}
                size={16}
                color={isPositiveTrend ? colors.success : colors.error}
              />
              <Text style={[styles.trendPercentage, { color: isPositiveTrend ? colors.success : colors.error }]}>
                {Math.round(((lastValue - firstValue) / firstValue) * 100)}%
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderListHeader = () => {
    const totalStores = LOTTERY_ORGANIZATIONS.reduce((sum, org) => sum + org.activeStores, 0);
    const uniqueStates = new Set(LOTTERY_ORGANIZATIONS.map(org => org.state)).size;

    return (
      <View style={styles.listHeaderSection}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>Current Lottery List 🎰</Text>
            <Text style={styles.subtitle}>Manage all lottery organizations</Text>
          </View>
        </View>

        <View style={styles.overviewCards}>
          <View style={[styles.overviewCard, { backgroundColor: colors.primary + '15' }]}>
            <Text style={styles.overviewValue} adjustsFontSizeToFit numberOfLines={1}>{uniqueStates}</Text>
            <Text style={styles.overviewLabel} adjustsFontSizeToFit numberOfLines={2}>States</Text>
          </View>
          <View style={[styles.overviewCard, { backgroundColor: colors.secondary + '15' }]}>
            <Text style={styles.overviewValue} adjustsFontSizeToFit numberOfLines={1}>{totalStores}</Text>
            <Text style={styles.overviewLabel} adjustsFontSizeToFit numberOfLines={2}>Total Stores</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={64} color={colors.textMuted} />
      <Text style={styles.emptyTitle}>No Results Found</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? `No lottery organizations match "${searchQuery}"`
          : 'No lottery organizations found'}
      </Text>
      {searchQuery && (
        <TouchableOpacity style={styles.clearSearchButton} onPress={() => setSearchQuery('')}>
          <Text style={styles.clearSearchButtonText}>Clear Search</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={colors === useTheme() && colors.background === '#F5F5F5' ? 'dark-content' : 'light-content'} backgroundColor={colors.background} />

      {/* Static Header with Search */}
      <View style={styles.staticHeader}>
        {renderListHeader()}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or state..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.resultsHeader}>
          <Text style={styles.organizationsTitle}>
            {searchQuery ? `Results (${filteredOrganizations.length})` : 'All Organizations'}
          </Text>
          {searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearchText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredOrganizations}
        renderItem={renderOrganizationItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  staticHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  listContainer: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  listHeaderSection: {
    paddingBottom: 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  overviewCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 8,
  },
  overviewCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 70,
    justifyContent: 'center',
  },
  overviewValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 13,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  clearButton: {
    padding: 4,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  organizationsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  clearSearchText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  organizationCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 0,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stateIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  organizationInfo: {
    flex: 1,
  },
  organizationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundDark,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  statBox: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  trendGraphContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  trendLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  trendGraph: {
    marginBottom: 4,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendPercentage: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  clearSearchButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  clearSearchButtonText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '600',
  },
});
