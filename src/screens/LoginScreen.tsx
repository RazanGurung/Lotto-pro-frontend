import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import { authService } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const ONBOARDING_COMPLETE_KEY = '@onboarding_complete';
const AUTH_TOKEN_KEY = '@auth_token';
const USER_DATA_KEY = '@user_data';

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
    if (!emailOrPhone.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.login({
        email: emailOrPhone.trim(),
        password,
      });

      setLoading(false);

      if (result.success) {
        console.log('=== LOGIN SUCCESS ===');
        console.log('Full result keys:', Object.keys(result));
        console.log('Full result:', JSON.stringify(result, null, 2));
        console.log('result.message:', result.message);
        console.log('result.data?.message:', result.data?.message);
        console.log('result.msg:', result.msg);
        console.log('result.data?.msg:', result.data?.msg);

        // Store authentication token and user data
        if (result.data?.token) {
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, result.data.token);
        }
        if (result.data?.user) {
          await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(result.data.user));
          console.log('User data:', JSON.stringify(result.data.user, null, 2));
          console.log('User role:', result.data.user.role);
          console.log('User type:', result.data.user.type);
          console.log('User user_type:', result.data.user.user_type);
        }

        // Determine user type based on success message or user data
        const successMessage = result.message || result.data?.message || result.msg || result.data?.msg || '';
        const userRole = result.data?.user?.role || result.data?.user?.type || result.data?.user?.user_type || '';
        let userType = 'store'; // default

        console.log('Checking message:', successMessage);
        console.log('Checking user role:', userRole);

        // First check user role/type in user data
        if (userRole) {
          if (userRole === 'superadmin' || userRole === 'super_admin' || userRole === 'admin') {
            userType = 'superadmin';
            console.log('✅ Detected SUPERADMIN from user data');
          } else if (userRole === 'store_owner' || userRole === 'owner') {
            userType = 'store_owner';
            console.log('✅ Detected STORE OWNER from user data');
          } else if (userRole === 'store') {
            userType = 'store';
            console.log('✅ Detected STORE from user data');
          }
        }
        // Fallback to message checking
        else if (successMessage.includes('Super admin login successful') || successMessage.includes('Superadmin login successful')) {
          userType = 'superadmin';
          console.log('✅ Detected SUPERADMIN from message');
        } else if (successMessage.includes('Store Owner login successful') || successMessage.includes('Store owner login successful')) {
          userType = 'store_owner';
          console.log('✅ Detected STORE OWNER from message');
        } else {
          console.log('⚠️ Defaulting to STORE user');
        }

        await AsyncStorage.setItem('@user_type', userType);
        console.log('Final userType saved:', userType);
        console.log('===================');

        // Check if user has completed onboarding
        const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);

        if (onboardingComplete === 'true') {
          navigation.replace('MainTabs');
        } else {
          // First time login - show theme selection
          navigation.replace('ThemeSelection');
        }
      } else {
        const errorMessage = result.error || 'Invalid email or password. Please try again.';
        Alert.alert('Login Failed', errorMessage);
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Connection Error', 'Cannot connect to server. Please check your connection and try again.');
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

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
            placeholder="Enter your email"
            placeholderTextColor={colors.textMuted}
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            keyboardType="email-address"
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

      <TouchableOpacity style={styles.forgotPassword} onPress={() => {}}>
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
    paddingTop: 60,
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
