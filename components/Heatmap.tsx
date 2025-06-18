import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { DailyProgress } from '@/types';
import { calculateIntensity } from '@/utils/date';

interface HeatmapProps {
  data: DailyProgress[];
  dates: string[];
  onDayPress?: (date: string) => void;
}

export default function Heatmap({ data, dates, onDayPress }: HeatmapProps) {
  // Get day names for the header
  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  // Get intensity color
  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return colors.gray200;
    
    const intensityColors = [
      colors.primaryLight,
      colors.primary,
      colors.primaryDark,
      '#3730A3', // Deeper indigo
    ];
    
    return intensityColors[intensity - 1];
  };
  
  // Find progress data for a specific date
  const getProgressForDate = (date: string) => {
    return data.find(item => item.date === date);
  };
  
  // Handle day press
  const handleDayPress = (date: string) => {
    if (onDayPress) {
      onDayPress(date);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {dayNames.map((day, index) => (
          <Text key={index} style={styles.dayName}>
            {day}
          </Text>
        ))}
      </View>
      
      <View style={styles.grid}>
        {dates.map((date) => {
          const progress = getProgressForDate(date);
          const intensity = calculateIntensity(progress);
          
          return (
            <TouchableOpacity
              key={date}
              style={[
                styles.day,
                { backgroundColor: getIntensityColor(intensity) }
              ]}
              onPress={() => handleDayPress(date)}
              activeOpacity={0.7}
            />
          );
        })}
      </View>
      
      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        {[0, 1, 2, 3, 4].map((intensity) => (
          <View
            key={intensity}
            style={[
              styles.legendItem,
              { backgroundColor: getIntensityColor(intensity) }
            ]}
          />
        ))}
        <Text style={styles.legendText}>More</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: colors.gray500,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: '13.5%',
    aspectRatio: 1,
    margin: '0.5%',
    borderRadius: 4,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  legendText: {
    fontSize: 12,
    color: colors.gray500,
    marginHorizontal: 8,
  },
});