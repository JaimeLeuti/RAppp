import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface AddButtonProps {
  onPress: () => void;
  label?: string;
}

export default function AddButton({ onPress, label }: AddButtonProps) {
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };
  
  return (
    <TouchableOpacity 
      style={styles.button}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Plus size={24} color={colors.white} />
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 100,
  },
  label: {
    color: colors.white,
    fontSize: 12,
    marginTop: 4,
  },
});