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
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reportData, setReportData] = useState<DailyReportData | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<'today' | 'last7' | 'this_month' | 'custom'>('today');

  useEffect(() => {
    fetchDailyReport();
  }, [startDate, endDate, selectedPreset]);

  const fetchDailyReport = async () => {
    try {
      setLoading(true);
      const startDateString = formatDateForAPI(startDate);
      const endDateString = formatDateForAPI(endDate);

      console.log('Fetching report with preset:', selectedPreset);
      console.log('Date range:', startDateString, 'to', endDateString);

      let result;

      switch (selectedPreset) {
        case 'today':
          // Today (default): GET /api/reports/store/10/daily
          result = await ticketService.getDailyReport(storeId);
          break;

        case 'last7':
          // Last 7 days: GET /api/reports/store/10/daily?range=last7
          result = await ticketService.getDailyReport(storeId, { range: 'last7' });
          break;

        case 'this_month':
          // This month: GET /api/reports/store/10/daily?range=this_month
          result = await ticketService.getDailyReport(storeId, { range: 'this_month' });
          break;

        case 'custom':
          // Custom range: GET /api/reports/store/10/daily?range=custom&start_date=2025-12-01&end_date=2025-12-15
          if (startDateString === endDateString) {
            // Specific single date: GET /api/reports/store/10/daily?date=2025-12-15
            result = await ticketService.getDailyReport(storeId, { date: startDateString });
          } else {
            // Date range
            result = await ticketService.getDailyReport(storeId, {
              range: 'custom',
              start_date: startDateString,
              end_date: endDateString,
            });
          }
          break;
      }

      if (result.success && result.data) {
        setReportData(result.data);
      } else {
        setReportData(null);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
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

  const handleTodayPreset = () => {
    const today = new Date();
    setStartDate(today);
    setEndDate(today);
    setSelectedPreset('today');
  };

  const handleLast7DaysPreset = () => {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 7);
    setStartDate(start);
    setEndDate(today);
    setSelectedPreset('last7');
  };

  const handleThisMonthPreset = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(start);
    setEndDate(today);
    setSelectedPreset('this_month');
  };

  const handleCustomDateChange = () => {
    // When user manually changes dates, switch to custom mode
    setSelectedPreset('custom');
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
            <Text style={styles.title}>Sales Report</Text>
          </View>
          <Text style={styles.storeName}>{storeName}</Text>

          {/* Quick Date Range Presets */}
          <View style={styles.presetsContainer}>
            <TouchableOpacity
              onPress={handleTodayPreset}
              style={[styles.presetButton, selectedPreset === 'today' && styles.presetButtonActive]}
            >
              <Text style={[styles.presetButtonText, selectedPreset === 'today' && styles.presetButtonTextActive]}>
                Today
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLast7DaysPreset}
              style={[styles.presetButton, selectedPreset === 'last7' && styles.presetButtonActive]}
            >
              <Text style={[styles.presetButtonText, selectedPreset === 'last7' && styles.presetButtonTextActive]}>
                Last 7 Days
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleThisMonthPreset}
              style={[styles.presetButton, selectedPreset === 'this_month' && styles.presetButtonActive]}
            >
              <Text style={[styles.presetButtonText, selectedPreset === 'this_month' && styles.presetButtonTextActive]}>
                This Month
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date Range Selector */}
          <View style={styles.dateRangeContainer}>
            <View style={styles.dateRangeRow}>
              <View style={styles.dateInputGroup}>
                <Text style={styles.dateLabel}>From</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => {
                    handleCustomDateChange();
                    setShowDatePicker('start');
                  }}
                >
                  <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                  <Text style={styles.dateInputText}>
                    {startDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </TouchableOpacity>
              </View>

              <Ionicons name="arrow-forward" size={20} color={colors.textMuted} style={styles.arrowIcon} />

              <View style={styles.dateInputGroup}>
                <Text style={styles.dateLabel}>To</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => {
                    handleCustomDateChange();
                    setShowDatePicker('end');
                  }}
                >
                  <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                  <Text style={styles.dateInputText}>
                    {endDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Date Picker Modal - Simple Implementation */}
            {showDatePicker && (
              <View style={styles.datePickerModal}>
                <View style={styles.datePickerHeader}>
                  <Text style={styles.datePickerTitle}>
                    Select {showDatePicker === 'start' ? 'Start' : 'End'} Date
                  </Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(null)}>
                    <Ionicons name="close" size={24} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.datePickerNote}>
                  Use the preset buttons above or type a custom date range
                </Text>
              </View>
            )}
          </View>

          {reportData ? (
            <>
              {/* Report Summary */}
              <View style={styles.previewSection}>
                <View style={styles.summaryHeader}>
                  <Text style={styles.sectionTitle}>Summary</Text>
                  <Text style={styles.dateRangeInfo}>
                    {selectedPreset === 'today'
                      ? 'Today'
                      : selectedPreset === 'last7'
                      ? 'Last 7 Days'
                      : selectedPreset === 'this_month'
                      ? 'This Month'
                      : formatDateForAPI(startDate) === formatDateForAPI(endDate)
                      ? formatDateForAPI(startDate)
                      : `${formatDateForAPI(startDate)} to ${formatDateForAPI(endDate)}`}
                  </Text>
                </View>

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
                No sales data found for the selected date range
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
  presetsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  presetButtonTextActive: {
    color: colors.white,
  },
  dateRangeContainer: {
    marginBottom: 20,
  },
  dateRangeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateInputGroup: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.backgroundDark,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateInputText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    flex: 1,
  },
  arrowIcon: {
    marginBottom: 12,
  },
  datePickerModal: {
    marginTop: 15,
    padding: 15,
    backgroundColor: colors.backgroundDark,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  datePickerNote: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateRangeInfo: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    backgroundColor: colors.backgroundDark,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
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
