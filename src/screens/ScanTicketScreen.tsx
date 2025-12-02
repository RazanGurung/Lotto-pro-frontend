import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../styles/colors';
import { decodeBarcode, formatDecodedData } from '../utils/barcodeDecoder';

type ScanTicketScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ScanTicket'>;
type ScanTicketScreenRouteProp = RouteProp<RootStackParamList, 'ScanTicket'>;

type Props = {
  navigation: ScanTicketScreenNavigationProp;
  route: ScanTicketScreenRouteProp;
};

export default function ScanTicketScreen({ navigation, route }: Props) {
  const { storeName } = route.params;
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);

    // Decode the barcode data
    const decoded = decodeBarcode(data);

    if (!decoded.isValid) {
      Alert.alert(
        'Invalid Barcode',
        `Could not decode barcode.\n\nRaw data: ${decoded.raw}\n\nError: ${decoded.error}`,
        [
          {
            text: 'Try Again',
            onPress: () => setScanned(false),
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
      `${formattedInfo}\n\n━━━━━━━━━━━━━━━━━\nRaw Barcode: ${decoded.raw}\n\nInventory has been updated!`,
      [
        {
          text: 'Scan Another',
          onPress: () => setScanned(false),
        },
        {
          text: 'Done',
          onPress: () => navigation.goBack(),
          style: 'cancel',
        },
      ]
    );

    // TODO: Update backend/database with the decoded ticket info
    // updateTicketInventory(decoded);
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan Lottery Ticket</Text>
        <Text style={styles.headerSubtitle}>{storeName}</Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'],
          }}
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
          <Text style={styles.infoTitle}>📱 How to Scan</Text>
          <Text style={styles.infoText}>1. Point camera at ticket barcode</Text>
          <Text style={styles.infoText}>2. Hold steady until scanned</Text>
          <Text style={styles.infoText}>3. Inventory updates automatically</Text>
        </View>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        {scanned && (
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.scanAgainButtonText}>Scan Another Ticket</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 20,
    paddingTop: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textLight,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
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
    width: 300,
    height: 150,
    borderWidth: 3,
    borderColor: Colors.secondary,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scanInstruction: {
    marginTop: 30,
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bottomSection: {
    backgroundColor: Colors.white,
    padding: 20,
  },
  infoCard: {
    backgroundColor: Colors.backgroundDark,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  cancelButton: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  scanAgainButton: {
    backgroundColor: Colors.secondary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  scanAgainButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 18,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 10,
  },
  submessage: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 40,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
