import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Pause, Play, X } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTimerStore } from '@/store/timerStore';
import { useTaskStore } from '@/store/taskStore';
import { formatTime } from '@/utils/date';
import * as Haptics from 'expo-haptics';

export default function Timer() {
  const { isRunning, taskId, elapsedTime, startTimer, stopTimer, resetTimer, updateElapsedTime } = useTimerStore();
  const { getTaskById, updateTaskTime } = useTaskStore();
  
  const [displayTime, setDisplayTime] = useState(elapsedTime);
  const task = taskId ? getTaskById(taskId) : null;
  
  // Update timer display
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        updateElapsedTime();
        setDisplayTime(elapsedTime);
      }, 1000);
    } else {
      setDisplayTime(elapsedTime);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, elapsedTime]);
  
  const handlePlayPause = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (isRunning) {
      stopTimer();
    } else if (taskId) {
      startTimer(taskId);
    }
  };
  
  const handleClose = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (isRunning) {
      stopTimer();
    }
    
    // Save elapsed time to task
    if (taskId && elapsedTime > 0) {
      const currentTask = getTaskById(taskId);
      if (currentTask) {
        updateTaskTime(taskId, currentTask.timeSpent + elapsedTime);
      }
    }
    
    resetTimer();
  };
  
  if (!taskId) return null;
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.taskName} numberOfLines={1}>
          {task?.title || 'Task'}
        </Text>
        
        <Text style={styles.timer}>
          {formatTime(displayTime)}
        </Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.playPauseButton} 
          onPress={handlePlayPause}
        >
          {isRunning ? (
            <Pause size={20} color={colors.white} />
          ) : (
            <Play size={20} color={colors.white} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={handleClose}
        >
          <X size={20} color={colors.gray600} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 100,
  },
  content: {
    flex: 1,
  },
  taskName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray700,
    marginBottom: 4,
  },
  timer: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray900,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});