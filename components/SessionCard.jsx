import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function SessionCard({ 
  title, 
  timestamp, 
  type, // 'chat', 'photo', 'document'
  icon, // 'gavel', 'home', etc.
  color, // '#2ecc71', etc.
  onOpen, 
  onShare, 
  onDelete,
  isDeleting,
  isSharing 
}) {
  
  // Default values if icon/color are missing from older sessions
  const sessionIcon = icon || 'comment-dots';
  const sessionColor = color || '#4BA3FF';

  // Use 'type' to override the topic icon if it's a photo or doc
  const getIconName = () => {
    if (type === 'photo') return 'camera';
    if (type === 'document') return 'file-alt';
    return sessionIcon; // Use the topic icon by default
  };

  return (
    <View style={styles.card}>
      {/* Main pressable area (Icon + Text) */}
      <TouchableOpacity 
        style={styles.mainContent} 
        onPress={onOpen} 
        disabled={isDeleting || isSharing}
      >
        {/* Icon Container (like QuickCard) */}
        <View style={[styles.iconContainer, { backgroundColor: sessionColor + '20' }]}>
          <FontAwesome5 name={getIconName()} size={20} color={sessionColor} />
        </View>

        {/* Text Container */}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>
      </TouchableOpacity>

      {/* Actions (Share/Delete) on the right */}
      <View style={styles.actions}>
        {isSharing ? (
          <View style={styles.actionLoader}>
            <ActivityIndicator size="small" color="#516a90ff" />
          </View>
        ) : (
          <TouchableOpacity onPress={onShare} style={styles.actionButton} disabled={isDeleting}>
            <FontAwesome5 name="share-alt" size={18} color="#516a90ff" />
          </TouchableOpacity>
        )}
        
        {isDeleting ? (
          <View style={styles.actionLoader}>
            <ActivityIndicator size="small" color="#fb7f9aff" />
          </View>
        ) : (
          <TouchableOpacity onPress={onDelete} style={styles.actionButton} disabled={isSharing}>
            <FontAwesome5 name="trash" size={18} color="#fb7f9aff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// NEW STYLES for SessionCard to match QuickCard
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  mainContent: { // Wrapper for icon + text
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24, // Circle
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
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
  actions: { // Actions on the far right
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLoader: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  }
});