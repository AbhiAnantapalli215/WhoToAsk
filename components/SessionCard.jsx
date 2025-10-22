import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function SessionCard({ title, timestamp, type, onOpen, onShare, onDelete }) {
  const getIconByType = () => {
    switch (type) {
      case 'chat':
        return '💬';
      case 'document':
        return '📄';
      case 'photo':
        return '📷';
      default:
        return '💬';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'chat':
        return '#DBEAFE';
      case 'document':
        return '#FEF3C7';
      case 'photo':
        return '#D1FAE5';
      default:
        return '#F3F4F6';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: getBackgroundColor() }]}>
          <Text style={styles.icon}>{getIconByType()}</Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={onShare} style={styles.actionButton}>
            <Text style={styles.actionIcon}>🔗</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
            <Text style={styles.actionIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={onOpen} style={styles.openButton}>
        <Text style={styles.openButtonText}>Open</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 13,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 16,
  },
  openButton: {
    backgroundColor: '#1A3C6E',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  openButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
