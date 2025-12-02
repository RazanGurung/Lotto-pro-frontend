import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../styles/colors';

type CreateStoreScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateStore'>;

type Props = {
  navigation: CreateStoreScreenNavigationProp;
};

export default function CreateStoreScreen({ navigation }: Props) {
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
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create New Store</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  createButton: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createButtonText: {
    color: Colors.textLight,
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
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
