import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useHistoryStore } from '@/store/historyStore';
import { useTaskStore } from '@/store/taskStore';
import { colors } from '@/constants/colors';
import Heatmap from '@/components/Heatmap';
import { DailyProgress } from '@/types';
import { formatTimeHuman } from '@/utils/date';

export default function HistoryScreen() {
  const { dailyProgress } = useHistoryStore();
  const { getTasksByDate } = useTaskStore();
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dates, setDates] = useState<string[]>([]);
  
  // Generate dates for the last 4 weeks (28 days)
  useEffect(() => {
    const generateDates = () => {
      const result: string[] = [];
      const today = new Date();
      
      for (let i = 27; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        result.push(date.toISOString().split('T')[0]);
      }
      
      return result;
    };
    
    setDates(generateDates());
  }, []);
  
  const handleDayPress = (date: string) => {
    setSelectedDate(date === selectedDate ? null : date);
  };
  
  const tasksForSelectedDate = selectedDate ? getTasksByDate(selectedDate) : [];
  
  // Calculate stats
  const totalTasksCompleted = dailyProgress.reduce(
    (sum, day) => sum + day.tasksCompleted,
    0
  );
  
  const totalTimeSpent = dailyProgress.reduce(
    (sum, day) => sum + day.timeSpent,
    0
  );
  
  const activeDays = dailyProgress.filter(
    (day) => day.tasksCompleted > 0
  ).length;
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity Overview</Text>
      </View>
      
      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalTasksCompleted}</Text>
          <Text style={styles.statLabel}>Tasks Completed</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatTimeHuman(totalTimeSpent)}</Text>
          <Text style={styles.statLabel}>Time Tracked</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{activeDays}</Text>
          <Text style={styles.statLabel}>Active Days</Text>
        </View>
      </View>
      
      {/* Heatmap */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Heatmap</Text>
        <Heatmap 
          data={dailyProgress}
          dates={dates}
          onDayPress={handleDayPress}
        />
      </View>
      
      {/* Selected Day Details */}
      {selectedDate && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          
          {tasksForSelectedDate.length > 0 ? (
            <View style={styles.taskList}>
              {tasksForSelectedDate.map((task) => (
                <View key={task.id} style={styles.taskItem}>
                  <View 
                    style={[
                      styles.taskStatus, 
                      { backgroundColor: task.status === 'completed' ? colors.success : colors.gray400 }
                    ]} 
                  />
                  <View style={styles.taskContent}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    {task.timeSpent > 0 && (
                      <Text style={styles.taskTime}>
                        {formatTimeHuman(task.timeSpent)}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No tasks for this day</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    padding: 16,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray800,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray900,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray600,
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: colors.gray200,
  },
  section: {
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: 16,
  },
  taskList: {
    marginTop: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  taskStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: colors.gray800,
  },
  taskTime: {
    fontSize: 12,
    color: colors.gray600,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray600,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
  },
});