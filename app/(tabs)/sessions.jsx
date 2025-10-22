import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import SessionCard from '../../components/SessionCard';

const mockSessions = [
  {
    id: 1,
    title: 'Review of Employment Contract',
    timestamp: '10:45 AM • Chat Session',
    type: 'chat',
    category: 'Today'
  },
  {
    id: 2,
    title: 'Lease Agreement Analysis',
    timestamp: '09:12 AM • Document Processing',
    type: 'document',
    category: 'Today'
  },
  {
    id: 3,
    title: 'NDA Document Query',
    timestamp: '3:20 PM • Chat Session',
    type: 'chat',
    category: 'Yesterday'
  },
  {
    id: 4,
    title: 'Contract Terms Review',
    timestamp: '11:30 AM',
    type: 'document',
    category: 'Yesterday'
  },
  {
    id: 5,
    title: 'Property Dispute Consultation',
    timestamp: '2:15 PM • Chat Session',
    type: 'chat',
    category: 'This Week'
  },
  {
    id: 6,
    title: 'Tax Notice Guidance',
    timestamp: '4:30 PM • Document Processing',
    type: 'document',
    category: 'This Week'
  },
];

export default function SessionsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions, setSessions] = useState(mockSessions);

  const handleOpenSession = (sessionId) => {
    router.push('/chat');
  };

  const handleShareSession = (sessionId) => {
    Alert.alert('Share Session', 'Share functionality would allow you to send session data to your lawyer or accountant.');
  };

  const handleDeleteSession = (sessionId) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSessions(sessions.filter(s => s.id !== sessionId));
          }
        }
      ]
    );
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupSessionsByCategory = () => {
    const grouped = {};
    filteredSessions.forEach(session => {
      if (!grouped[session.category]) {
        grouped[session.category] = [];
      }
      grouped[session.category].push(session);
    });
    return grouped;
  };

  const groupedSessions = groupSessionsByCategory();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sessions History</Text>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search sessions..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.sessionsContainer} showsVerticalScrollIndicator={false}>
        {Object.keys(groupedSessions).map((category) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryIndicator} />
              <Text style={styles.categoryTitle}>{category}</Text>
            </View>

            {groupedSessions[category].map((session) => (
              <SessionCard
                key={session.id}
                title={session.title}
                timestamp={session.timestamp}
                type={session.type}
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
              {searchQuery ? 'Try a different search term' : 'Start a new conversation to create your first session'}
            </Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB',
  },
  header: {
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
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  sessionsContainer: {
    flex: 1,
    paddingTop: 8,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryIndicator: {
    width: 4,
    height: 20,
    backgroundColor: '#4BA3FF',
    borderRadius: 2,
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3C6E',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
});
