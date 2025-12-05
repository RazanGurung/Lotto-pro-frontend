import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

type Props = {
  navigation: any;
};

export default function NotificationSettingsScreen({ navigation }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);

  // Notification toggles
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  // Notification types
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [salesUpdates, setSalesUpdates] = useState(true);
  const [inventoryAlerts, setInventoryAlerts] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);

  // Quiet hours
  const [quietHours, setQuietHours] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Delivery Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Methods</Text>
          <Text style={styles.sectionDescription}>Choose how you want to receive notifications</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="notifications" size={22} color={colors.primary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Receive notifications on your device</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={pushNotifications ? colors.primary : colors.textMuted}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="mail" size={22} color={colors.primary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Email Notifications</Text>
              <Text style={styles.settingDescription}>Receive notifications via email</Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={emailNotifications ? colors.primary : colors.textMuted}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="chatbubble" size={22} color={colors.primary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>SMS Notifications</Text>
              <Text style={styles.settingDescription}>Receive notifications via text message</Text>
            </View>
            <Switch
              value={smsNotifications}
              onValueChange={setSmsNotifications}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={smsNotifications ? colors.primary : colors.textMuted}
            />
          </View>
        </View>

        {/* Notification Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          <Text style={styles.sectionDescription}>Choose which notifications you want to receive</Text>

          <View style={styles.settingItem}>
            <View style={[styles.settingIconContainer, { backgroundColor: colors.warning + '15' }]}>
              <Ionicons name="alert-circle" size={22} color={colors.warning} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Low Stock Alerts</Text>
              <Text style={styles.settingDescription}>Get notified when inventory is low</Text>
            </View>
            <Switch
              value={lowStockAlerts}
              onValueChange={setLowStockAlerts}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={lowStockAlerts ? colors.primary : colors.textMuted}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={[styles.settingIconContainer, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="trending-up" size={22} color={colors.success} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Sales Updates</Text>
              <Text style={styles.settingDescription}>Daily and milestone sales notifications</Text>
            </View>
            <Switch
              value={salesUpdates}
              onValueChange={setSalesUpdates}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={salesUpdates ? colors.primary : colors.textMuted}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={[styles.settingIconContainer, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="warning" size={22} color={colors.error} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Inventory Alerts</Text>
              <Text style={styles.settingDescription}>Updates required and discrepancies</Text>
            </View>
            <Switch
              value={inventoryAlerts}
              onValueChange={setInventoryAlerts}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={inventoryAlerts ? colors.primary : colors.textMuted}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={[styles.settingIconContainer, { backgroundColor: colors.info + '15' }]}>
              <Ionicons name="cloud-download" size={22} color={colors.info} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>System Updates</Text>
              <Text style={styles.settingDescription}>App updates and new features</Text>
            </View>
            <Switch
              value={systemUpdates}
              onValueChange={setSystemUpdates}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={systemUpdates ? colors.primary : colors.textMuted}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={[styles.settingIconContainer, { backgroundColor: colors.accent + '15' }]}>
              <Ionicons name="document-text" size={22} color={colors.accent} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Weekly Reports</Text>
              <Text style={styles.settingDescription}>Summary of weekly performance</Text>
            </View>
            <Switch
              value={weeklyReports}
              onValueChange={setWeeklyReports}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={weeklyReports ? colors.primary : colors.textMuted}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={[styles.settingIconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="calendar" size={22} color={colors.primary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Daily Summary</Text>
              <Text style={styles.settingDescription}>End of day sales summary</Text>
            </View>
            <Switch
              value={dailySummary}
              onValueChange={setDailySummary}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={dailySummary ? colors.primary : colors.textMuted}
            />
          </View>
        </View>

        {/* Quiet Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quiet Hours</Text>
          <Text style={styles.sectionDescription}>Pause notifications during specific hours</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="moon" size={22} color={colors.primary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Enable Quiet Hours</Text>
              <Text style={styles.settingDescription}>10:00 PM - 8:00 AM</Text>
            </View>
            <Switch
              value={quietHours}
              onValueChange={setQuietHours}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={quietHours ? colors.primary : colors.textMuted}
            />
          </View>

          {quietHours && (
            <TouchableOpacity style={styles.timeButton} activeOpacity={0.7}>
              <Text style={styles.timeButtonText}>Adjust Quiet Hours</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  safeArea: {
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});
