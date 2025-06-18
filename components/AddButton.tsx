import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors, shadows } from '@/constants/colors';

interface AddButtonProps {
  onPress: () => void;
  color?: string;
  size?: number;
}

export default function AddButton({ onPress, color = colors.primary, size = 56 }: AddButtonProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.button,
        { 
          backgroundColor: color,
          width: size,
          height: size,
          borderRadius: size / 2,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Plus size={24} color={colors.white} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
    zIndex: 100,
  },
});