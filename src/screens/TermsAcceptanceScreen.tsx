import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { STORAGE_KEYS } from '../config/env';
import { TermsContent } from '../components/TermsContent';
import { PrivacyContent } from '../components/PrivacyContent';

type Props = {
  navigation: any;
};

const TERMS_VERSION = '1.0.0';

export default function TermsAcceptanceScreen({ navigation }: Props) {
  const colors = useTheme();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');
  const [isAccepted, setIsAccepted] = useState(false);
  const [hasScrolledTerms, setHasScrolledTerms] = useState(false);
  const [hasScrolledPrivacy, setHasScrolledPrivacy] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const styles = createStyles(colors);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;

    if (isCloseToBottom) {
      if (activeTab === 'terms') {
        setHasScrolledTerms(true);
      } else {
        setHasScrolledPrivacy(true);
      }
    }
  };

  const handleContinue = async () => {
    if (!isAccepted) return;

    try {
      const acceptanceDate = new Date().toISOString();

      await AsyncStorage.multiSet([
        [STORAGE_KEYS.TERMS_ACCEPTED, 'true'],
        [STORAGE_KEYS.TERMS_ACCEPTED_DATE, acceptanceDate],
        [STORAGE_KEYS.TERMS_VERSION, TERMS_VERSION],
        [STORAGE_KEYS.ONBOARDING_COMPLETE, 'true'],
      ]);

      navigation.replace('MainTabs');
    } catch (error) {
      console.error('Error saving terms acceptance:', error);
    }
  };

  const handleTabSwitch = (tab: 'terms' | 'privacy') => {
    setActiveTab(tab);
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="document-text" size={40} color={colors.primary} />
        </View>
        <Text style={styles.title}>Terms & Privacy</Text>
        <Text style={styles.subtitle}>
          Please review and accept our terms to continue
        </Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'terms' && styles.tabActive]}
          onPress={() => handleTabSwitch('terms')}
        >
          <Text style={[styles.tabText, activeTab === 'terms' && styles.tabTextActive]}>
            Terms of Service
          </Text>
          {hasScrolledTerms && (
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'privacy' && styles.tabActive]}
          onPress={() => handleTabSwitch('privacy')}
        >
          <Text style={[styles.tabText, activeTab === 'privacy' && styles.tabTextActive]}>
            Privacy Policy
          </Text>
          {hasScrolledPrivacy && (
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          )}
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        {activeTab === 'terms' ? (
          <TermsContent colors={colors} />
        ) : (
          <PrivacyContent colors={colors} />
        )}
      </ScrollView>

      {/* Acceptance Footer */}
      <View style={styles.footer}>
        {/* Scroll Reminder */}
        {(!hasScrolledTerms || !hasScrolledPrivacy) && (
          <View style={styles.reminderBox}>
            <Ionicons name="information-circle" size={16} color={colors.warning} />
            <Text style={styles.reminderText}>
              Please scroll through both documents
            </Text>
          </View>
        )}

        {/* Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setIsAccepted(!isAccepted)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, isAccepted && styles.checkboxChecked]}>
            {isAccepted && (
              <Ionicons name="checkmark" size={18} color={colors.white} />
            )}
          </View>
          <Text style={styles.checkboxLabel}>
            I have read and agree to the{' '}
            <Text style={styles.linkText}>Terms of Service</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !isAccepted && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!isAccepted}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue to App</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.white} />
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

  // Header
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
  },

  // Content
  contentContainer: {
    flex: 1,
  },

  // Footer
  footer: {
    padding: 20,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  reminderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '10',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  reminderText: {
    fontSize: 12,
    color: colors.warning,
    flex: 1,
  },

  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '600',
  },

  // Button
  continueButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});
