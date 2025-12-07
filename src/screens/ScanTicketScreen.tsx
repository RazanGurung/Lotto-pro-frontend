import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, StatusBar, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, Camera } from 'expo-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import { decodeBarcode, formatDecodedData } from '../utils/barcodeDecoder';
import { ticketService } from '../services/api';
import { getUserFriendlyError } from '../utils/errors';

type ScanTicketScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ScanTicket'>;
type ScanTicketScreenRouteProp = RouteProp<RootStackParamList, 'ScanTicket'>;

type Props = {
  navigation: ScanTicketScreenNavigationProp;
  route: ScanTicketScreenRouteProp;
};

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

  const requestCameraPermission = async () => {
    setShowPermissionPrompt(false);
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    // Prevent multiple scans using ref (faster than state)
    if (scanningRef.current) return;

    // Prevent scanning the same barcode twice in a row
    if (lastScannedData.current === data) return;

    scanningRef.current = true;
    lastScannedData.current = data;
    setScanned(true);

    // Add debounce: Allow scanning again after 2 seconds if user doesn't interact with alert
    scanTimeout.current = setTimeout(() => {
      lastScannedData.current = '';
    }, 2000);

    // DEBUG: Log the raw scan data
    console.log('=== BARCODE SCAN DEBUG ===');
    console.log('Type:', type);
    console.log('Raw Data:', data);
    console.log('Length:', data.length);
    console.log('Is Numeric:', /^\d+$/.test(data));
    console.log('========================');

    // Decode the barcode data
    const decoded = decodeBarcode(data);

    if (!decoded.isValid) {
      // Show detailed debug information for unknown formats
      const debugInfo = `
📊 SCAN DEBUG INFO:

Barcode Type: ${type}
Raw Data: ${data}
Data Length: ${data.length} chars
Is Numeric: ${/^\d+$/.test(data) ? 'Yes' : 'No'}

Error: ${decoded.error}

Expected Formats:
• 20 digits: 02302085100671714542
• 15 digits: 023020851006717
• 12 digits: 023020851006
• With dashes: 023-020851-006

Please scan the INFORMATION BARCODE (not the price barcode).
      `.trim();

      Alert.alert(
        'Barcode Not Recognized',
        debugInfo,
        [
          {
            text: 'Try Again',
            onPress: () => resetScanner(),
          },
          {
            text: 'Cancel',
            onPress: () => navigation.goBack(),
          },
        ]
      );
      return;
    }

    // Show decoded information
    const formattedInfo = formatDecodedData(decoded);

    Alert.alert(
      '✓ Ticket Scanned Successfully',
      `${formattedInfo}\n\n━━━━━━━━━━━━━━━━━\nBarcode Type: ${type}\nRaw Data: ${decoded.raw}\n\n⚠️ Please verify the ticket number matches the physical ticket before confirming.`,
      [
        {
          text: 'Scan Again',
          onPress: () => resetScanner(),
          style: 'cancel',
        },
        {
          text: 'Confirm & Save',
          onPress: () => saveTicketToInventory(decoded),
        },
      ]
    );
  };

  const saveTicketToInventory = async (decoded: any) => {
    try {
      setSaving(true);

      const result = await ticketService.saveTicket({
        store_id: parseInt(storeId, 10),
        lottery_game_number: decoded.gameNumber || decoded.raw.substring(0, 3),
        lottery_game_name: decoded.gameName || 'Unknown Game',
        pack_number: decoded.packNumber || '000',
        ticket_number: decoded.ticketNumber || decoded.raw,
        barcode_raw: decoded.raw,
        scanned_at: new Date().toISOString(),
        price: decoded.price || 0,
      });

      if (result.success) {
        Alert.alert(
          'Success',
          'Ticket added to inventory successfully!',
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
        Alert.alert('Error', result.error || 'Failed to save ticket to inventory');
        resetScanner();
      }
    } catch (error) {
      Alert.alert('Error', getUserFriendlyError(error));
      resetScanner();
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

  const handleManualEntry = () => {
    if (!manualBarcode.trim()) {
      Alert.alert('Error', 'Please enter a barcode number');
      return;
    }

    const decoded = decodeBarcode(manualBarcode.trim());

    if (!decoded.isValid) {
      Alert.alert('Invalid Barcode', decoded.error || 'Could not decode barcode');
      return;
    }

    const formattedInfo = formatDecodedData(decoded);

    setShowManualEntry(false);
    setManualBarcode('');

    Alert.alert(
      '✓ Ticket Entered Successfully',
      `${formattedInfo}\n\n━━━━━━━━━━━━━━━━━\nManually Entered\nRaw Data: ${decoded.raw}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Save to Inventory',
          onPress: () => saveTicketToInventory(decoded),
        },
      ]
    );
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
          onBarcodeScanned={handleBarCodeScanned}
          style={styles.camera}
        />
        <View style={styles.scanOverlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanInstruction}>
            {scanned ? 'Ticket Scanned!' : 'Align barcode within frame'}
          </Text>
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
});
