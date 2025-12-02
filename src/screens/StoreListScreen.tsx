import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../styles/colors';

type StoreListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'StoreList'>;

type Props = {
  navigation: StoreListScreenNavigationProp;
};

type Store = {
  id: string;
  name: string;
  address: string;
  activeTickets: number;
};

// Mock data - replace with API call
const MOCK_STORES: Store[] = [
  { id: '1', name: 'Downtown Store', address: '123 Main St, City', activeTickets: 5 },
  { id: '2', name: 'Westside Store', address: '456 West Ave, City', activeTickets: 3 },
  { id: '3', name: 'Eastside Store', address: '789 East Blvd, City', activeTickets: 4 },
  { id: '4', name: 'North Branch', address: '321 North Rd, City', activeTickets: 6 },
];

export default function StoreListScreen({ navigation }: Props) {
  const handleStorePress = (store: Store) => {
    navigation.navigate('Dashboard', { storeId: store.id, storeName: store.name });
  };

  const handleLogout = () => {
    navigation.replace('Login');
  };

  const renderStoreItem = ({ item }: { item: Store }) => (
    <TouchableOpacity
      style={styles.storeCard}
      onPress={() => handleStorePress(item)}
    >
      <View style={styles.storeHeader}>
        <Text style={styles.storeName}>{item.name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.activeTickets} Active</Text>
        </View>
      </View>
      <Text style={styles.storeAddress}>{item.address}</Text>
      <View style={styles.arrow}>
        <Text style={styles.arrowText}>→</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with Logout */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Stores</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOCK_STORES}
        renderItem={renderStoreItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateStore')}
      >
        <Text style={styles.createButtonText}>+ Create New Store</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.backgroundDark,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 100,
  },
  storeCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  badge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  storeAddress: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  arrow: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  arrowText: {
    fontSize: 24,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  createButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  createButtonText: {
    color: Colors.textLight,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
