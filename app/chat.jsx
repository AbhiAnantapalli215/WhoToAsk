import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ChatBubble from '../components/ChatBubble';

const mockAIResponses = [
  "I can help with that. To give you the most accurate information, could you please tell me which state you live in and what your current lease agreement says about rent increases?",
  "Based on what you've told me, here's what I understand: In most states, landlords must provide 30-60 days written notice before increasing rent. The specific amount they can increase depends on local rent control laws. Would you like me to look up the specific laws for your state?",
  "That's a great question. For property issues like this, I recommend consulting with a real estate attorney who specializes in your local jurisdiction. Would you like me to help you prepare a list of questions to ask them?",
  "I understand your concern. Let me break this down for you: First, review the notice carefully for any errors. Second, check if the increase complies with your lease terms. Third, verify it meets state law requirements. Would you like more details on any of these steps?",
  "For tax notices, it's important to respond promptly. Typically, you have 30 days to respond. I can help you understand what information you'll need to gather. What type of tax notice did you receive?",
  "Yes, I can help you draft that document. To get started, I'll need some basic information. What type of contract are you looking to create?",
];

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef();

  const [messages, setMessages] = useState([
    {
      id: 1,
      message: "Hello! How can I assist you with your legal questions today? Please provide as much detail as possible.",
      isUser: false,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (params.initialMessage) {
      setTimeout(() => {
        handleSend(params.initialMessage);
      }, 500);
    }
  }, [params.initialMessage]);

  const getAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('rent') || lowerMessage.includes('landlord') || lowerMessage.includes('lease')) {
      return mockAIResponses[0];
    } else if (lowerMessage.includes('property') || lowerMessage.includes('real estate')) {
      return mockAIResponses[2];
    } else if (lowerMessage.includes('tax') || lowerMessage.includes('notice')) {
      return mockAIResponses[4];
    } else if (lowerMessage.includes('contract') || lowerMessage.includes('draft')) {
      return mockAIResponses[5];
    } else if (lowerMessage.includes('state') || lowerMessage.includes('law')) {
      return mockAIResponses[1];
    } else {
      return mockAIResponses[3];
    }
  };

  const handleSend = (messageText = null) => {
    const textToSend = messageText || inputText.trim();

    if (textToSend === '') return;

    const userMessage = {
      id: messages.length + 1,
      message: textToSend,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    setTimeout(() => {
      const aiMessage = {
        id: messages.length + 2,
        message: getAIResponse(textToSend),
        isUser: false,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
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
      >
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg.message}
            isUser={msg.isUser}
            timestamp={msg.timestamp}
          />
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Text style={styles.attachIcon}>📎</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#9CA3AF"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
        />

        <TouchableOpacity
          style={[styles.sendButton, inputText.trim() === '' && styles.sendButtonDisabled]}
          onPress={() => handleSend()}
          disabled={inputText.trim() === ''}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  attachIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1F2937',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A3C6E',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  sendIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
});
