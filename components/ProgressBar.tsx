import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  height?: number;
  showPercentage?: boolean;
}

export default function ProgressBar({
  progress,
  color = colors.primary,
  height = 8,
  showPercentage = true,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(progress, 0), 1) * 100;
  
  return (
    <View style={styles.container}>
      <View 
        style={[
          styles.track, 
          { height }
        ]}
      >
        <View 
          style={[
            styles.progress, 
            { 
              width: `${percentage}%`,
              backgroundColor: color,
              height
            }
          ]} 
        />
      </View>
      
      {showPercentage && (
        <Text style={styles.percentage}>
          {Math.round(percentage)}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    backgroundColor: colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    color: colors.gray600,
    marginTop: 4,
    textAlign: 'right',
  },
});