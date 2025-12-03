import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, SafeAreaView, StatusBar } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';

type CreateStoreScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateStore'>;

type Props = {
  navigation: CreateStoreScreenNavigationProp;
};

export default function CreateStoreScreen({ navigation }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);

  const [storeName, setStoreName] = useState('');
  const [location, setLocation] = useState('');
  const [lotteryAccountNumber, setLotteryAccountNumber] = useState('');
  const [lotteryPassword, setLotteryPassword] = useState('');

  const handleCreateStore = () => {
    // Validation
    if (!storeName.trim()) {
      Alert.alert('Error', 'Please enter store name');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Error', 'Please enter location');
      return;
    }
    if (!lotteryAccountNumber.trim()) {
      Alert.alert('Error', 'Please enter lottery account number');
      return;
    }
    if (!lotteryPassword.trim()) {
      Alert.alert('Error', 'Please enter lottery account password');
      return;
    }

    // In production, send data to backend API
    Alert.alert(
      'Success',
      'Store created successfully!',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
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
            value={storeName}
            onChangeText={setStoreName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter store location/address"
            value={location}
            onChangeText={setLocation}
            multiline
            numberOfLines={2}
          />
        </View>

        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Lottery Account Credentials</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Lottery Account Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter lottery account number"
            value={lotteryAccountNumber}
            onChangeText={setLotteryAccountNumber}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Lottery Account Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter lottery account password"
            value={lotteryPassword}
            onChangeText={setLotteryPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleCreateStore}>
          <Text style={styles.createButtonText}>Create Store</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
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
