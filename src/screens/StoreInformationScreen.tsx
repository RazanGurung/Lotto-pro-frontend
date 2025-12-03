import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

type Props = {
  navigation: any;
};

type Store = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  manager: string;
  licenseNumber: string;
  status: 'Active' | 'Inactive';
};

// Mock data - replace with API call
const MOCK_STORES: Store[] = [
  {
    id: '1',
    name: 'Downtown Store',
    address: '123 Main St, City, State 12345',
    phone: '+1 (234) 567-8901',
    email: 'downtown@lotterypro.com',
    manager: 'John Doe',
    licenseNumber: 'LIC-2024-001',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Westside Store',
    address: '456 West Ave, City, State 12345',
    phone: '+1 (234) 567-8902',
    email: 'westside@lotterypro.com',
    manager: 'Jane Smith',
    licenseNumber: 'LIC-2024-002',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Eastside Store',
    address: '789 East Blvd, City, State 12345',
    phone: '+1 (234) 567-8903',
    email: 'eastside@lotterypro.com',
    manager: 'Mike Johnson',
    licenseNumber: 'LIC-2024-003',
    status: 'Active',
  },
  {
    id: '4',
    name: 'North Branch',
    address: '321 North Rd, City, State 12345',
    phone: '+1 (234) 567-8904',
    email: 'north@lotterypro.com',
    manager: 'Sarah Williams',
    licenseNumber: 'LIC-2024-004',
    status: 'Inactive',
  },
];

export default function StoreInformationScreen({ navigation }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);

  const renderStoreCard = ({ item }: { item: Store }) => (
    <TouchableOpacity
      style={styles.storeCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('EditStore', { store: item })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.storeIconContainer}>
          <Ionicons name="storefront" size={24} color={colors.primary} />
        </View>
        <View style={styles.storeHeaderInfo}>
          <Text style={styles.storeName}>{item.name}</Text>
          <View style={[styles.statusBadge, item.status === 'Active' ? styles.activeBadge : styles.inactiveBadge]}>
            <Text style={[styles.statusText, item.status === 'Active' ? styles.activeText : styles.inactiveText]}>
              {item.status}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.infoText}>{item.address}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.infoText}>{item.phone}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.infoText}>{item.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.infoText}>Manager: {item.manager}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.infoText}>License: {item.licenseNumber}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.editText}>Tap to edit details</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Store Information</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={MOCK_STORES}
        renderItem={renderStoreCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  safeArea: {
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  storeCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  storeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  storeHeaderInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: colors.success + '20',
  },
  inactiveBadge: {
    backgroundColor: colors.textMuted + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: colors.success,
  },
  inactiveText: {
    color: colors.textMuted,
  },
  cardBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  cardFooter: {
    padding: 12,
    backgroundColor: colors.primary + '08',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: 'center',
  },
  editText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});
