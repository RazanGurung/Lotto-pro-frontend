import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Switch, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import { lotteryService } from '../services/api';

type EditLotteryGameScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditLotteryGame'>;
type EditLotteryGameScreenRouteProp = RouteProp<RootStackParamList, 'EditLotteryGame'>;

type Props = {
  navigation: EditLotteryGameScreenNavigationProp;
  route: EditLotteryGameScreenRouteProp;
};

export default function EditLotteryGameScreen({ navigation, route }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);
  const { game } = route.params;

  const [gameName, setGameName] = useState(game.lottery_name);
  const [lotteryNumber, setLotteryNumber] = useState(game.lottery_number);
  const [startNumber, setStartNumber] = useState(game.start_number.toString());
  const [endNumber, setEndNumber] = useState(game.end_number.toString());
  const [price, setPrice] = useState(game.price.toString());
  const [launchDate, setLaunchDate] = useState(game.launch_date || '');
  const [isAvailable, setIsAvailable] = useState(game.status === 'active');
  const [imageUrl, setImageUrl] = useState(game.image_url || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // Validation
    if (!gameName.trim()) {
      Alert.alert('Validation Error', 'Please enter a lottery name');
      return;
    }
    if (!lotteryNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter a lottery number');
      return;
    }
    if (!startNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter a start number');
      return;
    }
    if (!endNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter an end number');
      return;
    }
    if (parseInt(startNumber) >= parseInt(endNumber)) {
      Alert.alert('Validation Error', 'End number must be greater than start number');
      return;
    }
    if (!price.trim()) {
      Alert.alert('Validation Error', 'Please enter a price');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price');
      return;
    }

    setLoading(true);

    const result = await lotteryService.updateLottery(game.lottery_id, {
      lottery_name: gameName.trim(),
      lottery_number: lotteryNumber.trim(),
      state: game.state,
      price: priceNum,
      start_number: parseInt(startNumber),
      end_number: parseInt(endNumber),
      launch_date: launchDate.trim() || undefined,
      status: isAvailable ? 'active' : 'inactive',
      image_url: imageUrl.trim() || undefined,
    });

    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Lottery game updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } else {
      Alert.alert('Error', result.error || 'Failed to update lottery game');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Edit Game</Text>
          <Text style={styles.headerSubtitle}>{game.state}</Text>
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
            <Text style={styles.label}>Lottery Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 200X The Cash"
              placeholderTextColor={colors.textMuted}
              value={gameName}
              onChangeText={setGameName}
              editable={!loading}
            />
          </View>

          {/* Lottery Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lottery Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., nc925"
              placeholderTextColor={colors.textMuted}
              value={lotteryNumber}
              onChangeText={setLotteryNumber}
              editable={!loading}
            />
          </View>

          {/* Price */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price ($) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 30"
              placeholderTextColor={colors.textMuted}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              editable={!loading}
            />
          </View>

          {/* Start Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 1"
              placeholderTextColor={colors.textMuted}
              value={startNumber}
              onChangeText={setStartNumber}
              keyboardType="numeric"
              editable={!loading}
            />
            <Text style={styles.helperText}>First ticket number in the series</Text>
          </View>

          {/* End Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>End Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 99"
              placeholderTextColor={colors.textMuted}
              value={endNumber}
              onChangeText={setEndNumber}
              keyboardType="numeric"
              editable={!loading}
            />
            <Text style={styles.helperText}>Last ticket number in the series</Text>
          </View>

          {/* Launch Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Launch Date (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2025-03-15"
              placeholderTextColor={colors.textMuted}
              value={launchDate}
              onChangeText={setLaunchDate}
              editable={!loading}
            />
            <Text style={styles.helperText}>Format: YYYY-MM-DD</Text>
          </View>

          {/* Image URL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image URL (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://nclottery.com/Content/Images/Instant/nc925_sqr.png"
              placeholderTextColor={colors.textMuted}
              value={imageUrl}
              onChangeText={setImageUrl}
              autoCapitalize="none"
              editable={!loading}
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
          style={[styles.saveButton, { backgroundColor: colors.primary }, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Update Lottery</Text>
          )}
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
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
