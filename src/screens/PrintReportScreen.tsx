import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import { ticketService } from '../services/api';
import { getUserFriendlyError } from '../utils/errors';

type PrintReportScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PrintReport'>;
type PrintReportScreenRouteProp = RouteProp<RootStackParamList, 'PrintReport'>;

type Props = {
  navigation: PrintReportScreenNavigationProp;
  route: PrintReportScreenRouteProp;
};

interface BookBreakdown {
  book_id: number;
  lottery_id: number;
  serial_number: string;
  direction: 'asc' | 'desc';
  lottery_name: string;
  lottery_number: string;
  price: string;
  opening_ticket: number;
  closing_ticket: number;
  tickets_sold: number;
  total_sales: string;
  scans_count: number;
}

interface DailyReportData {
  store_id: number;
  date: string;
  total_tickets_sold: number;
  total_revenue: number;
  breakdown: BookBreakdown[];
}

export default function PrintReportScreen({ route }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);
  const { storeId, storeName } = route.params;

  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reportData, setReportData] = useState<DailyReportData | null>(null);

  useEffect(() => {
    fetchDailyReport();
  }, [selectedDate]);

  const fetchDailyReport = async () => {
    try {
      setLoading(true);
      const dateString = formatDateForAPI(selectedDate);

      console.log('Fetching daily report for:', dateString);
      const result = await ticketService.getDailyReport(storeId, dateString);

      if (result.success && result.data) {
        setReportData(result.data);
      } else {
        setReportData(null);
      }
    } catch (error) {
      console.error('Error fetching daily report:', error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const handlePrintReport = () => {
    Alert.alert('Success', 'Report generation feature coming soon!');
  };

  const formatCurrency = (amount: number | string): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `$${num.toFixed(2)}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading report...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Daily Report</Text>
            <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
              <Ionicons name="today" size={20} color={colors.primary} />
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.storeName}>{storeName}</Text>

          {/* Date Navigation */}
          <View style={styles.dateSelector}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => changeDate(-1)}
            >
              <Ionicons name="chevron-back" size={28} color={colors.primary} />
            </TouchableOpacity>

            <View style={styles.dateDisplay}>
              <Text style={styles.dateText}>{formatDateDisplay(selectedDate)}</Text>
            </View>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => changeDate(1)}
              disabled={formatDateForAPI(selectedDate) === formatDateForAPI(new Date())}
            >
              <Ionicons
                name="chevron-forward"
                size={28}
                color={
                  formatDateForAPI(selectedDate) === formatDateForAPI(new Date())
                    ? colors.textMuted
                    : colors.primary
                }
              />
            </TouchableOpacity>
          </View>

          {reportData ? (
            <>
              {/* Report Summary */}
              <View style={styles.previewSection}>
                <Text style={styles.sectionTitle}>Summary</Text>

                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Tickets Sold</Text>
                    <Text style={styles.summaryValue}>{reportData.total_tickets_sold}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Revenue</Text>
                    <Text style={[styles.summaryValue, styles.revenue]}>
                      {formatCurrency(reportData.total_revenue)}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Active Books</Text>
                    <Text style={styles.summaryValue}>{reportData.breakdown.length}</Text>
                  </View>
                </View>
              </View>

              {/* Breakdown by Book */}
              <View style={styles.previewSection}>
                <Text style={styles.sectionTitle}>Sales Breakdown by Book</Text>

                {reportData.breakdown.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="document-outline" size={48} color={colors.textMuted} />
                    <Text style={styles.emptyStateText}>No sales recorded for this date</Text>
                  </View>
                ) : (
                  <View style={styles.detailsCard}>
                    {reportData.breakdown.map((book, index) => (
                      <View key={index} style={styles.bookSection}>
                        <View style={styles.bookHeader}>
                          <View style={styles.bookHeaderLeft}>
                            <Text style={styles.bookGameName}>{book.lottery_name}</Text>
                            <Text style={styles.bookGameNumber}>
                              Game #{book.lottery_number} • Book #{book.serial_number}
                            </Text>
                          </View>
                          <View style={styles.bookRevenue}>
                            <Text style={styles.bookRevenueAmount}>
                              {formatCurrency(book.total_sales)}
                            </Text>
                            <Text style={styles.bookRevenueLabel}>Revenue</Text>
                          </View>
                        </View>

                        <View style={styles.bookStats}>
                          <View style={styles.bookStat}>
                            <Text style={styles.bookStatLabel}>Opening</Text>
                            <Text style={styles.bookStatValue}>{book.opening_ticket}</Text>
                          </View>
                          <View style={styles.bookStatDivider} />
                          <View style={styles.bookStat}>
                            <Text style={styles.bookStatLabel}>Closing</Text>
                            <Text style={styles.bookStatValue}>{book.closing_ticket}</Text>
                          </View>
                          <View style={styles.bookStatDivider} />
                          <View style={styles.bookStat}>
                            <Text style={styles.bookStatLabel}>Sold</Text>
                            <Text style={[styles.bookStatValue, { color: colors.success }]}>
                              {book.tickets_sold}
                            </Text>
                          </View>
                          <View style={styles.bookStatDivider} />
                          <View style={styles.bookStat}>
                            <Text style={styles.bookStatLabel}>Scans</Text>
                            <Text style={styles.bookStatValue}>{book.scans_count}</Text>
                          </View>
                        </View>

                        <View style={styles.bookFooter}>
                          <View style={styles.priceTag}>
                            <Text style={styles.priceTagText}>
                              {formatCurrency(book.price)} each
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.directionBadge,
                              {
                                backgroundColor:
                                  book.direction === 'asc'
                                    ? colors.info + '20'
                                    : colors.warning + '20',
                              },
                            ]}
                          >
                            <Ionicons
                              name={book.direction === 'asc' ? 'arrow-up' : 'arrow-down'}
                              size={14}
                              color={book.direction === 'asc' ? colors.info : colors.warning}
                            />
                            <Text
                              style={[
                                styles.directionText,
                                {
                                  color:
                                    book.direction === 'asc' ? colors.info : colors.warning,
                                },
                              ]}
                            >
                              {book.direction === 'asc' ? 'Ascending' : 'Descending'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color={colors.textMuted} />
              <Text style={styles.emptyStateTitle}>No Report Available</Text>
              <Text style={styles.emptyStateText}>
                No sales data found for {formatDateDisplay(selectedDate)}
              </Text>
            </View>
          )}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.primary + '15',
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  storeName: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundDark,
    marginBottom: 20,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateButton: {
    padding: 8,
  },
  dateDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
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
  bookSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bookHeaderLeft: {
    flex: 1,
  },
  bookGameName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  bookGameNumber: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  bookRevenue: {
    alignItems: 'flex-end',
  },
  bookRevenueAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
  },
  bookRevenueLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  bookStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  bookStat: {
    flex: 1,
    alignItems: 'center',
  },
  bookStatLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  bookStatValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  bookStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  bookFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceTag: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  priceTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  directionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
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
