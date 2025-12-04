import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Platform, StatusBar, TextInput, Modal } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import { decodeBarcode, formatDecodedData } from '../utils/barcodeDecoder';

type ScanTicketScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ScanTicket'>;
type ScanTicketScreenRouteProp = RouteProp<RootStackParamList, 'ScanTicket'>;

type Props = {
  navigation: ScanTicketScreenNavigationProp;
  route: ScanTicketScreenRouteProp;
};

export default function ScanTicketScreen({ navigation, route }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);
  const { storeName } = route.params;
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const scanningRef = useRef(false);
  const lastScannedData = useRef<string>('');
  const scanTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();

    // Cleanup timeout on unmount
    return () => {
      if (scanTimeout.current) {
        clearTimeout(scanTimeout.current);
      }
    };
  }, []);

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
      `${formattedInfo}\n\n━━━━━━━━━━━━━━━━━\nBarcode Type: ${type}\nRaw Data: ${decoded.raw}\n\n⚠️ Please verify the ticket number matches the physical ticket before confirming.\n\nInventory has been updated!`,
      [
        {
          text: 'Scan Again',
          onPress: () => resetScanner(),
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            // TODO: Actually save to backend here
            navigation.goBack();
          },
        },
      ]
    );

    // TODO: Update backend/database with the decoded ticket info
    // updateTicketInventory(decoded);
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
      `${formattedInfo}\n\n━━━━━━━━━━━━━━━━━\nManually Entered\nRaw Data: ${decoded.raw}\n\nInventory has been updated!`,
      [
        {
          text: 'Done',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No access to camera</Text>
        <Text style={styles.submessage}>Please enable camera permissions in your device settings</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
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
  message: {
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  submessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 40,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
