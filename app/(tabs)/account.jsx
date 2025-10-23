import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Image,
  ActivityIndicator, 
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../firebaseConfig'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  getDocs 
} from 'firebase/firestore'; 
import * as Print from 'expo-print'; // <-- FIXED: Was 'Next'
import * as FileSystem from 'expo-file-system/legacy';
import * as MailComposer from 'expo-mail-composer';

export default function AccountScreen() {
  const router = useRouter();
  const [showSendDataModal, setShowSendDataModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [user, setUser] = useState(null);

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null); 
  const [isSending, setIsSending] = useState(false); 

  // Listen for Firebase Auth user (This part was correct)
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        setLoadingSessions(true);
        const sessionsRef = collection(db, 'users', currentUser.uid, 'sessions');
        const q = query(sessionsRef, orderBy('createdAt', 'desc'));

        const unsubscribeSessions = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || 'Untitled Session',
            // We can also grab the icon/color here if needed
            icon: doc.data().icon,
            color: doc.data().color,
          }));
          setSessions(data);
          setLoadingSessions(false);
        }, (error) => {
          console.error("Error fetching sessions: ", error);
          setLoadingSessions(false);
        });

        return () => unsubscribeSessions();
      } else {
        setSessions([]);
        setLoadingSessions(false);
      }
    });

    return () => unsubscribeAuth(); 
  }, []);

  const handleSendSessionData = () => {
    setRecipientEmail('');
    setSelectedSession(null);
    setIsSending(false);
    setShowSendDataModal(true);
  };

  // --- MODIFIED: This function is now fixed ---
  // --- MODIFIED: This now generates a professional, unstyled PDF ---
  const handleSendEmail = async () => {
    if (!selectedSession) {
      Alert.alert('Error', 'Please select a session to send.');
      return;
    }
    if (recipientEmail.trim() === '' || !recipientEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid recipient email address.');
      return;
    }

    setIsSending(true); // Show sending loader

    try {
      // 1. Fetch messages for the selected session
      const messagesRef = collection(db, 'users', user.uid, 'sessions', selectedSession.id, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc')); // Order by timestamp
      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(doc => doc.data());

      if (messages.length === 0) {
        Alert.alert('Empty Session', 'This session has no messages to send.');
        setIsSending(false);
        return;
      }

      // 2. Create HTML for PDF
      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; font-size: 12px; color: #1F2937; }
              .header { 
                text-align: center; 
                border-bottom: 2px solid #1A3C6E; 
                padding-bottom: 10px; 
                margin-bottom: 20px; 
                font-size: 18px; 
                font-weight: bold;
                color: #1A3C6E;
              }
              .content { 
                border: 1px solid #E5E7EB; 
                padding: 15px; 
                border-radius: 8px; 
                min-height: 60vh;
              }
              .footer { 
                text-align: center; 
                border-top: 1px solid #E5E7EB; 
                padding-top: 10px; 
                margin-top: 20px; 
                font-size: 10px; 
                color: #6B7280;
              }
              h3 { font-size: 16px; margin-bottom: 5px; }
              .session-details { margin: 0; padding: 0; color: #6B7280; }
              .message { 
                margin: 0; 
                padding: 8px 0; 
                line-height: 1.5; 
                white-space: pre-wrap; 
                border-bottom: 1px dashed #F3F4F6;
              }
              .message:last-child {
                border-bottom: none;
              }
              b { 
                font-weight: bold; 
                color: #1F2937; /* Default dark color */
              }
            </style>
          </head>
          <body>
            <div class="header">
              WhoToAsk Legal - Session Transcript
            </div>

            <h3>Session: ${selectedSession.name}</h3>
            <p class="session-details"><i>(Session ID: ${selectedSession.id})</i></p>
            <br/>

            <div class="content">
              ${messages
                .map(
                  (m) =>
                    `<p class="message"><b>${m.sender === 'user' ? 'User' : 'AI'}:</b> ${m.text.replace(/\n/g, '<br />')}</p>`
                )
                .join('')}
            </div>

            <div class="footer">
              Confidential Document | Generated on ${new Date().toLocaleString()}
            </div>
          </body>
        </html>
      `;

      // 3. Generate PDF
      const { uri } = await Print.printToFileAsync({ html });
      const safeName = selectedSession.name.replace(/[^a-z0-9]/gi, '_');
      const fileUri = `${FileSystem.documentDirectory}session_${safeName}.pdf`;
      await FileSystem.moveAsync({ from: uri, to: fileUri });

      // 4. Send email
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Mail service not available on this device.');
        setIsSending(false);
        return;
      }

      await MailComposer.composeAsync({
        recipients: [recipientEmail],
        subject: `Legal Chat Session: ${selectedSession.name}`,
        body: `Attached is the chat transcript for the session "${selectedSession.name}".\n\nSent from the WhoToAsk app.`,
        attachments: [fileUri],
      });

      // 5. Success
      Alert.alert('Success', `The session is successfully shared to recipient.`);
      setShowSendDataModal(false);

    } catch (err) {
      console.error('Error sharing session:', err);
      Alert.alert('Error', 'Failed to generate or send session PDF.');
    } finally {
      setIsSending(false);
    }
  };
  
  const handleLegalTerms = () => {
    router.push('/legalTerms');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/auth');
    } catch (err) {
      Alert.alert('Logout failed', err.message || String(err));
    }
  };

  // ... (rest of your component's return JSX) ...
  // (No changes needed to the JSX, it's all here)

  // Show fallback if user not logged in
  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>You’re not logged in.</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.replace('/auth')}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Derive name from email if displayName is missing
  const profileName =
    user.displayName ||
    (user.email ? user.email.split('@')[0] : 'Anonymous User');
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

        {/* Account Options */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ACCOUNT OPTIONS</Text>
        </View>

        <View style={styles.section}>
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

      {/* --- MODIFIED: Send Session Modal --- */}
      <Modal
        visible={showSendDataModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSendDataModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {isSending ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#1A3C6E" />
                <Text style={styles.loaderText}>Generating PDF & Sending...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.modalTitle}>Send Session Data</Text>
                
                {/* --- NEW: Session Selector --- */}
                <Text style={styles.modalSubtitle}>
                  1. Select a session to send
                </Text>
                <View style={styles.sessionListContainer}>
                  {loadingSessions ? (
                    <ActivityIndicator color="#1A3C6E" />
                  ) : sessions.length === 0 ? (
                    <Text style={styles.noSessionsText}>No sessions found.</Text>
                  ) : (
                    <ScrollView>
                      {sessions.map((session) => (
                        <TouchableOpacity
                          key={session.id}
                          style={[
                            styles.sessionItem,
                            selectedSession?.id === session.id && styles.sessionItemSelected
                          ]}
                          onPress={() => setSelectedSession(session)}
                        >
                          <Text 
                            style={[
                              styles.sessionItemText,
                              selectedSession?.id === session.id && styles.sessionItemTextSelected
                            ]}
                          >
                            {session.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>

                {/* --- NEW: Step 2, only if session is selected --- */}
                {selectedSession && (
                  <>
                    <Text style={styles.modalSubtitle}>
                      2. Enter recipient's email
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
                  </>
                )}

                {/* Modal Buttons */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={() => setShowSendDataModal(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalButton, 
                      styles.modalSendButton,
                      (!selectedSession || !recipientEmail) && styles.modalButtonDisabled // Disable if no selection
                    ]}
                    onPress={handleSendEmail}
                    disabled={!selectedSession || !recipientEmail}
                  >
                    <Text style={styles.modalSendText}>Send</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- STYLES ---
// (Your styles are all correct, no changes needed here)
const styles = StyleSheet.create({
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
    paddingTop: 60,
    paddingBottom: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A3C6E',
  },
  loginButton: {
    backgroundColor: '#1A3C6E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
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
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1F2937',
  },
  menuItemIcon: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
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
    marginBottom: 12,
    marginTop: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
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
  modalButtonDisabled: {
    backgroundColor: '#9CA3AF', 
  },
  sessionListContainer: {
    height: 150, 
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 16,
  },
  sessionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sessionItemSelected: {
    backgroundColor: '#1A3C6E20', 
  },
  sessionItemText: {
    fontSize: 15,
    color: '#1F2937',
  },
  sessionItemTextSelected: {
    fontWeight: '600',
    color: '#1A3C6E',
  },
  noSessionsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#6B7280',
  },
  loaderContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 15,
    color: '#1A3C6E',
    fontWeight: '500',
  }
});