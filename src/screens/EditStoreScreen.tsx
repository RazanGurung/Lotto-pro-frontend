import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { storeService } from '../services/api';

type Props = {
  navigation: any;
  route: any;
};

export default function EditStoreScreen({ navigation, route }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);
  const store = route.params?.store;

  const [storeName, setStoreName] = useState(store?.store_name || '');
  const [address, setAddress] = useState(store?.address || '');
  const [city, setCity] = useState(store?.city || '');
  const [state, setState] = useState(store?.state || '');
  const [zipcode, setZipcode] = useState(store?.zipcode || '');
  const [lotteryAccountNo, setLotteryAccountNo] = useState(store?.lottery_ac_no || '');
  const [isEditingAccountNo, setIsEditingAccountNo] = useState(false);
  const [newLotteryPassword, setNewLotteryPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Format account number to show only last 4 digits
  const maskedAccountNumber = lotteryAccountNo
    ? `••••${lotteryAccountNo.slice(-4)}`
    : '••••';

  const handleAccountNoFocus = () => {
    setIsEditingAccountNo(true);
    setLotteryAccountNo(''); // Clear the field when user starts editing
  };

  const handleSave = () => {
    Alert.alert(
      'Success',
      'Store information updated successfully!',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Store',
      'Are you sure you want to delete this store? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!store?.id) {
              Alert.alert('Error', 'Store ID not found');
              return;
            }

            setIsDeleting(true);
            const result = await storeService.deleteStore(store.id);
            setIsDeleting(false);

            if (result.success) {
              Alert.alert(
                'Success',
                'Store deleted successfully',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } else {
              Alert.alert('Error', result.error || 'Failed to delete store');
            }
          },
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
        <Text style={styles.headerTitle}>Edit Store</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Store Details Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Store Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Store Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="storefront-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={storeName}
                onChangeText={(text) => setStoreName(text.toUpperCase())}
                placeholder="Enter store name"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={(text) => {
                  // Capitalize first letter of each word
                  const titleCase = text.replace(/\b\w/g, (char) => char.toUpperCase());
                  setAddress(titleCase);
                }}
                placeholder="Enter street address"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>City</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="business-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={(text) => {
                  // Capitalize first letter of each word
                  const titleCase = text.replace(/\b\w/g, (char) => char.toUpperCase());
                  setCity(titleCase);
                }}
                placeholder="Enter city"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>State</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="flag-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={state}
                onChangeText={(text) => setState(text.toUpperCase())}
                placeholder="Enter state"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
                maxLength={2}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Zipcode</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={zipcode}
                onChangeText={(text) => {
                  // Only allow numbers
                  const numbersOnly = text.replace(/[^0-9]/g, '');
                  setZipcode(numbersOnly);
                }}
                placeholder="Enter zipcode"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
          </View>
        </View>

        {/* Lottery Credentials Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Lottery Credentials</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lottery Account Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="key-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={isEditingAccountNo ? lotteryAccountNo : maskedAccountNumber}
                onChangeText={setLotteryAccountNo}
                onFocus={handleAccountNoFocus}
                placeholder="Enter new lottery account number"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />
            </View>
            {!isEditingAccountNo && (
              <Text style={styles.helperText}>Tap to change account number</Text>
            )}
            {isEditingAccountNo && (
              <Text style={styles.helperText}>Enter the complete new account number</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Change Lottery Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={newLotteryPassword}
                onChangeText={setNewLotteryPassword}
                placeholder="Enter new password (leave empty to keep current)"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>Only fill this if you want to change the password</Text>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>

          <TouchableOpacity
            style={[styles.dangerItem, isDeleting && styles.dangerItemDisabled]}
            activeOpacity={0.7}
            onPress={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <ActivityIndicator size="small" color={colors.error} />
                <Text style={styles.dangerText}>Deleting...</Text>
              </>
            ) : (
              <>
                <Ionicons name="trash-outline" size={22} color={colors.error} />
                <Text style={styles.dangerText}>Delete Store</Text>
              </>
            )}
          </TouchableOpacity>
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  container: {
    flex: 1,
  },
  formSection: {
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 15,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingTop: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
    marginLeft: 2,
    fontStyle: 'italic',
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '10',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  dangerItemDisabled: {
    opacity: 0.6,
  },
  dangerText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginLeft: 12,
  },
});
