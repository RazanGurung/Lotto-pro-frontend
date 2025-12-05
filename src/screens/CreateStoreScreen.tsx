import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import { storeService } from '../services/api';

type CreateStoreScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateStore'>;

type Props = {
  navigation: CreateStoreScreenNavigationProp;
};

export default function CreateStoreScreen({ navigation }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);

  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [lotteryAccountNumber, setLotteryAccountNumber] = useState('');
  const [lotteryPassword, setLotteryPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateStore = async () => {
    // Validation
    if (!storeName || storeName.trim() === '') {
      Alert.alert('Validation Error', 'Please enter store name');
      return;
    }
    if (!address || address.trim() === '') {
      Alert.alert('Validation Error', 'Please enter street address');
      return;
    }
    if (!city || city.trim() === '') {
      Alert.alert('Validation Error', 'Please enter city');
      return;
    }
    if (!state || state.trim() === '') {
      Alert.alert('Validation Error', 'Please enter state');
      return;
    }
    if (!zip || zip.trim() === '') {
      Alert.alert('Validation Error', 'Please enter zip code');
      return;
    }
    if (!lotteryAccountNumber || lotteryAccountNumber.trim() === '') {
      Alert.alert('Validation Error', 'Please enter lottery account number');
      return;
    }
    if (!lotteryPassword || lotteryPassword.trim() === '') {
      Alert.alert('Validation Error', 'Please enter lottery account password');
      return;
    }

    setLoading(true);

    const result = await storeService.createStore({
      name: storeName.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
      lottery_account_number: lotteryAccountNumber.trim(),
      lottery_password: lotteryPassword.trim(),
    });

    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Success',
        'Store created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('StoreList'),
          },
        ]
      );

      // Clear form
      setStoreName('');
      setAddress('');
      setCity('');
      setState('');
      setZip('');
      setLotteryAccountNumber('');
      setLotteryPassword('');
    } else {
      Alert.alert('Error', result.error || 'Failed to create store');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Store</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>Fill in the store details below</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Store Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter store name"
            placeholderTextColor={colors.textMuted}
            value={storeName}
            onChangeText={setStoreName}
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Street Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="123 Main Street"
            placeholderTextColor={colors.textMuted}
            value={address}
            onChangeText={setAddress}
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter city"
            placeholderTextColor={colors.textMuted}
            value={city}
            onChangeText={setCity}
            editable={!loading}
          />
        </View>

        <View style={styles.rowInputGroup}>
          <View style={[styles.halfInput, { marginRight: 10 }]}>
            <Text style={styles.label}>State *</Text>
            <TextInput
              style={styles.input}
              placeholder="CA"
              placeholderTextColor={colors.textMuted}
              value={state}
              onChangeText={setState}
              maxLength={2}
              autoCapitalize="characters"
              editable={!loading}
            />
          </View>

          <View style={[styles.halfInput, { marginRight: 0 }]}>
            <Text style={styles.label}>Zip Code *</Text>
            <TextInput
              style={styles.input}
              placeholder="12345"
              placeholderTextColor={colors.textMuted}
              value={zip}
              onChangeText={setZip}
              keyboardType="number-pad"
              maxLength={5}
              editable={!loading}
            />
          </View>
        </View>

        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Lottery Account Credentials</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Lottery Account Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter lottery account number"
            placeholderTextColor={colors.textMuted}
            value={lotteryAccountNumber}
            onChangeText={setLotteryAccountNumber}
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Lottery Account Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter lottery account password"
            placeholderTextColor={colors.textMuted}
            value={lotteryPassword}
            onChangeText={setLotteryPassword}
            secureTextEntry
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreateStore}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.textLight} />
          ) : (
            <Text style={styles.createButtonText}>Create Store</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  rowInputGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  createButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
