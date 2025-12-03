import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemeMode } from '../contexts/ThemeContext';

type Props = {
  navigation: any;
};

export default function DarkModeScreen({ navigation }: Props) {
  const colors = useTheme();
  const { themeMode, setThemeMode, isDark } = useThemeMode();
  const styles = createStyles(colors);

  const options = [
    {
      mode: 'light' as const,
      title: 'Light Mode',
      description: 'Always use light theme',
      icon: 'sunny',
    },
    {
      mode: 'dark' as const,
      title: 'Dark Mode',
      description: 'Always use dark theme',
      icon: 'moon',
    },
    {
      mode: 'system' as const,
      title: 'System Default',
      description: 'Follow device settings',
      icon: 'phone-portrait',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dark Mode</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <View style={[styles.previewCard, { backgroundColor: isDark ? darkTheme.surface : lightTheme.surface }]}>
            <View style={styles.previewHeader}>
              <View style={[styles.previewIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="storefront" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.previewTitle, { color: isDark ? darkTheme.textPrimary : lightTheme.textPrimary }]}>
                Downtown Store
              </Text>
            </View>
            <Text style={[styles.previewText, { color: isDark ? darkTheme.textSecondary : lightTheme.textSecondary }]}>
              This is how your app will look with the selected theme
            </Text>
          </View>
        </View>

        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>Theme Options</Text>

          {options.map((option) => (
            <TouchableOpacity
              key={option.mode}
              style={[
                styles.optionCard,
                themeMode === option.mode && styles.selectedCard,
              ]}
              onPress={() => setThemeMode(option.mode)}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIconContainer, themeMode === option.mode && styles.selectedIconContainer]}>
                <Ionicons
                  name={option.icon as any}
                  size={28}
                  color={themeMode === option.mode ? colors.white : colors.primary}
                />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, themeMode === option.mode && styles.selectedTitle]}>
                  {option.title}
                </Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              {themeMode === option.mode && (
                <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color={colors.info} />
            <Text style={styles.infoText}>
              Dark mode reduces eye strain in low-light conditions and may help save battery on OLED screens.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Import themes for preview
import { lightTheme, darkTheme } from '../styles/colors';

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
  previewSection: {
    marginTop: 20,
    marginHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  previewCard: {
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  previewIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
  },
  optionsSection: {
    marginTop: 30,
    marginHorizontal: 15,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  selectedIconContainer: {
    backgroundColor: colors.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  selectedTitle: {
    color: colors.primary,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoSection: {
    marginTop: 20,
    marginHorizontal: 15,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.info + '10',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.info + '30',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 12,
    lineHeight: 20,
  },
});
