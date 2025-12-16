import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme, useThemeMode } from '../contexts/ThemeContext';

type ThemeSelectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ThemeSelection'>;

type Props = {
  navigation: ThemeSelectionScreenNavigationProp;
};

const ONBOARDING_COMPLETE_KEY = '@onboarding_complete';

export default function ThemeSelectionScreen({ navigation }: Props) {
  const colors = useTheme();
  const { themeMode, setThemeMode } = useThemeMode();
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>(themeMode);
  const styles = createStyles(colors);

  const handleContinue = async () => {
    await setThemeMode(selectedTheme);
    // Onboarding completion moved to TermsAcceptanceScreen
    navigation.replace('TermsAcceptance');
  };

  const themeOptions = [
    {
      id: 'light',
      title: 'Light Mode',
      description: 'Bright and clean interface',
      icon: 'sunny',
      gradient: ['#FFFFFF', '#F8FAFC'],
      textColor: '#0F172A',
    },
    {
      id: 'dark',
      title: 'Dark Mode',
      description: 'Easy on your eyes',
      icon: 'moon',
      gradient: ['#1F2937', '#111827'],
      textColor: '#F9FAFB',
    },
    {
      id: 'system',
      title: 'System Default',
      description: 'Match your device settings',
      icon: 'phone-portrait',
      gradient: ['#3B82F6', '#1E3A8A'],
      textColor: '#FFFFFF',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="color-palette" size={48} color={colors.primary} />
          </View>
          <Text style={styles.title}>Choose Your Theme</Text>
          <Text style={styles.subtitle}>
            Select your preferred appearance. You can always change this later in settings.
          </Text>
        </View>

        {/* Theme Options */}
        <View style={styles.optionsContainer}>
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedTheme === option.id && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedTheme(option.id as any)}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <View style={[styles.optionIconContainer, { backgroundColor: option.gradient[0] }]}>
                  <Ionicons name={option.icon as any} size={32} color={option.textColor} />
                </View>

                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>

                <View style={styles.radioContainer}>
                  <View style={[styles.radioOuter, selectedTheme === option.id && styles.radioOuterSelected]}>
                    {selectedTheme === option.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Preview Info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            {selectedTheme === 'system'
              ? 'The app will automatically switch between light and dark modes based on your device settings.'
              : selectedTheme === 'dark'
              ? 'Dark mode reduces eye strain in low-light environments and may help save battery.'
              : 'Light mode provides a bright, clear interface that works great in well-lit environments.'}
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Skip Option */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleContinue}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>I'll choose later</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  optionsContainer: {
    marginBottom: 24,
    gap: 16,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
    elevation: 4,
    shadowOpacity: 0.1,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  radioContainer: {
    marginLeft: 12,
  },
  radioOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    gap: 8,
    marginBottom: 16,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
