import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import StoreListScreen from '../screens/StoreListScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LotteryDetailScreen from '../screens/LotteryDetailScreen';
import CreateStoreScreen from '../screens/CreateStoreScreen';
import PrintReportScreen from '../screens/PrintReportScreen';
import ScanTicketScreen from '../screens/ScanTicketScreen';
import { Colors } from '../styles/colors';

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
  StoreList: undefined;
  CreateStore: undefined;
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

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.secondary,
          headerTitleStyle: {
            fontWeight: 'bold',
            color: Colors.textLight,
          },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="StoreList"
          component={StoreListScreen}
          options={{ title: 'My Stores' }}
        />
        <Stack.Screen
          name="CreateStore"
          component={CreateStoreScreen}
          options={{ title: 'Create Store' }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: 'Lottery Dashboard' }}
        />
        <Stack.Screen
          name="LotteryDetail"
          component={LotteryDetailScreen}
          options={{ title: 'Lottery Details' }}
        />
        <Stack.Screen
          name="PrintReport"
          component={PrintReportScreen}
          options={{ title: 'Generate Report' }}
        />
        <Stack.Screen
          name="ScanTicket"
          component={ScanTicketScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
