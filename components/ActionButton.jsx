import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

export default function ActionButton({ title, subtitle, icon, onPress, variant = 'primary' }) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          title: styles.secondaryTitle,
          subtitle: styles.secondarySubtitle,
        };
      case 'accent':
        return {
          container: styles.accentContainer,
          title: styles.accentTitle,
          subtitle: styles.accentSubtitle,
        };
      default:
        return {
          container: styles.primaryContainer,
          title: styles.primaryTitle,
          subtitle: styles.primarySubtitle,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.button, variantStyles.container]}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, variantStyles.title]}>{title}</Text>
          <Text style={[styles.subtitle, variantStyles.subtitle]}>{subtitle}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryContainer: {
    backgroundColor: '#1A3C6E',
  },
  secondaryContainer: {
    backgroundColor: '#1A3C6E',
  },
  accentContainer: {
    backgroundColor: '#4BA3FF',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  primaryTitle: {
    color: '#FFFFFF',
  },
  secondaryTitle: {
    color: '#FFFFFF',
  },
  accentTitle: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  primarySubtitle: {
    color: '#B8C5D6',
  },
  secondarySubtitle: {
    color: '#B8C5D6',
  },
  accentSubtitle: {
    color: '#E0F2FE',
  },
});
