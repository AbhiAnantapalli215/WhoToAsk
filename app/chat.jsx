import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, 
  TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { auth, db } from '../firebaseConfig.js';
import { 
  collection, addDoc, onSnapshot, serverTimestamp, 
  orderBy, query, doc 
} from 'firebase/firestore';
import ChatBubble from '../components/ChatBubble';

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef();
  
  // --- STATE ---
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState(params.sessionId); // Will hold the ID
  const user = auth.currentUser;

  // --- REUSABLE AI RESPONSE LOGIC ---
  const getAIResponse = (text) => {
    const lower = text.toLowerCase();
    // --- Quick Card Responses (Indian Context) ---
    if (lower.includes('fine')) return 'I understand you have a query about a fine. In India, this could be a traffic e-challan, a municipal fine, or another penalty.\n\nFirst, check the notice to see which authority issued it (e.g., Traffic Police, Municipal Corporation). Most fines, like traffic challans, can be paid online through the official e-challan website or your state\'s specific portal.\n\nIf you wish to contest it, the notice will specify the procedure, timeline, and the authority to appeal to (like a specific court).\n\nCould you provide more details about the fine so I can assist you better?';
    if (lower.includes('court notice')) return 'Receiving a court notice or summons is a serious matter. Please do not ignore it, as it could lead to an "ex-parte" order against you.\n\nFirst, carefully read the notice to identify the court\'s name, the case number, and the date of hearing. You must appear in court on that date, either in person or through a lawyer.\n\nI strongly recommend consulting a lawyer immediately. They can interpret the notice, advise on the next steps, and draft a formal reply (a "vakalatnama" and "written statement").';  
    if (lower.includes('property law')) return 'Property law in India is a very broad and complex subject, governed by both central and state laws. It covers everything from buying/selling (governed by RERA and the Transfer of Property Act) to inheritance (like the Hindu Succession Act) and landlord-tenant disputes.\n\nTitle verification, checking for encumbrances, and correct registration/stamp duty are critical steps in any transaction.\n\nTo help you, could you please specify what your query is about? Are you buying, selling, inheriting, or in a property dispute?';
    if (lower.includes('tax notice')) return 'Receiving a notice from the Income Tax Department can be concerning. First, don\'t panic. Log in to your e-filing portal and check the "e-Proceedings" or "Communications" tab to verify the notice is genuine.\n\nCheck the section mentioned (e.g., Sec 143(1) is an intimation, 139(9) is for a defective return, 148 is for income escaping assessment). Each section requires a different response.\n\nIt is crucial to respond by the due date mentioned, usually by submitting a reply on the portal itself. I can help explain what the section means.';
    if (lower.includes('intellectual property') || lower.includes('ip law')) return 'Intellectual Property (IP) Law in India protects creations of the mind. This primarily includes:\n\n1.  **Trademarks:** To protect your brand name, logo, or slogan.\n2.  **Copyrights:** To protect original literary, artistic, musical, or software code.\n3.  **Patents:** To protect a new and useful invention or process.\n4.  **Designs:** To protect the unique visual design of a product.\n\nDo you have a question about registering one of these, or do you believe your IP has been infringed?';

    // --- Original Function Logic ---
    if (lower.includes('rent')) return 'Landlords usually must give written notice before rent increases. In India, this is governed by your state\'s Rent Control Act and the terms of your rental agreement. Many states require a notice period of 1-3 months. Want me to check the specific laws for your state?';
    if (lower.includes('contract')) return 'Sure, I can help draft a contract. In India, for a contract to be valid, it must comply with the Indian Contract Act, 1872. This means having a lawful object, valid consideration, and free consent. What kind of agreement is it (e.g., rental, employment, services)?';
    if (lower.includes('tax')) return 'Tax questions can be complex, covering everything from GST to Income Tax returns and deductions. Respond to any official notices quickly—typically within 30 days. Could you be more specific about your tax query so I can help you draft a reply or understand your compliance needs?';
    if (lower.includes('photo')) return 'Thank you for the photo. Let me analyze it for you... I can help identify text, forms, or documents. Please give me a moment to process the image and provide a relevant legal context or next step.';
    if (lower.includes('file')) return 'Thanks for uploading the file. I am reviewing its contents now. This might take a moment, especially if it\'s a legal document. I will summarize it and highlight key clauses, dates, or potential issues for you shortly.';
    
    // --- Default Fallback Response ---
    return 'This is an automated response. The server took longer than expected please try after sometime. Thank you for your patience!';
};

  const triggerAIResponse = async (text, sessionId) => {
    // Small delay to feel more natural
    setTimeout(async () => {
      const aiResponse = getAIResponse(text);
      await addDoc(collection(db, 'users', user.uid, 'sessions', sessionId, 'messages'), {
        text: aiResponse,
        sender: 'ai',
        timestamp: serverTimestamp(),
      });
    }, 1000);
  };

  // --- EFFECT 1: SESSION INITIALIZER ---
  // Runs ONCE to check if we are loading an old chat or creating a new one.
  useEffect(() => {
    if (!user) {
      router.replace('/login'); // Not logged in, boot to login
      return;
    }

    const initializeChat = async () => {
      if (params.sessionId) {
        // --- CASE 1: EXISTING CHAT ---
        // sessionId is already set, just set loading to true.
        // The message listener (Effect 2) will take over.
        setCurrentSessionId(params.sessionId);
        setLoading(true);
      } else {
        // --- CASE 2: NEW CHAT ---
        // 1. Create a new session document
        const sessionName = params.initialMessage 
                          ? params.initialMessage.substring(0, 30) + '...' 
                          : 'New Session';
        let sessionType = 'chat';
        if (params.imageUri) sessionType = 'photo';
        if (params.documentName) sessionType = 'document';

        // Get icon and color from params, with defaults
        const sessionIcon = params.sessionIcon || 'comment-dots'; // <-- NEW
        const sessionColor = params.sessionColor || '#4BA3FF'; // <-- NEW
        
        const newSessionRef = await addDoc(collection(db, 'users', user.uid, 'sessions'), {
          name: sessionName,
          createdAt: serverTimestamp(),
          type: sessionType, 
          icon: sessionIcon,   // <-- NEW: Save icon to Firestore
          color: sessionColor  // <-- NEW: Save color to Firestore
        });
        
        const newId = newSessionRef.id;
        setCurrentSessionId(newId); // Set the new ID

        // 2. Check for an initial message/file/image from params
        if (params.initialMessage) {
          let initialText = params.initialMessage;
          // Add context for images or files
          if (params.imageUri) initialText = `[Image Attached]\n\n${initialText}`;
          if (params.documentName) initialText = `[File Attached: ${params.documentName}]\n\n${initialText}`;

          // 3. Send the initial message
          const userMessage = {
            text: initialText,
            sender: 'user',
            timestamp: serverTimestamp(),
          };
          await addDoc(collection(db, 'users', user.uid, 'sessions', newId, 'messages'), userMessage);
          
          // 4. Trigger the AI's first response
          await triggerAIResponse(initialText, newId);
        }
        
        // New chat is ready, stop loading.
        // The message listener (Effect 2) will now pick up any messages.
        setLoading(false);
      }
    };

    initializeChat();
  }, [user]); // Only run when user is available

  // --- EFFECT 2: MESSAGE LISTENER ---
  // Subscribes to messages *only* when we have a valid currentSessionId
  useEffect(() => {
    if (!user || !currentSessionId) {
      // If this is a new chat, this will be null until Effect 1 finishes.
      // We set loading(false) in Effect 1 for new chats.
      return;
    }

    // Set loading to true when we start listening (for existing chats)
    setLoading(true);
    const messagesRef = collection(db, 'users', user.uid, 'sessions', currentSessionId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(data);
      setLoading(false); // Stop loading once messages are fetched
    }, (error) => {
      console.error("Error fetching messages: ", error);
      setLoading(false);
      Alert.alert("Error", "Could not load messages.");
    });

    return () => unsubscribe(); // Clean up listener
  }, [user, currentSessionId]); // Re-run if user or session ID changes

  // --- HANDLER: Send a new message ---
  const handleSend = async () => {
    const textToSend = inputText.trim();
    // Guard against sending empty messages or if chat isn't ready
    if (!textToSend || !user || !currentSessionId) return;

    setInputText(''); // Clear input immediately

    const userMessage = {
      text: textToSend,
      sender: 'user',
      timestamp: serverTimestamp(),
    };

    // Add user message to Firestore
    await addDoc(collection(db, 'users', user.uid, 'sessions', currentSessionId, 'messages'), userMessage);
    
    // Trigger the AI response
    await triggerAIResponse(textToSend, currentSessionId);
  };

  // --- RENDER ---
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A3C6E" />
        <Text>Loading chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Adjust as needed
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legal Advice Session</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg.text}
            isUser={msg.sender === 'user'}
            timestamp={
              msg.timestamp?.toDate
                ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'sending...'
            }
          />
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        {/* I've removed the attach button for now, as its logic wasn't implemented */}
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#9CA3AF"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingBottom: 16, paddingHorizontal: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 24, color: '#1A3C6E' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A3C6E' },
  placeholder: { width: 40 },
  messagesContainer: { flex: 1 },
  messagesContent: { paddingVertical: 16 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1, 
    maxHeight: 120, // Allow more lines
    minHeight: 44, // Match send button height
    backgroundColor: '#F3F4F6',
    borderRadius: 22, // Make it a pill
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 10, // Adjust for multiline
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 15, 
    color: '#1F2937',
  },
  sendButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1A3C6E', justifyContent: 'center', alignItems: 'center', marginLeft: 8,
  },
  sendButtonDisabled: { backgroundColor: '#9CA3AF' },
  sendIcon: { fontSize: 20, color: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F9FB' },
});