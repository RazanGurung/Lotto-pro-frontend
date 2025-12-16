import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import { authService } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { STORAGE_KEYS } from '../config/env';
import { validateEmail, validateRequired } from '../utils/validation';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

export default function LoginScreen({ navigation }: Props) {
  const colors = useTheme();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const styles = createStyles(colors);

  const handleLogin = async () => {
    // Validate input (email or account number)
    const inputValidation = validateRequired(emailOrPhone, 'Email or Account Number');
    if (!inputValidation.isValid) {
      Alert.alert('Invalid Input', inputValidation.error);
      return;
    }

    // Validate password
    const passwordValidation = validateRequired(password, 'Password');
    if (!passwordValidation.isValid) {
      Alert.alert('Invalid Password', passwordValidation.error);
      return;
    }

    setLoading(true);

    try {
      const result = await authService.login({
        email: emailOrPhone.trim(),
        password,
      });

      if (result.success && result.data) {
        // Store authentication token and user data
        if (result.data.token) {
          await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, result.data.token);
        }

        if (result.data.user) {
          await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(result.data.user));
        }

        // For store account login, also save store data if available
        if (result.data.store) {
          console.log('Store data found in login response:', result.data.store);
          await AsyncStorage.setItem(STORAGE_KEYS.STORE_DATA, JSON.stringify(result.data.store));
        }

        console.log('=== LOGIN DATA DEBUG ===');
        console.log('Full result.data:', JSON.stringify(result.data, null, 2));
        console.log('result.data.user:', result.data.user);
        console.log('result.data.store:', result.data.store);
        console.log('========================');

        // Determine user type from user data or success message
        const userRole = result.data.user?.role || result.data.user?.type || result.data.user?.user_type || '';
        const successMessage = result.message || result.data?.message || result.msg || result.data?.msg || '';

        let userType = 'store_owner'; // default

        if (userRole === 'superadmin' || userRole === 'super_admin' || userRole === 'admin' ||
            successMessage.toLowerCase().includes('super admin')) {
          userType = 'superadmin';
        } else if (successMessage.toLowerCase().includes('store account login successful')) {
          userType = 'store';
        } else if (userRole === 'store_owner' || userRole === 'owner' ||
                   successMessage.toLowerCase().includes('store owner')) {
          userType = 'store_owner';
        } else if (userRole === 'store') {
          userType = 'store';
        }

        await AsyncStorage.setItem(STORAGE_KEYS.USER_TYPE, userType);

        console.log('=== LOGIN SUCCESS ===');
        console.log('Success Message:', successMessage);
        console.log('User Role:', userRole);
        console.log('Detected User Type:', userType);
        console.log('====================');

        // Route based on user type
        if (userType === 'store') {
          // Store account users go directly to StoreDashboard
          navigation.replace('StoreDashboard');
        } else {
          // Super Admin and Store Owner go through onboarding flow
          const onboardingComplete = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);

          if (onboardingComplete === 'true') {
            navigation.replace('MainTabs');
          } else {
            navigation.replace('ThemeSelection');
          }
        }
      } else {
        Alert.alert('Login Failed', result.error || 'Invalid email or password. Please try again.');
      }
    } catch (error: any) {
      Alert.alert(
        'Connection Error',
        'Cannot connect to server. Please check your internet connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Image
            source={require('../../assets/logo/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Lottery Pro</Text>
          <Text style={styles.subtitle}>Store Management System</Text>

          <Text style={styles.label}>Email or Account Number</Text>
          <TextInput
            style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
            placeholder="Enter your email or account number"
            placeholderTextColor={colors.textMuted}
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            keyboardType="default"
            autoCapitalize="none"
            editable={!loading}
            onFocus={() => setFocusedInput('email')}
            onBlur={() => setFocusedInput(null)}
          />

          <Text style={styles.label}>Password</Text>
          <View style={[styles.passwordContainer, focusedInput === 'password' && styles.inputFocused]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
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

      <TouchableOpacity
        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.textLight} />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')} disabled={loading}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    paddingTop: 120,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    marginLeft: 2,
  },
  input: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: colors.textPrimary,
  },
  eyeButton: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 15,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  signupLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
