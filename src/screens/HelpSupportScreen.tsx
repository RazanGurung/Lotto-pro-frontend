import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

type Props = {
  navigation: any;
};

export default function HelpSupportScreen({ navigation }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@lotterypro.com');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+1234567890');
  };

  const handleOpenWebsite = () => {
    Linking.openURL('https://www.lotterypro.com');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Contact Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>

          <TouchableOpacity style={styles.contactCard} onPress={handleEmailSupport} activeOpacity={0.7}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="mail-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactSubtitle}>support@lotterypro.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleCallSupport} activeOpacity={0.7}>
            <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '15' }]}>
              <Ionicons name="call-outline" size={24} color={colors.secondary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Phone Support</Text>
              <Text style={styles.contactSubtitle}>+1 (234) 567-890</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleOpenWebsite} activeOpacity={0.7}>
            <View style={[styles.iconContainer, { backgroundColor: colors.accent + '15' }]}>
              <Ionicons name="globe-outline" size={24} color={colors.accent} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Visit Website</Text>
              <Text style={styles.contactSubtitle}>www.lotterypro.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* FAQs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          <View style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Ionicons name="help-circle" size={20} color={colors.primary} />
              <Text style={styles.faqQuestion}>How do I scan lottery tickets?</Text>
            </View>
            <Text style={styles.faqAnswer}>
              Navigate to the Dashboard and tap the floating Scan button. Point your camera at the barcode on the ticket.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Ionicons name="help-circle" size={20} color={colors.primary} />
              <Text style={styles.faqQuestion}>How do I update inventory counts?</Text>
            </View>
            <Text style={styles.faqAnswer}>
              Tap on any lottery card in the Dashboard to view details and update the current count manually or through scanning.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Ionicons name="help-circle" size={20} color={colors.primary} />
              <Text style={styles.faqQuestion}>How do I generate reports?</Text>
            </View>
            <Text style={styles.faqAnswer}>
              From the Dashboard, tap the Report button in the top right corner to generate and export your inventory reports.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Ionicons name="help-circle" size={20} color={colors.primary} />
              <Text style={styles.faqQuestion}>Can I manage multiple stores?</Text>
            </View>
            <Text style={styles.faqAnswer}>
              Yes! Add new stores from the "Add Store" tab. Switch between stores from the "Stores" tab on the home screen.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Ionicons name="help-circle" size={20} color={colors.primary} />
              <Text style={styles.faqQuestion}>How do I reset my password?</Text>
            </View>
            <Text style={styles.faqAnswer}>
              Go to Settings → Privacy & Security → Change Password. You can also reset it from the login screen.
            </Text>
          </View>
        </View>

        {/* Quick Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Tips</Text>

          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={20} color={colors.accent} />
            <Text style={styles.tipText}>
              Enable notifications to get alerts when inventory levels are low
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={20} color={colors.accent} />
            <Text style={styles.tipText}>
              Generate daily reports to track sales trends and inventory changes
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={20} color={colors.accent} />
            <Text style={styles.tipText}>
              Use the scan feature to quickly update multiple tickets at once
            </Text>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfoSection}>
          <Text style={styles.appInfoText}>Lottery Pro v1.0.0</Text>
          <Text style={styles.appInfoSubtext}>© 2025 Lottery Pro. All rights reserved.</Text>
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
  section: {
    marginTop: 20,
    marginHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  faqCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 10,
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginLeft: 30,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.accent + '10',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  appInfoSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingBottom: 40,
  },
  appInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 5,
  },
  appInfoSubtext: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
