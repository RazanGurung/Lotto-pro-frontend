import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Switch, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';

type AddLotteryGameScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddLotteryGame'>;
type AddLotteryGameScreenRouteProp = RouteProp<RootStackParamList, 'AddLotteryGame'>;

type Props = {
  navigation: AddLotteryGameScreenNavigationProp;
  route: AddLotteryGameScreenRouteProp;
};

export default function AddLotteryGameScreen({ navigation, route }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);
  const { state, organizationName } = route.params;

  const [gameName, setGameName] = useState('');
  const [gameNumber, setGameNumber] = useState('');
  const [startNumber, setStartNumber] = useState('');
  const [endNumber, setEndNumber] = useState('');
  const [price, setPrice] = useState('');
  const [topPrize, setTopPrize] = useState('');
  const [odds, setOdds] = useState('');
  const [launchDate, setLaunchDate] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageUrl, setImageUrl] = useState('');

  const handleSave = () => {
    // Validation
    if (!gameName.trim()) {
      Alert.alert('Error', 'Please enter a game name');
      return;
    }
    if (!gameNumber.trim()) {
      Alert.alert('Error', 'Please enter a game number');
      return;
    }
    if (!startNumber.trim()) {
      Alert.alert('Error', 'Please enter a start number');
      return;
    }
    if (!endNumber.trim()) {
      Alert.alert('Error', 'Please enter an end number');
      return;
    }
    if (parseInt(startNumber) >= parseInt(endNumber)) {
      Alert.alert('Error', 'End number must be greater than start number');
      return;
    }
    if (!price.trim()) {
      Alert.alert('Error', 'Please enter a price');
      return;
    }
    if (!topPrize.trim()) {
      Alert.alert('Error', 'Please enter a top prize');
      return;
    }
    if (!odds.trim()) {
      Alert.alert('Error', 'Please enter odds');
      return;
    }
    if (!launchDate.trim()) {
      Alert.alert('Error', 'Please enter a launch date');
      return;
    }

    // TODO: Save to API
    console.log('Saving game:', {
      gameName,
      gameNumber,
      startNumber,
      endNumber,
      price,
      topPrize,
      odds,
      launchDate,
      isAvailable,
      imageUrl,
      state
    });

    Alert.alert('Success', 'Lottery game added successfully', [
      {
        text: 'OK',
        onPress: () => navigation.goBack()
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Add New Game</Text>
          <Text style={styles.headerSubtitle}>{organizationName} ({state})</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Form */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
          {/* Game Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Game Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Lucky 7s"
              placeholderTextColor={colors.textMuted}
              value={gameName}
              onChangeText={setGameName}
            />
          </View>

          {/* Game Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Game Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 1234"
              placeholderTextColor={colors.textMuted}
              value={gameNumber}
              onChangeText={setGameNumber}
              keyboardType="numeric"
            />
          </View>

          {/* Start Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 1000000"
              placeholderTextColor={colors.textMuted}
              value={startNumber}
              onChangeText={setStartNumber}
              keyboardType="numeric"
            />
            <Text style={styles.helperText}>First ticket number in the series</Text>
          </View>

          {/* End Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>End Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2000000"
              placeholderTextColor={colors.textMuted}
              value={endNumber}
              onChangeText={setEndNumber}
              keyboardType="numeric"
            />
            <Text style={styles.helperText}>Last ticket number in the series</Text>
          </View>

          {/* Price */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 5"
              placeholderTextColor={colors.textMuted}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Top Prize */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Top Prize</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., $100,000"
              placeholderTextColor={colors.textMuted}
              value={topPrize}
              onChangeText={setTopPrize}
            />
          </View>

          {/* Odds */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Odds</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 1 in 3.5"
              placeholderTextColor={colors.textMuted}
              value={odds}
              onChangeText={setOdds}
            />
          </View>

          {/* Launch Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Launch Date</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2024-03-15"
              placeholderTextColor={colors.textMuted}
              value={launchDate}
              onChangeText={setLaunchDate}
            />
            <Text style={styles.helperText}>Format: YYYY-MM-DD</Text>
          </View>

          {/* Image URL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image URL (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor={colors.textMuted}
              value={imageUrl}
              onChangeText={setImageUrl}
              autoCapitalize="none"
            />
          </View>

          {/* Availability Toggle */}
          <View style={styles.switchGroup}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.label}>Game Status</Text>
              <Text style={styles.helperText}>
                {isAvailable ? 'Active - Game is available for purchase' : 'Inactive - Game is not available'}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: colors.textMuted, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Save Game</Text>
        </TouchableOpacity>
      </View>
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  helperText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 15,
  },
  footer: {
    padding: 20,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
