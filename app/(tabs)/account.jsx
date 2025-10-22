import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function AccountScreen() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [showSendDataModal, setShowSendDataModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [user, setUser] = useState(null);

  // Listen for Firebase Auth user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const handleSwitchAccount = () => {
    Alert.alert('Switch Account', 'Redirecting to login...');
    router.replace('/auth'); // Navigate back to login page
  };

  const handlePhoneNumber = () => {
    Alert.alert('Phone Number', 'Feature coming soon.');
  };

  const handleSendSessionData = () => {
    setShowSendDataModal(true);
  };

  const handleSendEmail = () => {
    if (recipientEmail.trim() === '') {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }
    if (!recipientEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    Alert.alert('Success', `Session data will be sent to ${recipientEmail}`);
    setRecipientEmail('');
    setShowSendDataModal(false);
  };

  const handleLegalTerms = () => {
    Alert.alert('Legal Terms & Privacy Policy', 'This would open the legal terms and privacy policy document.');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/auth');
    } catch (err) {
      Alert.alert('Logout failed', err.message || String(err));
    }
  };
  
  // Show fallback if user not logged in
  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>You’re not logged in.</Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#1A3C6E',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 8,
          }}
          onPress={() => router.replace('/auth')}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const profileName = user.displayName || 'Anonymous User';
  const profileEmail = user.email;
  const profilePhoto = user.photoURL;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {profilePhoto ? (
            <Image source={{ uri: profilePhoto }} style={styles.profileImageReal} />
          ) : (
            <View style={styles.profileImage}>
              <Text style={styles.profileInitials}>
                {profileName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.profileName}>{profileName}</Text>
          <Text style={styles.profileEmail}>{profileEmail}</Text>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem} onPress={handleSwitchAccount}>
            <Text style={styles.menuItemText}>Switch Account</Text>
            <Text style={styles.menuItemIcon}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={handlePhoneNumber}>
            <Text style={styles.menuItemText}>Phone Number</Text>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>+1 *** *** 1234</Text>
              <Text style={styles.menuItemIcon}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>APP PREFERENCES</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemText}>Enable Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#D1D5DB', true: '#4BA3FF' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={handleSendSessionData}>
            <Text style={styles.menuItemText}>Send Session Data</Text>
            <Text style={styles.menuItemIcon}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>LEGAL & SUPPORT</Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem} onPress={handleLegalTerms}>
            <Text style={styles.menuItemText}>Legal Terms & Privacy Policy</Text>
            <Text style={styles.menuItemIcon}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Send Session Modal */}
      <Modal
        visible={showSendDataModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSendDataModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Session Data</Text>
            <Text style={styles.modalSubtitle}>
              Enter the email address of your lawyer or accountant
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="email@example.com"
              placeholderTextColor="#9CA3AF"
              value={recipientEmail}
              onChangeText={setRecipientEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setRecipientEmail('');
                  setShowSendDataModal(false);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalSendButton]}
                onPress={handleSendEmail}
              >
                <Text style={styles.modalSendText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ⬇️ (Keep your styles exactly the same as before, just add this small one)
const styles = StyleSheet.create({
  // ... keep everything from your current styles ...
  profileImageReal: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A3C6E',
    flex: 1,
    textAlign: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 24,
    color: '#1A3C6E',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileInitials: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A3C6E',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 15,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1F2937',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemValue: {
    fontSize: 15,
    color: '#6B7280',
    marginRight: 8,
  },
  menuItemIcon: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  bottomPadding: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A3C6E',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#F3F4F6',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalSendButton: {
    backgroundColor: '#1A3C6E',
  },
  modalSendText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
