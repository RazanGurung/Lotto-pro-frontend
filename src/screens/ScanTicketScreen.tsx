import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, StatusBar, TextInput, Modal, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, Camera } from 'expo-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import { ticketService, lotteryService } from '../services/api';
import { getUserFriendlyError } from '../utils/errors';

type ScanTicketScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ScanTicket'>;
type ScanTicketScreenRouteProp = RouteProp<RootStackParamList, 'ScanTicket'>;

type Props = {
  navigation: ScanTicketScreenNavigationProp;
  route: ScanTicketScreenRouteProp;
};

interface LotteryType {
  lottery_id: number;
  lottery_name: string;
  lottery_number: string;
  state: string;
  price: number;
  status: string;
}

export default function ScanTicketScreen({ navigation, route }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);
  const { storeId, storeName } = route.params;
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lotteryTypes, setLotteryTypes] = useState<LotteryType[]>([]);
  const [lotteryTypesLoading, setLotteryTypesLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingBarcode, setPendingBarcode] = useState<{barcode: string, type: string, lotteryName: string, imageUrl?: string} | null>(null);
  const scanningRef = useRef(false);
  const lastScannedData = useRef<string>('');
  const scanTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkCameraPermissions = async () => {
      const { status } = await Camera.getCameraPermissionsAsync();

      if (status === 'granted') {
        setHasPermission(true);
      } else if (status === 'undetermined') {
        // Show custom prompt before system dialog
        setShowPermissionPrompt(true);
      } else {
        setHasPermission(false);
      }
    };

    checkCameraPermissions();

    // Cleanup timeout on unmount
    return () => {
      if (scanTimeout.current) {
        clearTimeout(scanTimeout.current);
      }
    };
  }, []);

  // Fetch lottery types when screen loads
  useEffect(() => {
    const fetchLotteryTypes = async () => {
      try {
        setLotteryTypesLoading(true);
        console.log('Fetching lottery types for store:', storeId);
        const result = await lotteryService.getLotteryTypes(parseInt(storeId, 10));

        if (result.success && result.data) {
          // Extract lotteryTypes array from the response
          const types = result.data.lotteryTypes || result.data.data || result.data;
          console.log('Lottery types loaded:', types);

          if (Array.isArray(types)) {
            console.log('Setting lottery types:', types.map(t => ({
              number: t.lottery_number,
              name: t.lottery_name
            })));
            setLotteryTypes(types);
          } else {
            console.error('Lottery types is not an array:', types);
            setLotteryTypes([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch lottery types:', error);
      } finally {
        setLotteryTypesLoading(false);
      }
    };

    fetchLotteryTypes();
  }, [storeId]);

  const requestCameraPermission = async () => {
    setShowPermissionPrompt(false);
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    // Prevent scanning while lottery types are loading
    if (lotteryTypesLoading) {
      console.log('Scan blocked - lottery types still loading');
      return;
    }

    // Prevent multiple scans using ref (faster than state)
    if (scanningRef.current) {
      console.log('Scan blocked - already scanning');
      return;
    }

    // Prevent scanning the same barcode twice in a row
    if (lastScannedData.current === data) {
      console.log('Scan blocked - same barcode');
      return;
    }

    scanningRef.current = true;
    lastScannedData.current = data;
    setScanned(true);

    // DEBUG: Log the raw scan data
    console.log('=== BARCODE SCAN DEBUG ===');
    console.log('Type:', type);
    console.log('Raw Data:', data);
    console.log('Length:', data.length);
    console.log('Is Numeric:', /^\d+$/.test(data));

    // Extract first 3 digits to identify lottery game
    const first3Digits = data.substring(0, 3);
    console.log('First 3 digits:', first3Digits);
    console.log('Lottery types loaded:', lotteryTypes.length);
    console.log('Lottery types:', lotteryTypes.map(l => ({
      number: l.lottery_number,
      name: l.lottery_name
    })));

    // Find matching lottery by game number
    const matchedLottery = lotteryTypes.find(
      lottery => lottery.lottery_number === first3Digits
    );

    console.log('Matched lottery:', matchedLottery);
    console.log('========================');

    if (matchedLottery) {
      // Show confirmation popup with lottery name and image
      setPendingBarcode({
        barcode: data,
        type: type,
        lotteryName: matchedLottery.lottery_name,
        imageUrl: matchedLottery.image_url
      });
      setShowConfirmation(true);
    } else {
      // Lottery not found - show error
      Alert.alert(
        'Unknown Lottery Game',
        `Could not identify lottery game with number "${first3Digits}".\n\nAvailable lottery types: ${lotteryTypes.length}\n\nPlease ensure this lottery game is available in your system.`,
        [
          {
            text: 'Try Again',
            onPress: () => resetScanner(),
          },
          {
            text: 'Manual Entry',
            onPress: () => {
              resetScanner();
              setShowManualEntry(true);
            },
          },
        ]
      );
      // Don't reset scanner immediately, let the alert handle it
    }
  };

  const processScannedBarcode = async (rawBarcode: string, barcodeType: string) => {
    try {
      setSaving(true);

      // Send raw barcode to backend
      const result = await ticketService.scanTicket(rawBarcode, parseInt(storeId, 10));

      if (result.success) {
        // Backend successfully processed the barcode
        const ticketInfo = result.data || {};

        Alert.alert(
          '✓ Ticket Scanned Successfully',
          `${ticketInfo.lottery_game_name || 'Lottery Ticket'}\n\nGame #${ticketInfo.lottery_game_number || 'N/A'}\nPack: ${ticketInfo.pack_number || 'N/A'}\nTicket: ${ticketInfo.ticket_number || 'N/A'}\nPrice: $${ticketInfo.price || '0.00'}\n\n━━━━━━━━━━━━━━━━━\nBarcode Type: ${barcodeType}\nRaw Data: ${rawBarcode}\n\n✓ Ticket added to inventory`,
          [
            {
              text: 'Scan Another',
              onPress: () => resetScanner(),
            },
            {
              text: 'View Inventory',
              onPress: () => {
                navigation.replace('StoreLotteryDashboard', {
                  storeId: parseInt(storeId, 10),
                  storeName
                });
              },
            },
          ]
        );
      } else {
        // Backend returned an error - show clean user-friendly message
        const errorMessage = result.error || 'Failed to process barcode. Please try again or enter manually.';

        Alert.alert(
          'Unable to Process Barcode',
          errorMessage,
          [
            {
              text: 'Try Again',
              onPress: () => resetScanner(),
            },
            {
              text: 'Manual Entry',
              onPress: () => {
                resetScanner();
                setShowManualEntry(true);
              },
            },
          ]
        );
      }
    } catch (error) {
      // Network or unexpected errors
      console.log('Scan error caught:', error); // Log for debugging but don't display
      Alert.alert(
        'Connection Error',
        'Unable to connect to the server. Please check your internet connection and try again.',
        [
          {
            text: 'Try Again',
            onPress: () => resetScanner(),
          },
        ]
      );
    } finally {
      setSaving(false);
    }
  };

  const resetScanner = () => {
    // Reset all scanning states
    setScanned(false);
    scanningRef.current = false;
    lastScannedData.current = '';

    // Clear any pending timeout
    if (scanTimeout.current) {
      clearTimeout(scanTimeout.current);
      scanTimeout.current = null;
    }
  };

  const handleConfirmBarcode = () => {
    if (pendingBarcode) {
      setShowConfirmation(false);
      processScannedBarcode(pendingBarcode.barcode, pendingBarcode.type);
      setPendingBarcode(null);
    }
  };

  const handleCancelBarcode = () => {
    setShowConfirmation(false);
    setPendingBarcode(null);
    resetScanner();
  };

  const handleManualEntry = () => {
    if (!manualBarcode.trim()) {
      Alert.alert('Error', 'Please enter a barcode number');
      return;
    }

    setShowManualEntry(false);
    const enteredBarcode = manualBarcode.trim();
    setManualBarcode('');

    // Extract first 3 digits to identify lottery game
    const first3Digits = enteredBarcode.substring(0, 3);
    const matchedLottery = lotteryTypes.find(
      lottery => lottery.lottery_number === first3Digits
    );

    if (matchedLottery) {
      // Show confirmation popup with lottery name and image
      setPendingBarcode({
        barcode: enteredBarcode,
        type: 'manual',
        lotteryName: matchedLottery.lottery_name,
        imageUrl: matchedLottery.image_url
      });
      setShowConfirmation(true);
    } else {
      // Lottery not found - show error
      Alert.alert(
        'Unknown Lottery Game',
        `Could not identify lottery game with number "${first3Digits}". Please ensure the lottery game is available in your system.`
      );
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={colors.textMuted} />
          <Text style={styles.message}>Requesting Camera Access...</Text>
          <Text style={styles.submessage}>Please allow camera permission to scan lottery tickets</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="lock-closed-outline" size={64} color={colors.error} />
          <Text style={styles.message}>Camera Access Required</Text>
          <Text style={styles.submessage}>
            Lottery Pro needs camera access to scan lottery ticket barcodes and manage your inventory efficiently.
          </Text>
          <Text style={styles.instructionText}>
            To enable camera access:
          </Text>
          <Text style={styles.stepText}>1. Go to your device Settings</Text>
          <Text style={styles.stepText}>2. Find "Lottery Pro" in app list</Text>
          <Text style={styles.stepText}>3. Enable Camera permission</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scan Lottery Ticket</Text>
          <Text style={styles.headerSubtitle}>{storeName}</Text>
        </View>
      </SafeAreaView>

      <View style={styles.cameraContainer}>
        <CameraView
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.camera}
        />
        <View style={styles.scanOverlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanInstruction}>
            {lotteryTypesLoading
              ? 'Loading lottery data...'
              : scanned
              ? 'Ticket Scanned!'
              : 'Align barcode within frame'}
          </Text>
          {lotteryTypesLoading && (
            <ActivityIndicator
              size="large"
              color={colors.secondary}
              style={{ marginTop: 20 }}
            />
          )}
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📱 Scanning Tips</Text>
          <Text style={styles.infoText}>• Scan INFORMATION barcode (long one)</Text>
          <Text style={styles.infoText}>• Ensure good lighting</Text>
          <Text style={styles.infoText}>• Hold phone steady & in focus</Text>
          <Text style={styles.infoText}>• Keep barcode flat & aligned</Text>
          <Text style={styles.infoText}>• Verify numbers after scanning</Text>
        </View>

        <TouchableOpacity
          style={styles.manualEntryButton}
          onPress={() => setShowManualEntry(true)}
        >
          <Ionicons name="create-outline" size={20} color={colors.primary} />
          <Text style={styles.manualEntryButtonText}>Manual Entry</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        {scanned && (
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={resetScanner}
          >
            <Text style={styles.scanAgainButtonText}>Scan Another Ticket</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Manual Entry Modal */}
      <Modal
        visible={showManualEntry}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowManualEntry(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manual Barcode Entry</Text>
              <TouchableOpacity onPress={() => setShowManualEntry(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalInstructions}>
              Enter the barcode number from the lottery ticket
            </Text>

            <TextInput
              style={styles.barcodeInput}
              placeholder="e.g., 02302085100671714542"
              placeholderTextColor={colors.textMuted}
              value={manualBarcode}
              onChangeText={setManualBarcode}
              keyboardType="numeric"
              autoFocus
            />

            <Text style={styles.formatHint}>
              Format: 12, 15, or 20 digits
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => {
                  setShowManualEntry(false);
                  setManualBarcode('');
                }}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleManualEntry}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Camera Permission Prompt Modal */}
      <Modal
        visible={showPermissionPrompt}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setShowPermissionPrompt(false);
          navigation.goBack();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.permissionModalContent}>
            <View style={styles.permissionIconContainer}>
              <Ionicons name="camera" size={72} color={colors.primary} />
            </View>

            <Text style={styles.permissionModalTitle}>Camera Access Required</Text>

            <Text style={styles.permissionModalDescription}>
              Lottery Pro needs access to your camera to scan lottery ticket barcodes quickly and accurately.
            </Text>

            <View style={styles.permissionFeatures}>
              <View style={styles.permissionFeature}>
                <Ionicons name="scan" size={24} color={colors.primary} />
                <Text style={styles.permissionFeatureText}>Scan tickets instantly</Text>
              </View>
              <View style={styles.permissionFeature}>
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                <Text style={styles.permissionFeatureText}>Manage inventory efficiently</Text>
              </View>
              <View style={styles.permissionFeature}>
                <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
                <Text style={styles.permissionFeatureText}>Your privacy is protected</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.allowButton}
              onPress={requestCameraPermission}
            >
              <Text style={styles.allowButtonText}>Allow Camera Access</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.denyButton}
              onPress={() => {
                setShowPermissionPrompt(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.denyButtonText}>Not Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Barcode Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelBarcode}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModalContent}>
            {pendingBarcode?.imageUrl ? (
              <View style={styles.confirmationImageContainer}>
                <Image
                  source={{ uri: pendingBarcode.imageUrl }}
                  style={styles.confirmationImage}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <View style={styles.confirmationIconContainer}>
                <Ionicons name="ticket" size={64} color={colors.primary} />
              </View>
            )}

            <Text style={styles.confirmationTitle}>Confirm Lottery Ticket</Text>

            <Text style={styles.confirmationLotteryName}>
              {pendingBarcode?.lotteryName}
            </Text>

            <View style={styles.confirmationBarcodeContainer}>
              <Text style={styles.confirmationBarcodeLabel}>Barcode:</Text>
              <Text style={styles.confirmationBarcodeValue}>
                {pendingBarcode?.barcode}
              </Text>
            </View>

            <Text style={styles.confirmationQuestion}>
              Is this the correct lottery ticket?
            </Text>

            <View style={styles.confirmationActions}>
              <TouchableOpacity
                style={[styles.confirmationButton, styles.cancelConfirmButton]}
                onPress={handleCancelBarcode}
                disabled={saving}
              >
                <Text style={styles.cancelConfirmButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmationButton, styles.confirmConfirmButton]}
                onPress={handleConfirmBarcode}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.confirmConfirmButtonText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  safeArea: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.9,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 340,
    height: 100,
    borderWidth: 3,
    borderColor: colors.secondary,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  scanInstruction: {
    marginTop: 30,
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bottomSection: {
    backgroundColor: colors.surface,
    padding: 20,
  },
  infoCard: {
    backgroundColor: colors.backgroundDark,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  cancelButton: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  scanAgainButton: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  scanAgainButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  manualEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 10,
    gap: 8,
  },
  manualEntryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  modalInstructions: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  barcodeInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  formatHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelModalButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  submessage: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  stepText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 32,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 40,
    marginTop: 24,
    minWidth: 200,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionModalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 28,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  permissionIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  permissionModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionModalDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  permissionFeatures: {
    width: '100%',
    marginBottom: 28,
  },
  permissionFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  permissionFeatureText: {
    fontSize: 15,
    color: colors.textPrimary,
    marginLeft: 16,
    fontWeight: '500',
  },
  allowButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  allowButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: 'bold',
  },
  denyButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  denyButtonText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmationModalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 28,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  confirmationIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmationImageContainer: {
    width: 140,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary + '30',
    alignSelf: 'center',
  },
  confirmationImage: {
    width: '100%',
    height: '100%',
  },
  confirmationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  confirmationLotteryName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  confirmationBarcodeContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confirmationBarcodeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  confirmationBarcodeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  confirmationQuestion: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmationActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmationButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  cancelConfirmButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelConfirmButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmConfirmButton: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmConfirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
