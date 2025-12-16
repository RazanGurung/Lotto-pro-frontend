import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PrivacyContentProps {
  colors: any;
}

export function PrivacyContent({ colors }: PrivacyContentProps) {
  const styles = createStyles(colors);

  return (
    <View style={styles.content}>
      <Text style={styles.updateDate}>Last Updated: December 3, 2025</Text>

      <View style={styles.section}>
        <Text style={styles.paragraph}>
          Lottery Pro ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Information We Collect</Text>

        <Text style={styles.subTitle}>Personal Information</Text>
        <Text style={styles.paragraph}>
          We collect information that you provide directly to us, including:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Name and contact information</Text>
          <Text style={styles.bulletItem}>• Email address and phone number</Text>
          <Text style={styles.bulletItem}>• Store information and business details</Text>
          <Text style={styles.bulletItem}>• Account credentials</Text>
        </View>

        <Text style={styles.subTitle}>Usage Information</Text>
        <Text style={styles.paragraph}>
          We automatically collect certain information about your device and how you use the app:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Device information (model, OS version)</Text>
          <Text style={styles.bulletItem}>• App usage statistics</Text>
          <Text style={styles.bulletItem}>• Log data and error reports</Text>
          <Text style={styles.bulletItem}>• Location data (with your permission)</Text>
        </View>

        <Text style={styles.subTitle}>Inventory Data</Text>
        <Text style={styles.paragraph}>
          Information related to your lottery inventory management:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Lottery ticket counts and types</Text>
          <Text style={styles.bulletItem}>• Sales data and reports</Text>
          <Text style={styles.bulletItem}>• Store performance metrics</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use the information we collect to:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Provide and maintain the app services</Text>
          <Text style={styles.bulletItem}>• Process your inventory and sales data</Text>
          <Text style={styles.bulletItem}>• Send you notifications and updates</Text>
          <Text style={styles.bulletItem}>• Improve app functionality and user experience</Text>
          <Text style={styles.bulletItem}>• Ensure security and prevent fraud</Text>
          <Text style={styles.bulletItem}>• Comply with legal obligations</Text>
          <Text style={styles.bulletItem}>• Provide customer support</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Information Sharing</Text>
        <Text style={styles.paragraph}>
          We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• With your explicit consent</Text>
          <Text style={styles.bulletItem}>• To comply with legal obligations</Text>
          <Text style={styles.bulletItem}>• To protect our rights and prevent fraud</Text>
          <Text style={styles.bulletItem}>• With service providers who assist our operations</Text>
          <Text style={styles.bulletItem}>• In connection with a business transaction (merger, acquisition)</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement industry-standard security measures to protect your information:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• End-to-end encryption for data transmission</Text>
          <Text style={styles.bulletItem}>• Secure data storage with encryption at rest</Text>
          <Text style={styles.bulletItem}>• Regular security audits and updates</Text>
          <Text style={styles.bulletItem}>• Two-factor authentication options</Text>
          <Text style={styles.bulletItem}>• Access controls and authentication</Text>
        </View>
        <Text style={styles.paragraph}>
          However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Data Retention</Text>
        <Text style={styles.paragraph}>
          We retain your information for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your account and associated data at any time.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the following rights regarding your personal information:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Access and review your data</Text>
          <Text style={styles.bulletItem}>• Correct inaccurate information</Text>
          <Text style={styles.bulletItem}>• Request deletion of your data</Text>
          <Text style={styles.bulletItem}>• Export your data</Text>
          <Text style={styles.bulletItem}>• Opt-out of marketing communications</Text>
          <Text style={styles.bulletItem}>• Withdraw consent for data processing</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>8. Third-Party Services</Text>
        <Text style={styles.paragraph}>
          Our app may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>9. Changes to Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>10. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions about this Privacy Policy, please contact us:
        </Text>
        <View style={styles.contactCard}>
          <View style={styles.contactItem}>
            <Ionicons name="mail" size={20} color={colors.primary} />
            <Text style={styles.contactText}>privacy@lotterypro.com</Text>
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
          By using Lottery Pro, you acknowledge that you have read and understood this Privacy Policy.
        </Text>
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
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
    backgroundColor: colors.info + '10',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: colors.info + '30',
  },
  acknowledgmentText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
