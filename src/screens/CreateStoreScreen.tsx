import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, StatusBar, ActivityIndicator, KeyboardAvoidingView, Platform, Switch, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import { storeService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [userId, setUserId] = useState<number | null>(null);
  const [is24Hour, setIs24Hour] = useState(false);
  const [closingTime, setClosingTime] = useState(new Date(new Date().setHours(23, 59, 0, 0)));
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('@user_data');
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user.id);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleCreateStore = async () => {
    // Check if user ID is loaded
    if (!userId) {
      Alert.alert('Error', 'User information not loaded. Please try again.');
      return;
    }

    // Validation
    if (!storeName || storeName.trim() === '') {
      Alert.alert('Validation Error', 'Please enter store name');
      return;
    }
    if (!lotteryAccountNumber || lotteryAccountNumber.trim() === '') {
      Alert.alert('Validation Error', 'Please enter lottery account number');
      return;
    }
    // Validate lottery account number: exactly 8 digits
    if (!/^\d{8}$/.test(lotteryAccountNumber.trim())) {
      Alert.alert('Validation Error', 'Lottery account number must be exactly 8 digits');
      return;
    }
    if (!lotteryPassword || lotteryPassword.trim() === '') {
      Alert.alert('Validation Error', 'Please enter lottery account password');
      return;
    }
    // Validate lottery password: exactly 4 digits
    if (!/^\d{4}$/.test(lotteryPassword.trim())) {
      Alert.alert('Validation Error', 'Lottery account password must be exactly 4 digits');
      return;
    }

    setLoading(true);

    const closingHour = closingTime.getHours();
    const formattedClosingTime = `${closingHour.toString().padStart(2, '0')}:00:00`;

    const result = await storeService.createStore({
      owner_id: userId,
      store_name: storeName.trim(),
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      zipcode: zip.trim() || undefined,
      lottery_ac_no: lotteryAccountNumber.trim(),
      lottery_pw: lotteryPassword.trim(),
      is_24_hours: is24Hour ? 1 : 0,
      closing_time: formattedClosingTime,
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>Fill in the store details below</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Store Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter store name"
            placeholderTextColor={colors.textMuted}
            value={storeName}
            onChangeText={(text) => setStoreName(text.toUpperCase())}
            autoCapitalize="characters"
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Street Address</Text>
          <TextInput
            style={styles.input}
            placeholder="123 Main Street"
            placeholderTextColor={colors.textMuted}
            value={address}
            onChangeText={(text) => {
              // Capitalize first letter of each word
              const titleCase = text.replace(/\b\w/g, (char) => char.toUpperCase());
              setAddress(titleCase);
            }}
            autoCapitalize="words"
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter city"
            placeholderTextColor={colors.textMuted}
            value={city}
            onChangeText={(text) => {
              // Capitalize first letter of each word
              const titleCase = text.replace(/\b\w/g, (char) => char.toUpperCase());
              setCity(titleCase);
            }}
            autoCapitalize="words"
            editable={!loading}
          />
        </View>

        <View style={styles.rowInputGroup}>
          <View style={[styles.halfInput, { marginRight: 10 }]}>
            <Text style={styles.label}>State</Text>
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
            <Text style={styles.label}>Zip Code</Text>
            <TextInput
              style={styles.input}
              placeholder="12345"
              placeholderTextColor={colors.textMuted}
              value={zip}
              onChangeText={(text) => {
                // Only allow numbers
                const numbersOnly = text.replace(/[^0-9]/g, '');
                setZip(numbersOnly);
              }}
              keyboardType="number-pad"
              maxLength={5}
              editable={!loading}
            />
          </View>
        </View>

        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Store Hours</Text>

        <View style={styles.switchContainer}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchLabel}>24-Hour Store</Text>
            <Text style={styles.switchSubLabel}>
              {is24Hour ? 'Store operates 24 hours a day' : 'Store has specific closing time'}
            </Text>
          </View>
          <Switch
            value={is24Hour}
            onValueChange={setIs24Hour}
            trackColor={{ false: colors.border, true: colors.primary + '60' }}
            thumbColor={is24Hour ? colors.primary : colors.surface}
            disabled={loading}
          />
        </View>

        {!is24Hour && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Store Closing Time</Text>
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() => setShowTimePicker(true)}
              disabled={loading}
            >
              <Text style={styles.timePickerText}>
                {closingTime.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </Text>
              <Text style={styles.timePickerIcon}>🕐</Text>
            </TouchableOpacity>
            <Text style={styles.helperText}>
              Report period will be from closing time to closing time (next day)
            </Text>
          </View>
        )}

        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Lottery Account Credentials</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Lottery Account Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="12345678 (8 digits)"
            placeholderTextColor={colors.textMuted}
            value={lotteryAccountNumber}
            onChangeText={(text) => {
              // Only allow digits and max 8 characters
              const cleaned = text.replace(/[^0-9]/g, '');
              setLotteryAccountNumber(cleaned);
            }}
            keyboardType="number-pad"
            maxLength={8}
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Lottery Account Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="1234 (4 digits)"
            placeholderTextColor={colors.textMuted}
            value={lotteryPassword}
            onChangeText={(text) => {
              // Only allow digits and max 4 characters
              const cleaned = text.replace(/[^0-9]/g, '');
              setLotteryPassword(cleaned);
            }}
            keyboardType="number-pad"
            maxLength={4}
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
      </KeyboardAvoidingView>

      {/* Time Picker Modal */}
      {showTimePicker && Platform.OS === 'ios' && (
        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.timePickerContainer}>
              <View style={styles.timePickerHeader}>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.timePickerCancelButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.timePickerTitle}>Select Closing Time</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.timePickerDoneButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={closingTime}
                mode="time"
                display="spinner"
                onChange={(event, selectedTime) => {
                  if (selectedTime) {
                    setClosingTime(selectedTime);
                  }
                }}
                textColor={colors.textPrimary}
                style={styles.timePicker}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Android Time Picker */}
      {showTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={closingTime}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (event.type === 'set' && selectedTime) {
              setClosingTime(selectedTime);
            }
          }}
        />
      )}
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  switchSubLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  timePickerButton: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timePickerText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  timePickerIcon: {
    fontSize: 20,
  },
  helperText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  timePickerContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timePickerCancelButton: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '600',
  },
  timePickerDoneButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  timePicker: {
    width: '100%',
    height: 200,
  },
});
