import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';

type Props = {
  navigation: any;
};

export default function PrivacySecurityScreen({ navigation }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);

  // Security Settings
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [autoLock, setAutoLock] = useState(true);

  // Privacy Settings
  const [shareAnalytics, setShareAnalytics] = useState(true);
  const [shareLocation, setShareLocation] = useState(false);

  // Loading state
  const [isClearing, setIsClearing] = useState(false);

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleTwoFactorToggle = (value: boolean) => {
    if (value) {
      Alert.alert(
        'Enable Two-Factor Authentication',
        'You will receive a verification code via SMS or email when logging in.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => setTwoFactorEnabled(true),
          },
        ]
      );
    } else {
      setTwoFactorEnabled(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear temporary data and may improve app performance. Your settings will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              // Get all keys from AsyncStorage
              const keys = await AsyncStorage.getAllKeys();

              // Define keys to preserve (user preferences)
              const keysToPreserve = ['@theme_mode'];

              // Filter out keys we want to keep
              const keysToRemove = keys.filter(key => !keysToPreserve.includes(key));

              // Remove cache keys
              if (keysToRemove.length > 0) {
                await AsyncStorage.multiRemove(keysToRemove);
              }

              setIsClearing(false);
              Alert.alert('Success', 'Cache cleared successfully. Freed up storage space.');
            } catch (error) {
              setIsClearing(false);
              Alert.alert('Error', 'Failed to clear cache. Please try again.');
              console.error('Cache clear error:', error);
            }
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your data will be exported as a PDF file and can be shared via email.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => Alert.alert('Success', 'Data export will be ready shortly'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={handleChangePassword}>
            <View style={styles.iconContainer}>
              <Ionicons name="key-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Change Password</Text>
              <Text style={styles.menuDescription}>Update your account password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="finger-print" size={22} color={colors.primary} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Biometric Authentication</Text>
              <Text style={styles.menuDescription}>Use Face ID or Touch ID</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={biometricEnabled ? colors.primary : colors.textMuted}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Two-Factor Authentication</Text>
              <Text style={styles.menuDescription}>Extra layer of security</Text>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={handleTwoFactorToggle}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={twoFactorEnabled ? colors.primary : colors.textMuted}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Auto-Lock</Text>
              <Text style={styles.menuDescription}>Lock app after 5 minutes</Text>
            </View>
            <Switch
              value={autoLock}
              onValueChange={setAutoLock}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={autoLock ? colors.primary : colors.textMuted}
            />
          </View>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={styles.iconContainer}>
              <Ionicons name="time-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Login Activity</Text>
              <Text style={styles.menuDescription}>View recent login history</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>

          <View style={styles.menuItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="analytics-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Share Analytics</Text>
              <Text style={styles.menuDescription}>Help improve the app</Text>
            </View>
            <Switch
              value={shareAnalytics}
              onValueChange={setShareAnalytics}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={shareAnalytics ? colors.primary : colors.textMuted}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="location-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Location Access</Text>
              <Text style={styles.menuDescription}>For store location features</Text>
            </View>
            <Switch
              value={shareLocation}
              onValueChange={setShareLocation}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={shareLocation ? colors.primary : colors.textMuted}
            />
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="document-text-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Privacy Policy</Text>
              <Text style={styles.menuDescription}>Read our privacy policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('TermsOfService')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="reader-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Terms of Service</Text>
              <Text style={styles.menuDescription}>View terms and conditions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={handleExportData}>
            <View style={styles.iconContainer}>
              <Ionicons name="download-outline" size={22} color={colors.info} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Export My Data</Text>
              <Text style={styles.menuDescription}>Download all your data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={handleClearData}
            disabled={isClearing}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="trash-outline" size={22} color={colors.warning} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Clear Cache</Text>
              <Text style={styles.menuDescription}>
                {isClearing ? 'Clearing cache...' : 'Free up storage space'}
              </Text>
            </View>
            {isClearing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            )}
          </TouchableOpacity>
        </View>

        {/* Security Info */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={24} color={colors.success} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Your Data is Secure</Text>
              <Text style={styles.infoText}>
                We use industry-standard encryption to protect your data and never share it with third parties.
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
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
  section: {
    marginTop: 20,
    marginHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  menuItem: {
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.success + '10',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
