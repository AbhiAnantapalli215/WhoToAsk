import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ChatBubble({ message, isUser, timestamp }) {
  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      {!isUser && (
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarIcon}>⚖️</Text>
          </View>
        </View>
      )}

      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {!isUser && <Text style={styles.label}>AI Assistant</Text>}
        {isUser && <Text style={styles.userLabel}>You</Text>}
        <Text style={[styles.message, isUser ? styles.userMessage : styles.aiMessage]}>
          {message}
        </Text>
        {timestamp && (
          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
            {timestamp}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    marginTop: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4BA3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    fontSize: 20,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#1A3C6E',
    marginLeft: 'auto',
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  userLabel: {
    fontSize: 12,
    color: '#E0E7FF',
    marginBottom: 4,
    fontWeight: '500',
    textAlign: 'right',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessage: {
    color: '#FFFFFF',
  },
  aiMessage: {
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
  },
  userTimestamp: {
    color: '#B8C5D6',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: '#9CA3AF',
  },
});
