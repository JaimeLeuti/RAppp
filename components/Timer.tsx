import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Pause, Play, X, Square } from 'lucide-react-native';
import { colors, shadows } from '@/constants/colors';
import { useTimerStore } from '@/store/timerStore';
import { useTaskStore } from '@/store/taskStore';
import { formatTime } from '@/utils/date';

export default function Timer() {
  const { 
    isRunning, 
    taskId, 
    elapsedTime, 
    startTimer, 
    stopTimer, 
    pauseTimer, 
    resumeTimer, 
    resetTimer, 
    updateElapsedTime 
  } = useTimerStore();
  
  const { getTaskById, addTimeToTask } = useTaskStore();
  
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
  }, [isRunning, elapsedTime, updateElapsedTime]);
  
  const handlePlayPause = () => {
    if (isRunning) {
      pauseTimer();
    } else if (taskId) {
      resumeTimer();
    }
  };
  
  const handleStop = () => {
    // Save elapsed time to task
    if (taskId && elapsedTime > 0) {
      addTimeToTask(taskId, elapsedTime);
    }
    
    stopTimer();
  };
  
  const handleClose = () => {
    // Save elapsed time to task
    if (taskId && elapsedTime > 0) {
      addTimeToTask(taskId, elapsedTime);
    }
    
    resetTimer();
  };
  
  if (!taskId || !task) return null;
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.taskName} numberOfLines={1}>
          {task.title}
        </Text>
        
        <Text style={styles.timer}>
          {formatTime(displayTime)}
        </Text>
        
        <Text style={styles.status}>
          {isRunning ? 'Focus time' : 'Paused'}
        </Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.playPauseButton} 
          onPress={handlePlayPause}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isRunning ? (
            <Pause size={24} color={colors.white} />
          ) : (
            <Play size={24} color={colors.white} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.stopButton} 
          onPress={handleStop}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Square size={20} color={colors.white} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={handleClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.large,
    zIndex: 100,
  },
  content: {
    flex: 1,
    marginRight: 16,
  },
  taskName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray700,
    marginBottom: 4,
  },
  timer: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 2,
  },
  status: {
    fontSize: 12,
    color: colors.gray500,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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