import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import StoreDashboardScreen from '../screens/StoreDashboardScreen';
import StoreListScreen from '../screens/StoreListScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LotteryDetailScreen from '../screens/LotteryDetailScreen';
import CreateStoreScreen from '../screens/CreateStoreScreen';
import PrintReportScreen from '../screens/PrintReportScreen';
import ScanTicketScreen from '../screens/ScanTicketScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsTabScreen from '../screens/NotificationsScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import StoreInformationScreen from '../screens/StoreInformationScreen';
import EditStoreScreen from '../screens/EditStoreScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import DarkModeScreen from '../screens/DarkModeScreen';
import PrivacySecurityScreen from '../screens/PrivacySecurityScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import PaymentManagementScreen from '../screens/PaymentManagementScreen';
import ThemeSelectionScreen from '../screens/ThemeSelectionScreen';
import LotteryOrganizationListScreen from '../screens/LotteryOrganizationListScreen';
import LotteryOrganizationDashboardScreen from '../screens/LotteryOrganizationDashboardScreen';
import AddLotteryGameScreen from '../screens/AddLotteryGameScreen';
import EditLotteryGameScreen from '../screens/EditLotteryGameScreen';
import LotteryGameDetailScreen from '../screens/LotteryGameDetailScreen';
import StoreLotteryDashboardScreen from '../screens/StoreLotteryDashboardScreen';
import StoreLotteryGameDetailScreen from '../screens/StoreLotteryGameDetailScreen';
import { lightTheme, darkTheme } from '../styles/colors';

type ScratchOffLottery = {
  id: string;
  name: string;
  price: number;
  totalCount: number;
  currentCount: number;
  image: string;
};

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ThemeSelection: undefined;
  MainTabs: undefined;
  StoreDashboard: undefined;
  StoreList: undefined;
  CreateStore: undefined;
  Profile: undefined;
  HelpSupport: undefined;
  EditProfile: undefined;
  StoreInformation: undefined;
  EditStore: {
    store: any;
  };
  Notifications: undefined;
  NotificationSettings: undefined;
  DarkMode: undefined;
  PrivacySecurity: undefined;
  ChangePassword: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  PaymentManagement: undefined;
  LotteryOrganizationList: undefined;
  LotteryOrganizationDashboard: {
    organizationId: string;
    organizationName: string;
    state: string;
  };
  AddLotteryGame: {
    state: string;
    organizationName: string;
  };
  EditLotteryGame: {
    game: any;
  };
  LotteryGameDetail: {
    game: any;
  };
  Dashboard: {
    storeId: string;
    storeName: string;
    state: string;
  };
  LotteryDetail: {
    lottery: ScratchOffLottery;
  };
  PrintReport: {
    storeId: string;
    storeName: string;
  };
  ScanTicket: {
    storeId: string;
    storeName: string;
  };
  StoreLotteryDashboard: {
    storeId: number;
    storeName: string;
  };
  StoreLotteryGameDetail: {
    game: any;
    storeId: string;
    storeName: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkTheme : lightTheme;
  const unreadCount = 3; // Mock unread count - replace with actual data from context/state
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const getUserType = async () => {
      const type = await AsyncStorage.getItem('@user_type');
      console.log('=== TAB NAVIGATOR ===');
      console.log('User type from storage:', type);
      setUserType(type || 'store_owner');
      console.log('Using userType:', type || 'store_owner');
      console.log('Is SuperAdmin?', type === 'superadmin');
      console.log('====================');
    };
    getUserType();
  }, []);

  // Show loading or default while determining user type
  if (!userType) {
    return null;
  }

  const isSuperAdmin = userType === 'superadmin';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          paddingBottom: Platform.OS === 'ios' ? 25 : 15,
          paddingTop: 0,
          height: Platform.OS === 'ios' ? 85 : 70,
          elevation: 8,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
        tabBarItemStyle: {
          paddingTop: 5,
        },
      }}
    >
      {isSuperAdmin ? (
        // Super Admin Tabs
        <>
          <Tab.Screen
            name="LotteryOrganizationList"
            component={LotteryOrganizationListScreen}
            options={{
              tabBarLabel: 'Lotteries',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'business' : 'business-outline'}
                  size={22}
                  color={color}
                />
              ),
            }}
          />
          <Tab.Screen
            name="NotificationsTab"
            component={NotificationsTabScreen}
            options={{
              tabBarLabel: 'Alerts',
              tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
              tabBarBadgeStyle: {
                backgroundColor: colors.error,
                color: colors.white,
                fontSize: 10,
                fontWeight: 'bold',
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                lineHeight: 18,
              },
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'notifications' : 'notifications-outline'}
                  size={22}
                  color={color}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarLabel: 'Settings',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'settings' : 'settings-outline'}
                  size={22}
                  color={color}
                />
              ),
            }}
          />
        </>
      ) : (
        // Store Owner / Store Tabs
        <>
          <Tab.Screen
            name="StoreList"
            component={StoreListScreen}
            options={{
              tabBarLabel: 'Stores',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'storefront' : 'storefront-outline'}
                  size={22}
                  color={color}
                />
              ),
            }}
          />
          <Tab.Screen
            name="CreateStore"
            component={CreateStoreScreen}
            options={{
              tabBarLabel: 'Add Store',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'add-circle' : 'add-circle-outline'}
                  size={22}
                  color={color}
                />
              ),
            }}
          />
          <Tab.Screen
            name="NotificationsTab"
            component={NotificationsTabScreen}
            options={{
              tabBarLabel: 'Alerts',
              tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
              tabBarBadgeStyle: {
                backgroundColor: colors.error,
                color: colors.white,
                fontSize: 10,
                fontWeight: 'bold',
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                lineHeight: 18,
              },
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'notifications' : 'notifications-outline'}
                  size={22}
                  color={color}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarLabel: 'Settings',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'settings' : 'settings-outline'}
                  size={22}
                  color={color}
                />
              ),
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false, // Hide all default headers
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
        />
        <Stack.Screen
          name="ThemeSelection"
          component={ThemeSelectionScreen}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
        />
        <Stack.Screen
          name="StoreDashboard"
          component={StoreDashboardScreen}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
        />
        <Stack.Screen
          name="LotteryDetail"
          component={LotteryDetailScreen}
        />
        <Stack.Screen
          name="PrintReport"
          component={PrintReportScreen}
        />
        <Stack.Screen
          name="ScanTicket"
          component={ScanTicketScreen}
        />
        <Stack.Screen
          name="StoreLotteryDashboard"
          component={StoreLotteryDashboardScreen}
        />
        <Stack.Screen
          name="HelpSupport"
          component={HelpSupportScreen}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
        />
        <Stack.Screen
          name="StoreInformation"
          component={StoreInformationScreen}
        />
        <Stack.Screen
          name="EditStore"
          component={EditStoreScreen}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
        />
        <Stack.Screen
          name="NotificationSettings"
          component={NotificationSettingsScreen}
        />
        <Stack.Screen
          name="DarkMode"
          component={DarkModeScreen}
        />
        <Stack.Screen
          name="PrivacySecurity"
          component={PrivacySecurityScreen}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePasswordScreen}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
        />
        <Stack.Screen
          name="TermsOfService"
          component={TermsOfServiceScreen}
        />
        <Stack.Screen
          name="PaymentManagement"
          component={PaymentManagementScreen}
        />
        <Stack.Screen
          name="LotteryOrganizationList"
          component={LotteryOrganizationListScreen}
        />
        <Stack.Screen
          name="LotteryOrganizationDashboard"
          component={LotteryOrganizationDashboardScreen}
        />
        <Stack.Screen
          name="AddLotteryGame"
          component={AddLotteryGameScreen}
        />
        <Stack.Screen
          name="EditLotteryGame"
          component={EditLotteryGameScreen}
        />
        <Stack.Screen
          name="LotteryGameDetail"
          component={LotteryGameDetailScreen}
        />
        <Stack.Screen
          name="StoreLotteryGameDetail"
          component={StoreLotteryGameDetailScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
