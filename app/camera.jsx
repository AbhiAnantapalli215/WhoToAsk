import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Camera } from 'expo-camera';
import { useRouter } from 'expo-router';

export default function CameraScreen() {
  const router = useRouter();
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = Camera.useCameraPermissions();

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Camera</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.webMessage}>
          <Text style={styles.webIcon}>📸</Text>
          <Text style={styles.webTitle}>Camera Not Available</Text>
          <Text style={styles.webSubtitle}>
            Camera access is not available on web browsers. Please use the file upload option to select documents from your device.
          </Text>
          <TouchableOpacity style={styles.webButton} onPress={() => router.back()}>
            <Text style={styles.webButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Camera</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>📸</Text>
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionMessage}>
            We need your permission to access the camera to scan documents.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  function handleCapture() {
    Alert.alert('Photo Captured', 'Document has been scanned successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} >
        <View style={styles.overlay}>
          <Text style={{ color: 'white' }}>Overlay text</Text>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#1A3C6E',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3C6E',
  },
  placeholder: {
    width: 40,
  },
  loadingText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: '#FFFFFF',
  },
  webMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#F7F9FB',
  },
  webIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  webTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A3C6E',
    marginBottom: 12,
  },
  webSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  webButton: {
    backgroundColor: '#1A3C6E',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  webButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#F7F9FB',
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A3C6E',
    marginBottom: 12,
  },
  permissionMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#1A3C6E',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
