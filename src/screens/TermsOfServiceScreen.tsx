import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

type Props = {
  navigation: any;
};

export default function TermsOfServiceScreen({ navigation }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.updateDate}>Last Updated: December 3, 2025</Text>

          <View style={styles.section}>
            <Text style={styles.paragraph}>
              Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Lottery Pro mobile application (the "Service") operated by Lottery Pro ("us", "we", or "our").
            </Text>
            <Text style={styles.paragraph}>
              Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. By accessing or using the Service, you agree to be bound by these Terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
              By creating an account and using Lottery Pro, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Description of Service</Text>
            <Text style={styles.paragraph}>
              Lottery Pro provides a mobile application for managing lottery ticket inventory, including:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Inventory tracking and management</Text>
              <Text style={styles.bulletItem}>• Sales reporting and analytics</Text>
              <Text style={styles.bulletItem}>• Multi-store management</Text>
              <Text style={styles.bulletItem}>• Barcode scanning functionality</Text>
              <Text style={styles.bulletItem}>• Data export and reporting tools</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. User Accounts</Text>

            <Text style={styles.subTitle}>Account Registration</Text>
            <Text style={styles.paragraph}>
              You must create an account to use our Service. You agree to:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Provide accurate and complete information</Text>
              <Text style={styles.bulletItem}>• Maintain the security of your password</Text>
              <Text style={styles.bulletItem}>• Notify us immediately of any unauthorized access</Text>
              <Text style={styles.bulletItem}>• Be responsible for all activities under your account</Text>
            </View>

            <Text style={styles.subTitle}>Account Eligibility</Text>
            <Text style={styles.paragraph}>
              You must be at least 18 years old and have the legal authority to enter into these Terms on behalf of your business.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. User Responsibilities</Text>
            <Text style={styles.paragraph}>
              You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Use the Service in any way that violates applicable laws</Text>
              <Text style={styles.bulletItem}>• Attempt to gain unauthorized access to the Service</Text>
              <Text style={styles.bulletItem}>• Interfere with or disrupt the Service</Text>
              <Text style={styles.bulletItem}>• Transmit viruses or malicious code</Text>
              <Text style={styles.bulletItem}>• Share your account credentials with others</Text>
              <Text style={styles.bulletItem}>• Use the Service for fraudulent activities</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Compliance with Laws</Text>
            <Text style={styles.paragraph}>
              You are responsible for ensuring that your use of the Service complies with all applicable federal, state, and local laws and regulations regarding lottery sales and inventory management. This includes but is not limited to:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Lottery licensing requirements</Text>
              <Text style={styles.bulletItem}>• Age verification requirements</Text>
              <Text style={styles.bulletItem}>• Record-keeping obligations</Text>
              <Text style={styles.bulletItem}>• Tax reporting requirements</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Data and Content</Text>

            <Text style={styles.subTitle}>Your Data</Text>
            <Text style={styles.paragraph}>
              You retain all rights to the data you input into the Service. By using the Service, you grant us a license to use, store, and process your data solely to provide the Service to you.
            </Text>

            <Text style={styles.subTitle}>Data Accuracy</Text>
            <Text style={styles.paragraph}>
              You are responsible for the accuracy and completeness of all data entered into the Service. We are not liable for any errors or discrepancies in your inventory or sales data.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
            <Text style={styles.paragraph}>
              The Service and its original content, features, and functionality are owned by Lottery Pro and are protected by international copyright, trademark, and other intellectual property laws.
            </Text>
            <Text style={styles.paragraph}>
              You may not copy, modify, distribute, sell, or lease any part of our Service without our express written permission.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Subscription and Fees</Text>
            <Text style={styles.paragraph}>
              Some parts of the Service may be billed on a subscription basis. You will be billed in advance on a recurring basis according to your chosen subscription plan.
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Fees are non-refundable except as required by law</Text>
              <Text style={styles.bulletItem}>• You authorize us to charge your payment method</Text>
              <Text style={styles.bulletItem}>• Prices are subject to change with notice</Text>
              <Text style={styles.bulletItem}>• You may cancel your subscription at any time</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Termination</Text>
            <Text style={styles.paragraph}>
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Breach of these Terms</Text>
              <Text style={styles.bulletItem}>• Fraudulent or illegal activity</Text>
              <Text style={styles.bulletItem}>• Non-payment of fees</Text>
              <Text style={styles.bulletItem}>• At your request</Text>
            </View>
            <Text style={styles.paragraph}>
              Upon termination, your right to use the Service will immediately cease. You may export your data before termination.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Disclaimers</Text>
            <Text style={styles.paragraph}>
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or implied, regarding:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Uninterrupted or error-free service</Text>
              <Text style={styles.bulletItem}>• Accuracy of data or results</Text>
              <Text style={styles.bulletItem}>• Fitness for a particular purpose</Text>
              <Text style={styles.bulletItem}>• Security of data transmission</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Limitation of Liability</Text>
            <Text style={styles.paragraph}>
              To the maximum extent permitted by law, Lottery Pro shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Loss of profits or revenue</Text>
              <Text style={styles.bulletItem}>• Loss of data</Text>
              <Text style={styles.bulletItem}>• Business interruption</Text>
              <Text style={styles.bulletItem}>• Loss of business opportunities</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. Indemnification</Text>
            <Text style={styles.paragraph}>
              You agree to indemnify and hold harmless Lottery Pro from any claims, damages, losses, liabilities, and expenses arising out of:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Your use of the Service</Text>
              <Text style={styles.bulletItem}>• Your violation of these Terms</Text>
              <Text style={styles.bulletItem}>• Your violation of any laws or regulations</Text>
              <Text style={styles.bulletItem}>• Your violation of third-party rights</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>13. Changes to Terms</Text>
            <Text style={styles.paragraph}>
              We reserve the right to modify or replace these Terms at any time. We will provide notice of any material changes by posting the new Terms on this page and updating the "Last Updated" date.
            </Text>
            <Text style={styles.paragraph}>
              Your continued use of the Service after any changes constitutes acceptance of the new Terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>14. Governing Law</Text>
            <Text style={styles.paragraph}>
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>15. Contact Information</Text>
            <Text style={styles.paragraph}>
              If you have any questions about these Terms, please contact us:
            </Text>
            <View style={styles.contactCard}>
              <View style={styles.contactItem}>
                <Ionicons name="mail" size={20} color={colors.primary} />
                <Text style={styles.contactText}>legal@lotterypro.com</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="call" size={20} color={colors.primary} />
                <Text style={styles.contactText}>+1 (234) 567-890</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="location" size={20} color={colors.primary} />
                <Text style={styles.contactText}>123 Business Ave, City, State 12345</Text>
              </View>
            </View>
          </View>

          <View style={styles.acknowledgment}>
            <Text style={styles.acknowledgmentText}>
              By using Lottery Pro, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </Text>
          </View>
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
  content: {
    padding: 20,
  },
  updateDate: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletList: {
    marginLeft: 8,
    marginBottom: 12,
  },
  bulletItem: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 6,
  },
  contactCard: {
    backgroundColor: colors.primary + '08',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
    color: colors.textPrimary,
    marginLeft: 12,
  },
  acknowledgment: {
    backgroundColor: colors.warning + '10',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  acknowledgmentText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '600',
  },
});
