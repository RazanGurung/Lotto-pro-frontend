import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';

type PrintReportScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PrintReport'>;
type PrintReportScreenRouteProp = RouteProp<RootStackParamList, 'PrintReport'>;

type Props = {
  navigation: PrintReportScreenNavigationProp;
  route: PrintReportScreenRouteProp;
};

export default function PrintReportScreen({ route }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);
  const { storeName } = route.params;
  const [selectedDate, setSelectedDate] = useState<'today' | 'yesterday' | 'custom'>('today');

  const handlePrintReport = () => {
    // In production, generate PDF or print report
    Alert.alert('Success', 'Report generated successfully!');
  };

  const getTodayDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Mock report data
  const reportData = {
    totalSales: 450,
    revenue: 2250,
    ticketsSold: [
      { name: 'Lucky 7s', sold: 45, revenue: 45 },
      { name: 'Triple Match', sold: 32, revenue: 64 },
      { name: 'Gold Rush', sold: 28, revenue: 140 },
      { name: 'Diamond Jackpot', sold: 15, revenue: 150 },
    ],
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Generate Daily Report</Text>
          <Text style={styles.storeName}>{storeName}</Text>

        {/* Date Selection */}
        <View style={styles.dateSection}>
          <Text style={styles.sectionTitle}>Select Date</Text>

          <TouchableOpacity
            style={[styles.dateOption, selectedDate === 'today' && styles.dateOptionActive]}
            onPress={() => setSelectedDate('today')}
          >
            <View style={styles.dateOptionContent}>
              <Text style={[styles.dateOptionTitle, selectedDate === 'today' && styles.dateOptionTitleActive]}>
                Today
              </Text>
              <Text style={[styles.dateOptionDate, selectedDate === 'today' && styles.dateOptionDateActive]}>
                {getTodayDate()}
              </Text>
            </View>
            {selectedDate === 'today' && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateOption, selectedDate === 'yesterday' && styles.dateOptionActive]}
            onPress={() => setSelectedDate('yesterday')}
          >
            <View style={styles.dateOptionContent}>
              <Text style={[styles.dateOptionTitle, selectedDate === 'yesterday' && styles.dateOptionTitleActive]}>
                Yesterday
              </Text>
              <Text style={[styles.dateOptionDate, selectedDate === 'yesterday' && styles.dateOptionDateActive]}>
                {getYesterdayDate()}
              </Text>
            </View>
            {selectedDate === 'yesterday' && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateOption, selectedDate === 'custom' && styles.dateOptionActive]}
            onPress={() => setSelectedDate('custom')}
          >
            <View style={styles.dateOptionContent}>
              <Text style={[styles.dateOptionTitle, selectedDate === 'custom' && styles.dateOptionTitleActive]}>
                Custom Date Range
              </Text>
              <Text style={[styles.dateOptionDate, selectedDate === 'custom' && styles.dateOptionDateActive]}>
                Select specific dates
              </Text>
            </View>
            {selectedDate === 'custom' && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        </View>

        {/* Report Preview */}
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>Report Preview</Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Tickets Sold</Text>
              <Text style={styles.summaryValue}>{reportData.totalSales}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Revenue</Text>
              <Text style={[styles.summaryValue, styles.revenue]}>${reportData.revenue}</Text>
            </View>
          </View>

          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Breakdown by Lottery</Text>
            {reportData.ticketsSold.map((item, index) => (
              <View key={index} style={styles.detailRow}>
                <Text style={styles.detailName}>{item.name}</Text>
                <View style={styles.detailStats}>
                  <Text style={styles.detailSold}>{item.sold} sold</Text>
                  <Text style={styles.detailRevenue}>${item.revenue}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>

      {/* Fixed Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.printButton} onPress={handlePrintReport}>
          <Text style={styles.printButtonText}>🖨️ Generate & Print Report</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.exportButton} onPress={handlePrintReport}>
          <Text style={styles.exportButtonText}>📧 Email Report</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 160,
  },
  card: {
    margin: 15,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 5,
  },
  storeName: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 30,
  },
  dateSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  dateOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 10,
    backgroundColor: colors.surface,
  },
  dateOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  dateOptionContent: {
    flex: 1,
  },
  dateOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  dateOptionTitleActive: {
    color: colors.primary,
  },
  dateOptionDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  dateOptionDateActive: {
    color: colors.primary,
  },
  checkmark: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: 'bold',
  },
  previewSection: {
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: colors.backgroundDark,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  revenue: {
    color: colors.secondary,
  },
  detailsCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 15,
  },
  detailsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailName: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  detailStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailSold: {
    fontSize: 13,
    color: colors.textSecondary,
    marginRight: 15,
  },
  detailRevenue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.secondary,
    minWidth: 60,
    textAlign: 'right',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: colors.background,
  },
  printButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  printButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  exportButton: {
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  exportButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
