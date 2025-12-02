import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type LotteryDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LotteryDetail'>;
type LotteryDetailScreenRouteProp = RouteProp<RootStackParamList, 'LotteryDetail'>;

type Props = {
  navigation: LotteryDetailScreenNavigationProp;
  route: LotteryDetailScreenRouteProp;
};

type Ticket = {
  number: number;
  sold: boolean;
  soldDate?: string;
  customerName?: string;
};

const generateTickets = (total: number, current: number): Ticket[] => {
  const tickets: Ticket[] = [];
  const soldCount = total - current;

  for (let i = 1; i <= total; i++) {
    const isSold = i <= soldCount;
    tickets.push({
      number: i,
      sold: isSold,
      soldDate: isSold ? '2025-12-01' : undefined,
      customerName: isSold ? `Customer ${i}` : undefined,
    });
  }
  return tickets;
};

export default function LotteryDetailScreen({ route, navigation }: Props) {
  const { lottery } = route.params;
  const tickets = generateTickets(lottery.totalCount, lottery.currentCount);
  const soldCount = lottery.totalCount - lottery.currentCount;
  const soldRevenue = soldCount * lottery.price;

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.imageContainer}>
          <Text style={styles.lotteryImage}>{lottery.image}</Text>
        </View>
        <Text style={styles.lotteryName}>{lottery.name}</Text>
        <Text style={styles.lotteryPrice}>${lottery.price} per ticket</Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{lottery.totalCount}</Text>
            <Text style={styles.statLabel}>Total Tickets</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxMiddle]}>
            <Text style={[styles.statNumber, { color: '#4caf50' }]}>{lottery.currentCount}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#f44336' }]}>{soldCount}</Text>
            <Text style={styles.statLabel}>Sold</Text>
          </View>
        </View>

        {/* Revenue */}
        <View style={styles.revenueContainer}>
          <Text style={styles.revenueLabel}>Total Revenue</Text>
          <Text style={styles.revenueAmount}>${soldRevenue}</Text>
        </View>
      </View>

      {/* Ticket Grid */}
      <View style={styles.gridSection}>
        <Text style={styles.sectionTitle}>Ticket Numbers</Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.ticketAvailable]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.ticketSold]} />
            <Text style={styles.legendText}>Sold</Text>
          </View>
        </View>

        <View style={styles.ticketGrid}>
          {tickets.map((ticket) => (
            <TouchableOpacity
              key={ticket.number}
              style={[
                styles.ticket,
                ticket.sold ? styles.ticketSold : styles.ticketAvailable,
              ]}
              onPress={() => {}}
            >
              <Text
                style={[
                  styles.ticketNumber,
                  ticket.sold ? styles.ticketNumberSold : styles.ticketNumberAvailable,
                ]}
              >
                {ticket.number}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  lotteryImage: {
    fontSize: 64,
  },
  lotteryName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  lotteryPrice: {
    fontSize: 18,
    color: '#6200ee',
    fontWeight: '600',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statBoxMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e0e0e0',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  revenueContainer: {
    backgroundColor: '#e8f5e9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  revenueLabel: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
    marginBottom: 4,
  },
  revenueAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  gridSection: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 30,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  ticketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  ticket: {
    width: 45,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  ticketAvailable: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  ticketSold: {
    backgroundColor: '#c8e6c9',
    borderColor: '#4caf50',
  },
  ticketNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  ticketNumberAvailable: {
    color: '#1976d2',
  },
  ticketNumberSold: {
    color: '#388e3c',
  },
});
