import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Modal, Platform, Share, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Print from 'expo-print';
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
  const [refreshing, setRefreshing] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reportData, setReportData] = useState<DailyReportData | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<'today' | 'last7' | 'this_month' | 'custom'>('today');
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    fetchDailyReport();
  }, [startDate, endDate]);

  const fetchDailyReport = async () => {
    try {
      // Use refreshing for subsequent loads, loading only for first load
      if (reportData) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

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
        // Show user-friendly error message
        if (result.error) {
          Alert.alert('Error', result.error);
        }
        setReportData(null);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      Alert.alert(
        'Error',
        'Failed to load report. Please check your internet connection and try again.'
      );
      setReportData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const handleTodayPreset = async () => {
    const today = new Date();
    setStartDate(today);
    setEndDate(today);
    setSelectedPreset('today');
    // Fetch immediately without waiting for state updates
    await fetchDailyReport();
  };

  const handleLast7DaysPreset = async () => {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 7);
    setStartDate(start);
    setEndDate(today);
    setSelectedPreset('last7');
    // Fetch immediately without waiting for state updates
    await fetchDailyReport();
  };

  const handleThisMonthPreset = async () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(start);
    setEndDate(today);
    setSelectedPreset('this_month');
    // Fetch immediately without waiting for state updates
    await fetchDailyReport();
  };

  const handleCustomDateChange = () => {
    // When user manually changes dates, switch to custom mode
    setSelectedPreset('custom');
  };

  const generateLotteryReport = (): string => {
    if (!reportData) return '';

    const line = (text: string = '', width: number = 48) => {
      return text.padEnd(width, ' ');
    };

    const centerText = (text: string, width: number = 48) => {
      const padding = Math.floor((width - text.length) / 2);
      return ' '.repeat(padding) + text;
    };

    const divider = '='.repeat(48);
    const thinDivider = '-'.repeat(48);

    let report = '';

    // Header
    report += divider + '\n';
    report += centerText('LOTTERY PRO') + '\n';
    report += centerText('SALES REPORT') + '\n';
    report += divider + '\n';
    report += '\n';

    // Store Information
    report += line(`STORE: ${storeName}`) + '\n';
    report += line(`STORE ID: ${storeId}`) + '\n';
    report += '\n';

    // Date Information
    const reportDate = selectedPreset === 'today'
      ? 'TODAY'
      : selectedPreset === 'last7'
      ? 'LAST 7 DAYS'
      : selectedPreset === 'this_month'
      ? 'THIS MONTH'
      : formatDateForAPI(startDate) === formatDateForAPI(endDate)
      ? formatDateForAPI(startDate)
      : `${formatDateForAPI(startDate)} TO ${formatDateForAPI(endDate)}`;

    report += line(`REPORT PERIOD: ${reportDate}`) + '\n';
    report += line(`GENERATED: ${new Date().toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })}`) + '\n';
    report += '\n';
    report += divider + '\n';
    report += '\n';

    // Summary
    report += centerText('SUMMARY') + '\n';
    report += thinDivider + '\n';
    report += line(`TOTAL TICKETS SOLD: ${reportData.total_tickets_sold}`) + '\n';
    report += line(`TOTAL REVENUE: $${reportData.total_revenue.toFixed(2)}`) + '\n';
    report += line(`TOTAL BOOKS: ${reportData.breakdown?.length || 0}`) + '\n';
    report += '\n';
    report += divider + '\n';
    report += '\n';

    // Book Breakdown
    if (reportData.breakdown && reportData.breakdown.length > 0) {
      report += centerText('BOOK BREAKDOWN') + '\n';
      report += divider + '\n';
      report += '\n';

      reportData.breakdown.forEach((book, index) => {
        report += `BOOK #${index + 1}\n`;
        report += thinDivider + '\n';
        report += line(`GAME: ${book.lottery_name}`) + '\n';
        report += line(`GAME #${book.lottery_number}`) + '\n';
        report += line(`BOOK #${book.serial_number}`) + '\n';
        report += line(`PRICE: $${parseFloat(book.price).toFixed(2)} EACH`) + '\n';
        report += '\n';
        report += line(`OPENING TICKET: ${book.opening_ticket}`) + '\n';
        report += line(`CLOSING TICKET: ${book.closing_ticket}`) + '\n';
        report += line(`DIRECTION: ${book.direction.toUpperCase()}`) + '\n';
        report += '\n';
        report += line(`TICKETS SOLD: ${book.tickets_sold}`) + '\n';
        report += line(`SCANS COUNT: ${book.scans_count}`) + '\n';
        report += line(`TOTAL SALES: $${parseFloat(book.total_sales).toFixed(2)}`) + '\n';
        report += '\n';

        if (index < reportData.breakdown.length - 1) {
          report += thinDivider + '\n';
          report += '\n';
        }
      });

      report += divider + '\n';
      report += '\n';
    }

    // Footer
    report += centerText('TOTAL REVENUE') + '\n';
    report += centerText(`$${reportData.total_revenue.toFixed(2)}`) + '\n';
    report += '\n';
    report += divider + '\n';
    report += centerText('END OF REPORT') + '\n';
    report += divider + '\n';

    return report;
  };

  const handlePrintReport = () => {
    if (!reportData) {
      Alert.alert('No Data', 'No report data available to generate.');
      return;
    }
    setShowPrintModal(true);
  };

  const handleShareReport = async () => {
    if (!reportData) {
      Alert.alert('No Data', 'No report data available to generate.');
      return;
    }

    try {
      const report = generateLotteryReport();

      // Share the report
      await Share.share({
        message: report,
        title: `Lottery Report - ${storeName}`,
      });
    } catch (error) {
      console.error('Error sharing report:', error);
      Alert.alert('Error', 'Failed to generate report. Please try again.');
    }
  };

  const handlePrint = async () => {
    if (!reportData) {
      Alert.alert('No Data', 'No report data available to print.');
      return;
    }

    try {
      // Generate HTML for printing
      const html = generatePrintHTML();

      // Print the document
      await Print.printAsync({
        html,
      });
    } catch (error: any) {
      // Don't show error if user cancelled printing
      if (error?.message?.includes('did not complete') || error?.message?.includes('cancelled')) {
        console.log('Print cancelled by user');
        return;
      }
      console.error('Error printing report:', error);
      Alert.alert('Error', 'Failed to print report. Please try again.');
    }
  };

  const generatePrintHTML = (): string => {
    if (!reportData) return '';

    const periodText = formatDateForAPI(startDate) === formatDateForAPI(endDate)
      ? `${formatDateForAPI(startDate)} (12:00 AM - 11:59 PM)`
      : `${formatDateForAPI(startDate)} to ${formatDateForAPI(endDate)}`;

    const generatedTime = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let booksHTML = '';
    reportData.breakdown.forEach((book, index) => {
      booksHTML += `
        <div style="margin-bottom: 20px; padding-bottom: 20px; ${index < reportData.breakdown.length - 1 ? 'border-bottom: 1px solid #E0E0E0;' : ''}">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <div>
              <div style="font-size: 15px; font-weight: bold; color: #1A1A1A; margin-bottom: 4px;">${book.lottery_name}</div>
              <div style="font-size: 11px; color: #666666; margin-bottom: 8px;">Game #${book.lottery_number} • Book #${book.serial_number}</div>
              <div style="font-size: 12px; font-weight: 600; color: #333333;">$${parseFloat(book.price).toFixed(2)} each</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 20px; font-weight: bold; color: #22C55E;">$${parseFloat(book.total_sales).toFixed(2)}</div>
              <div style="font-size: 9px; color: #999999; margin-top: 2px; text-transform: uppercase;">Revenue</div>
            </div>
          </div>
          <div style="background-color: #F9F9F9; border-radius: 6px; padding: 12px; border: 1px solid #E8E8E8; display: flex; justify-content: space-around;">
            <div style="text-align: center;">
              <div style="font-size: 9px; color: #999999; margin-bottom: 4px; text-transform: uppercase;">Opening</div>
              <div style="font-size: 14px; font-weight: bold; color: #333333;">${book.opening_ticket}</div>
            </div>
            <div style="font-size: 16px; color: #CCCCCC; margin: 0 8px;">→</div>
            <div style="text-align: center;">
              <div style="font-size: 9px; color: #999999; margin-bottom: 4px; text-transform: uppercase;">Closing</div>
              <div style="font-size: 14px; font-weight: bold; color: #333333;">${book.closing_ticket}</div>
            </div>
            <div style="background-color: #22C55E20; padding: 6px 12px; border-radius: 6px; border: 1px solid #22C55E40; text-align: center;">
              <div style="font-size: 9px; color: #22C55E; margin-bottom: 4px; font-weight: bold; text-transform: uppercase;">Sold</div>
              <div style="font-size: 16px; font-weight: bold; color: #22C55E;">${book.tickets_sold}</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 9px; color: #999999; margin-bottom: 4px; text-transform: uppercase;">Scans</div>
              <div style="font-size: 14px; font-weight: bold; color: #333333;">${book.scans_count}</div>
            </div>
          </div>
        </div>
      `;
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Lottery Report - ${storeName}</title>
          <style>
            @page { margin: 20px; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border: 1px solid #E0E0E0;
              border-radius: 8px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div style="padding: 24px; border-bottom: 2px solid #E0E0E0;">
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 28px; font-weight: bold; color: #1A1A1A; margin-top: 8px; letter-spacing: 2px;">LOTTERY PRO</div>
                <div style="font-size: 14px; color: #666666; margin-top: 4px; letter-spacing: 1px;">Sales Report</div>
              </div>
              <div style="height: 1px; background-color: #E0E0E0; margin: 16px 0;"></div>
              <div>
                <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                  <div style="font-size: 13px; font-weight: 600; color: #666666; text-transform: uppercase; letter-spacing: 0.5px;">Store:</div>
                  <div style="font-size: 13px; font-weight: 500; color: #1A1A1A;">${storeName}</div>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                  <div style="font-size: 13px; font-weight: 600; color: #666666; text-transform: uppercase; letter-spacing: 0.5px;">Report Period:</div>
                  <div style="font-size: 13px; font-weight: 500; color: #1A1A1A;">${periodText}</div>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                  <div style="font-size: 13px; font-weight: 600; color: #666666; text-transform: uppercase; letter-spacing: 0.5px;">Generated:</div>
                  <div style="font-size: 13px; font-weight: 500; color: #1A1A1A;">${generatedTime}</div>
                </div>
              </div>
            </div>

            <!-- Summary -->
            <div style="padding: 20px; border-bottom: 1px solid #E0E0E0;">
              <div style="margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #3B82F6;">
                <div style="font-size: 16px; font-weight: bold; color: #1A1A1A; letter-spacing: 1px;">SUMMARY</div>
              </div>
              <div style="display: flex; margin-bottom: 20px; background-color: #F5F5F5; border-radius: 8px; padding: 16px;">
                <div style="flex: 1; text-align: center;">
                  <div style="font-size: 11px; font-weight: 600; color: #666666; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Tickets Sold</div>
                  <div style="font-size: 24px; font-weight: bold; color: #1A1A1A;">${reportData.total_tickets_sold}</div>
                </div>
                <div style="width: 1px; background-color: #D0D0D0; margin: 0 16px;"></div>
                <div style="flex: 1; text-align: center;">
                  <div style="font-size: 11px; font-weight: 600; color: #666666; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Active Books</div>
                  <div style="font-size: 24px; font-weight: bold; color: #1A1A1A;">${reportData.breakdown.length}</div>
                </div>
              </div>
              <div style="background-color: #3B82F615; border-radius: 8px; padding: 16px; text-align: center; border: 2px solid #3B82F640;">
                <div style="font-size: 12px; font-weight: 700; color: #3B82F6; margin-bottom: 6px; letter-spacing: 1.5px;">TOTAL REVENUE</div>
                <div style="font-size: 32px; font-weight: bold; color: #3B82F6;">$${reportData.total_revenue.toFixed(2)}</div>
              </div>
            </div>

            <!-- Detailed Breakdown -->
            ${reportData.breakdown.length > 0 ? `
            <div style="padding: 20px; border-bottom: 1px solid #E0E0E0;">
              <div style="margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #3B82F6;">
                <div style="font-size: 16px; font-weight: bold; color: #1A1A1A; letter-spacing: 1px;">DETAILED BREAKDOWN</div>
              </div>
              ${booksHTML}
            </div>
            ` : ''}

            <!-- Footer -->
            <div style="padding: 24px; text-align: center;">
              <div style="height: 1px; background-color: #E0E0E0; margin-bottom: 12px;"></div>
              <div style="font-size: 12px; font-weight: 600; color: #999999; margin-top: 12px; text-transform: uppercase; letter-spacing: 1px;">End of Report</div>
              <div style="font-size: 11px; color: #BBBBBB; margin-top: 6px;">Printed: ${new Date().toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}</div>
            </div>
          </div>
        </body>
      </html>
    `;
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
              disabled={refreshing}
            >
              <Text style={[styles.presetButtonText, selectedPreset === 'today' && styles.presetButtonTextActive]}>
                Today
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLast7DaysPreset}
              style={[styles.presetButton, selectedPreset === 'last7' && styles.presetButtonActive]}
              disabled={refreshing}
            >
              <Text style={[styles.presetButtonText, selectedPreset === 'last7' && styles.presetButtonTextActive]}>
                Last 7 Days
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleThisMonthPreset}
              style={[styles.presetButton, selectedPreset === 'this_month' && styles.presetButtonActive]}
              disabled={refreshing}
            >
              <Text style={[styles.presetButtonText, selectedPreset === 'this_month' && styles.presetButtonTextActive]}>
                This Month
              </Text>
            </TouchableOpacity>
          </View>

          {/* Loading Indicator */}
          {refreshing && (
            <View style={styles.refreshingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.refreshingText}>Updating report...</Text>
            </View>
          )}

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

        <TouchableOpacity style={styles.exportButton} onPress={handleShareReport}>
          <Text style={styles.exportButtonText}>📧 Email Report</Text>
        </TouchableOpacity>
      </View>

      {/* Print Preview Modal */}
      <Modal
        visible={showPrintModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowPrintModal(false)}
        statusBarTranslucent={false}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'left', 'right']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPrintModal(false)} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Print Preview</Text>
            <View style={styles.modalCloseButton} />
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalScrollContent}>
            {/* Print Button */}
            <View style={styles.printButtonContainer}>
              <TouchableOpacity style={styles.printActionButton} onPress={handlePrint}>
                <Ionicons name="print" size={20} color={colors.white} />
                <Text style={styles.printActionButtonText}>Print Report</Text>
              </TouchableOpacity>
            </View>
            {reportData && (
              <View style={styles.paperContainer}>
                {/* Paper Header */}
                <View style={styles.paperHeader}>
                  <View style={styles.paperHeaderTop}>
                    <Ionicons name="receipt-outline" size={32} color={colors.primary} />
                    <Text style={styles.paperTitle}>LOTTERY PRO</Text>
                    <Text style={styles.paperSubtitle}>Sales Report</Text>
                  </View>

                  <View style={styles.paperDivider} />

                  <View style={styles.paperInfoSection}>
                    <View style={styles.paperInfoRow}>
                      <Text style={styles.paperInfoLabel}>Store:</Text>
                      <Text style={styles.paperInfoValue}>{storeName}</Text>
                    </View>
                    <View style={styles.paperInfoRow}>
                      <Text style={styles.paperInfoLabel}>Report Period:</Text>
                      <Text style={styles.paperInfoValue}>
                        {formatDateForAPI(startDate) === formatDateForAPI(endDate)
                          ? `${formatDateForAPI(startDate)} (12:00 AM - 11:59 PM)`
                          : `${formatDateForAPI(startDate)} to ${formatDateForAPI(endDate)}`}
                      </Text>
                    </View>
                    <View style={styles.paperInfoRow}>
                      <Text style={styles.paperInfoLabel}>Generated:</Text>
                      <Text style={styles.paperInfoValue}>
                        {new Date().toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Summary Section */}
                <View style={styles.paperSection}>
                  <View style={styles.paperSectionHeader}>
                    <Text style={styles.paperSectionTitle}>SUMMARY</Text>
                  </View>

                  <View style={styles.paperSummaryGrid}>
                    <View style={styles.paperSummaryItem}>
                      <Text style={styles.paperSummaryLabel}>Tickets Sold</Text>
                      <Text style={styles.paperSummaryValue}>{reportData.total_tickets_sold}</Text>
                    </View>
                    <View style={styles.paperSummaryDivider} />
                    <View style={styles.paperSummaryItem}>
                      <Text style={styles.paperSummaryLabel}>Active Books</Text>
                      <Text style={styles.paperSummaryValue}>{reportData.breakdown.length}</Text>
                    </View>
                  </View>

                  <View style={styles.paperTotalRevenue}>
                    <Text style={styles.paperTotalLabel}>TOTAL REVENUE</Text>
                    <Text style={styles.paperTotalValue}>{formatCurrency(reportData.total_revenue)}</Text>
                  </View>
                </View>

                {/* Book Breakdown Section */}
                {reportData.breakdown.length > 0 && (
                  <View style={styles.paperSection}>
                    <View style={styles.paperSectionHeader}>
                      <Text style={styles.paperSectionTitle}>DETAILED BREAKDOWN</Text>
                    </View>

                    {reportData.breakdown.map((book, index) => (
                      <View key={index} style={styles.paperBookItem}>
                        <View style={styles.paperBookHeader}>
                          <View style={styles.paperBookHeaderLeft}>
                            <Text style={styles.paperBookName}>{book.lottery_name}</Text>
                            <Text style={styles.paperBookInfo}>
                              Game #{book.lottery_number} • Book #{book.serial_number}
                            </Text>
                            <View style={styles.paperBookPriceRow}>
                              <Text style={styles.paperBookPrice}>{formatCurrency(book.price)} each</Text>
                              <View style={[styles.paperDirection, {
                                backgroundColor: book.direction === 'asc' ? colors.info + '20' : colors.warning + '20'
                              }]}>
                                <Ionicons
                                  name={book.direction === 'asc' ? 'arrow-up' : 'arrow-down'}
                                  size={10}
                                  color={book.direction === 'asc' ? colors.info : colors.warning}
                                />
                                <Text style={[styles.paperDirectionText, {
                                  color: book.direction === 'asc' ? colors.info : colors.warning
                                }]}>
                                  {book.direction === 'asc' ? 'ASC' : 'DESC'}
                                </Text>
                              </View>
                            </View>
                          </View>
                          <View style={styles.paperBookRevenue}>
                            <Text style={styles.paperBookRevenueValue}>{formatCurrency(book.total_sales)}</Text>
                            <Text style={styles.paperBookRevenueLabel}>Revenue</Text>
                          </View>
                        </View>

                        <View style={styles.paperBookStats}>
                          <View style={styles.paperBookStatItem}>
                            <Text style={styles.paperBookStatLabel}>Opening</Text>
                            <Text style={styles.paperBookStatValue}>{book.opening_ticket}</Text>
                          </View>
                          <Text style={styles.paperBookStatArrow}>→</Text>
                          <View style={styles.paperBookStatItem}>
                            <Text style={styles.paperBookStatLabel}>Closing</Text>
                            <Text style={styles.paperBookStatValue}>{book.closing_ticket}</Text>
                          </View>
                          <View style={styles.paperBookStatHighlight}>
                            <Text style={styles.paperBookStatHighlightLabel}>Sold</Text>
                            <Text style={styles.paperBookStatHighlightValue}>{book.tickets_sold}</Text>
                          </View>
                          <View style={styles.paperBookStatItem}>
                            <Text style={styles.paperBookStatLabel}>Scans</Text>
                            <Text style={styles.paperBookStatValue}>{book.scans_count}</Text>
                          </View>
                        </View>

                        {index < reportData.breakdown.length - 1 && <View style={styles.paperBookDivider} />}
                      </View>
                    ))}
                  </View>
                )}

                {/* Footer */}
                <View style={styles.paperFooter}>
                  <View style={styles.paperDivider} />
                  <Text style={styles.paperFooterText}>End of Report</Text>
                  <Text style={styles.paperFooterDate}>
                    Printed: {new Date().toLocaleString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Date Picker Modal - iOS shows wheel, Android shows dialog */}
      {showDatePicker !== null && Platform.OS === 'ios' && (
        <Modal
          visible={showDatePicker !== null}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(null)}>
                  <Text style={styles.datePickerCancelButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>
                  Select {showDatePicker === 'start' ? 'Start' : 'End'} Date
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowDatePicker(null);
                    handleCustomDateChange();
                  }}
                >
                  <Text style={styles.datePickerDoneButton}>Done</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.datePickerBody}>
                <DateTimePicker
                  value={showDatePicker === 'start' ? startDate : endDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      if (showDatePicker === 'start') {
                        setStartDate(selectedDate);
                      } else {
                        setEndDate(selectedDate);
                      }
                    }
                  }}
                  textColor={colors.textPrimary}
                  maximumDate={new Date()}
                  style={styles.datePicker}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Android Date Picker */}
      {showDatePicker !== null && Platform.OS === 'android' && (
        <DateTimePicker
          value={showDatePicker === 'start' ? startDate : endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(null);
            if (event.type === 'set' && selectedDate) {
              if (showDatePicker === 'start') {
                setStartDate(selectedDate);
              } else {
                setEndDate(selectedDate);
              }
              handleCustomDateChange();
            }
          }}
          maximumDate={new Date()}
        />
      )}
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  modalContent: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  modalScrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  printButtonContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  printActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  printActionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Paper-like Design Styles
  paperContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  paperHeader: {
    padding: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
  },
  paperHeaderTop: {
    alignItems: 'center',
    marginBottom: 20,
  },
  paperTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 8,
    letterSpacing: 2,
  },
  paperSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
    letterSpacing: 1,
  },
  paperDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  paperInfoSection: {
    gap: 10,
  },
  paperInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  paperInfoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paperInfoValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  paperSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  paperSectionHeader: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  paperSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    letterSpacing: 1,
  },
  paperSummaryGrid: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
  },
  paperSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  paperSummaryDivider: {
    width: 1,
    backgroundColor: '#D0D0D0',
    marginHorizontal: 16,
  },
  paperSummaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paperSummaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  paperTotalRevenue: {
    backgroundColor: colors.primary + '15',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary + '40',
  },
  paperTotalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
    letterSpacing: 1.5,
  },
  paperTotalValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  paperBookItem: {
    marginBottom: 16,
  },
  paperBookDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 16,
  },
  paperBookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paperBookHeaderLeft: {
    flex: 1,
  },
  paperBookName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  paperBookInfo: {
    fontSize: 11,
    color: '#666666',
    marginBottom: 8,
  },
  paperBookPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paperBookPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
  },
  paperDirection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  paperDirectionText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  paperBookRevenue: {
    alignItems: 'flex-end',
  },
  paperBookRevenueValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.success,
  },
  paperBookRevenueLabel: {
    fontSize: 9,
    color: '#999999',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paperBookStats: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  paperBookStatItem: {
    alignItems: 'center',
  },
  paperBookStatLabel: {
    fontSize: 9,
    color: '#999999',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paperBookStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  paperBookStatArrow: {
    fontSize: 16,
    color: '#CCCCCC',
    marginHorizontal: 4,
  },
  paperBookStatHighlight: {
    backgroundColor: colors.success + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.success + '40',
  },
  paperBookStatHighlightLabel: {
    fontSize: 9,
    color: colors.success,
    marginBottom: 4,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paperBookStatHighlightValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
  },
  paperFooter: {
    padding: 24,
    alignItems: 'center',
  },
  paperFooterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999999',
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  paperFooterDate: {
    fontSize: 11,
    color: '#BBBBBB',
    marginTop: 6,
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
  refreshingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  refreshingText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  datePickerCancelButton: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '600',
  },
  datePickerDoneButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  datePickerBody: {
    paddingVertical: 10,
  },
  datePicker: {
    width: '100%',
    height: 200,
  },
});
