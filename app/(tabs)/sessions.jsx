import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, 
  Alert, ActivityIndicator, Modal, TouchableOpacity 
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  collection, onSnapshot, deleteDoc, doc, query, 
  orderBy, getDocs, writeBatch // Import writeBatch
} from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig.js';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import * as MailComposer from 'expo-mail-composer';
import { FontAwesome5 } from '@expo/vector-icons';
import SessionCard from '../../components/SessionCard';

export default function SessionsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  
  // --- NEW: Loading state for individual cards ---
  const [deletingId, setDeletingId] = useState(null);
  const [sharingId, setSharingId] = useState(null);

  const user = auth.currentUser;

  // Guard if user is not logged in
  if (!user) {
    return <Text style={styles.errorText}>Please log in to view your sessions.</Text>;
  }

  // Fetch sessions in real time
  useEffect(() => {
    if (!user) return;
    const sessionsRef = collection(db, 'users', user.uid, 'sessions');
    const q = query(sessionsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSessions(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching sessions: ", error);
      setLoading(false);
      Alert.alert("Error", "Could not load sessions.");
    });

    return () => unsubscribe();
  }, [user]);

  // --- Handlers ---
  const handleOpenSession = (sessionId) => {
    router.push({ pathname: '/chat', params: { sessionId } });
  };

  // --- MODIFIED: Robust delete function ---
  const handleDeleteSession = (sessionId) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to permanently delete this session and all its messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(sessionId); // Show loader on card
            try {
              // 1. Get a reference to the session document
              const sessionDocRef = doc(db, 'users', user.uid, 'sessions', sessionId);
              
              // 2. Get all messages in the subcollection
              const messagesRef = collection(sessionDocRef, 'messages');
              const messagesSnapshot = await getDocs(messagesRef);

              // 3. Delete all messages in a batch
              if (!messagesSnapshot.empty) {
                const batch = writeBatch(db);
                messagesSnapshot.docs.forEach((msgDoc) => {
                  batch.delete(msgDoc.ref);
                });
                await batch.commit();
              }

              // 4. Delete the parent session document
              await deleteDoc(sessionDocRef);
              
              // Alert.alert('Deleted', 'Session deleted successfully.');
              // No alert needed, onSnapshot will update the UI
            } catch (err) {
              console.error('Error deleting session:', err);
              Alert.alert('Error', 'Failed to delete session.');
            } finally {
              setDeletingId(null); // Hide loader
            }
          },
        },
      ]
    );
  };
  // --- END MODIFICATION ---

  const handleShareSession = (sessionId) => {
    setSelectedSession(sessionId);
    setEmailInput('');
    setEmailModalVisible(true);
  };

  // --- MODIFIED: Robust share function ---
  // --- MODIFIED: Robust share function with correct fields and PDF styling ---
  const sendEmailWithPDF = async () => {
    if (!emailInput || !selectedSession) {
      Alert.alert('Error', 'Please enter a valid email.');
      return;
    }

    setSharingId(selectedSession); // Show loader on card
    setEmailModalVisible(false); // Close modal

    try {
      // 1. Fetch messages for that session, IN ORDER
      const messagesRef = collection(db, 'users', user.uid, 'sessions', selectedSession, 'messages');
      
      // --- FIXED: Order by 'timestamp' ---
      const q = query(messagesRef, orderBy('timestamp', 'asc')); 
      const snapshot = await getDocs(q);

      // 2. Check if session is empty
      if (snapshot.empty) {
        Alert.alert('Empty Session', 'This session has no messages to share.');
        setSharingId(null);
        return;
      }

      const messages = snapshot.docs.map(doc => doc.data());

      // 3. Create HTML for PDF
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

            <h3>Session Details</h3>
            <p class="session-details"><i>(Session ID: ${selectedSession})</i></p>
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

      // 4. Generate PDF
      const { uri } = await Print.printToFileAsync({ html });
      const safeId = selectedSession.replace(/[^\w-]/g, '_');
      const fileUri = `${FileSystem.documentDirectory}session_${safeId}.pdf`;
      await FileSystem.moveAsync({ from: uri, to: fileUri });

      // 5. Send email
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Mail service not available on this device.');
        setSharingId(null); 
        return;
      }

      await MailComposer.composeAsync({
        recipients: [emailInput],
        subject: 'Your Session Transcript - WhoToAsk Legal',
        body: 'Attached is your session transcript.',
        attachments: [fileUri],
      });

      Alert.alert(
        'Success', 
        'Session shared to the recipient successfully.'
      );

    } catch (err) {
      console.error('Error sharing session:', err);
      Alert.alert('Error', 'Failed to share session.');
    } finally {
      setSharingId(null); 
      setSelectedSession(null);
    }
  };
  // --- END MODIFICATION ---

  // --- Filtering and grouping ---
  const filteredSessions = sessions.filter((session) =>
    session.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedSessions = useMemo(() => {
    const grouped = {};
    filteredSessions.forEach((session) => {
      const date =
        session.createdAt?.toDate?.()?.toDateString?.() || 'Unknown';
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(session);
    });
    return grouped;
  }, [filteredSessions]);

  // --- UI ---
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A3C6E" />
        <Text>Loading sessions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sessions History</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchIcon}>
          <FontAwesome5 name="search" size={18} color="#080808ff" />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search sessions..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Sessions list */}
      <ScrollView style={styles.sessionsContainer} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {Object.keys(groupedSessions).map((category) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryIndicator} />
              <Text style={styles.categoryTitle}>{category}</Text>
            </View>

            {groupedSessions[category].map((session) => (
              <SessionCard
                key={session.id}
                title={session.name || 'Untitled Session'}
                timestamp={
                  session.createdAt?.toDate?.()?.toLocaleTimeString?.() || ''
                }
                type={session.type}
                icon={session.icon}     // <-- NEW
                color={session.color}   // <-- NEW
                // --- MODIFIED: Pass loading states to card ---
                isDeleting={deletingId === session.id}
                isSharing={sharingId === session.id}
                // ---
                onOpen={() => handleOpenSession(session.id)}
                onShare={() => handleShareSession(session.id)}
                onDelete={() => handleDeleteSession(session.id)}
              />
            ))}
          </View>
        ))}

        {filteredSessions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No sessions found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try a different search term'
                : 'Start a new chat to create your first session'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Email Input Modal */}
      <Modal
        visible={emailModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEmailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Share Session</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter recipient email"
              placeholderTextColor="#9CA3AF"
              value={emailInput}
              onChangeText={setEmailInput}
              keyboardType="email-address"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEmailModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={sendEmailWithPDF}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>
                  Send
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#1A3C6E', textAlign: 'center' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', margin: 16, paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#1F2937' },
  sessionsContainer: { flex: 1, paddingTop: 8},
  categorySection: { marginBottom: 24 },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  categoryIndicator: { width: 4, height: 20, backgroundColor: '#4BA3FF', borderRadius: 2, marginRight: 12 },
  categoryTitle: { fontSize: 18, fontWeight: '700', color: '#1A3C6E' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { textAlign: 'center', marginTop: 100, fontSize: 16, color: 'red' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '85%', backgroundColor: 'white', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#1A3C6E' },
  modalInput: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    padding: 10, fontSize: 15, marginBottom: 16, color: '#1F2937',
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginLeft: 8 },
  cancelButton: { backgroundColor: '#E5E7EB' },
  sendButton: { backgroundColor: '#1A3C6E' },
  modalButtonText: { fontWeight: '600' },
});