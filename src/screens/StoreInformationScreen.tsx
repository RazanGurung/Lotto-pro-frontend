import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { storeService } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

type Props = {
  navigation: any;
};

type Store = {
  id: number;
  owner_id: number;
  store_name: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  lottery_ac_no: string;
  lottery_pw: string;
  created_at: string;
  updated_at?: string;
};

export default function StoreInformationScreen({ navigation }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchStores();
    }, [])
  );

  const fetchStores = async () => {
    try {
      setLoading(true);
      const result = await storeService.getStores();

      if (result.success && result.data) {
        const storesData = Array.isArray(result.data) ? result.data : result.data.stores || [];
        setStores(storesData);
      } else {
        setStores([]);
      }
    } catch (error) {
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStores();
    setRefreshing(false);
  };

  const formatAddress = (store: Store) => {
    const parts = [store.address, store.city, store.state, store.zipcode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'No address provided';
  };

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
          <Text style={styles.storeName}>{item.store_name}</Text>
          <View style={[styles.statusBadge, styles.activeBadge]}>
            <Text style={[styles.statusText, styles.activeText]}>
              Active
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.infoText}>{formatAddress(item)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="key-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.infoText}>Account: ••••{item.lottery_ac_no.slice(-4)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.infoText}>Password: ••••</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.infoText}>Created: {new Date(item.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</Text>
        </View>

        {item.updated_at && (
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.infoText}>Last Updated: {new Date(item.updated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.editText}>Tap to edit details</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Store Information</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading stores...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Store Information</Text>
        <View style={{ width: 40 }} />
      </View>

      {stores.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="storefront-outline" size={80} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No Stores Found</Text>
          <Text style={styles.emptyText}>Create your first store to get started</Text>
        </View>
      ) : (
        <FlatList
          data={stores}
          renderItem={renderStoreCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
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
