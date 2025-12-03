import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme, Text } from 'react-native';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import StoreListScreen from '../screens/StoreListScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LotteryDetailScreen from '../screens/LotteryDetailScreen';
import CreateStoreScreen from '../screens/CreateStoreScreen';
import PrintReportScreen from '../screens/PrintReportScreen';
import ScanTicketScreen from '../screens/ScanTicketScreen';
import ProfileScreen from '../screens/ProfileScreen';
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
  MainTabs: undefined;
  StoreList: undefined;
  CreateStore: undefined;
  Profile: undefined;
  Dashboard: {
    storeId: string;
    storeName: string;
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
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 20,
          paddingTop: 15,
          height: 95,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="StoreList"
        component={StoreListScreen}
        options={{
          tabBarLabel: 'My Stores',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 28 }}>🏪</Text>,
        }}
      />
      <Tab.Screen
        name="CreateStore"
        component={CreateStoreScreen}
        options={{
          tabBarLabel: 'Add Store',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 28 }}>➕</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 28 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
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
          name="MainTabs"
          component={MainTabNavigator}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
