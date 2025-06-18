import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, Clock, MoreVertical, Play, Square } from 'lucide-react-native';
import { Task } from '@/types';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import { useTimerStore } from '@/store/timerStore';
import { formatTimeHuman } from '@/utils/date';
import * as Haptics from 'expo-haptics';

interface TaskItemProps {
  task: Task;
  index: number;
  showWarning?: boolean;
}

export default function TaskItem({ task, index, showWarning = false }: TaskItemProps) {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  
  const { updateTaskStatus, moveTaskToTomorrow } = useTaskStore();
  const { isRunning, taskId, startTimer, stopTimer } = useTimerStore();
  
  const isActive = isRunning && taskId === task.id;
  
  const handleStatusToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (task.status === 'completed') {
      updateTaskStatus(task.id, 'pending');
    } else {
      updateTaskStatus(task.id, 'completed');
      
      // If timer is running for this task, stop it
      if (isActive) {
        stopTimer();
      }
    }
  };
  
  const handleTimerToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isActive) {
      stopTimer();
    } else {
      // If timer is running for another task, confirm switch
      if (isRunning && taskId !== task.id) {
        Alert.alert(
          "Switch Timer",
          "Timer is already running for another task. Switch to this task?",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Switch", 
              onPress: () => {
                stopTimer();
                startTimer(task.id);
              }
            }
          ]
        );
      } else {
        startTimer(task.id);
      }
    }
  };
  
  const handleTaskPress = () => {
    router.push(`/task/${task.id}`);
  };
  
  const handleMoveToTomorrow = () => {
    moveTaskToTomorrow(task.id);
    setMenuVisible(false);
  };
  
  // Determine color based on priority and index
  const getColor = () => {
    if (showWarning) {
      return colors.muted;
    }
    return colors.priority[task.priority - 1];
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderLeftColor: getColor() },
        task.status === 'completed' && styles.completed
      ]}
      onPress={handleTaskPress}
      activeOpacity={0.7}
    >
      <TouchableOpacity 
        style={styles.checkbox} 
        onPress={handleStatusToggle}
      >
        {task.status === 'completed' ? (
          <Check size={18} color={colors.success} />
        ) : (
          <Square size={18} color={colors.gray400} />
        )}
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text 
          style={[
            styles.title,
            task.status === 'completed' && styles.completedText
          ]}
          numberOfLines={1}
        >
          {task.title}
        </Text>
        
        {task.timeSpent > 0 && (
          <Text style={styles.timeSpent}>
            <Clock size={12} color={colors.gray500} />
            {' '}
            {formatTimeHuman(task.timeSpent)}
          </Text>
        )}
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.timerButton, isActive && styles.timerActive]} 
          onPress={handleTimerToggle}
        >
          {isActive ? (
            <Square size={16} color={colors.white} />
          ) : (
            <Play size={16} color={colors.primary} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setMenuVisible(!menuVisible)}
        >
          <MoreVertical size={18} color={colors.gray500} />
        </TouchableOpacity>
      </View>
      
      {menuVisible && (
        <View style={styles.menu}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleMoveToTomorrow}
          >
            <Text style={styles.menuText}>Move to tomorrow</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {showWarning && (
        <View style={styles.warningBadge}>
          <Text style={styles.warningText}>6+</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: colors.gray400,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  completed: {
    opacity: 0.7,
    backgroundColor: colors.gray50,
  },
  checkbox: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray800,
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.gray500,
  },
  timeSpent: {
    fontSize: 12,
    color: colors.gray500,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  timerActive: {
    backgroundColor: colors.primary,
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    position: 'absolute',
    right: 16,
    top: 60,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  menuText: {
    fontSize: 14,
    color: colors.gray800,
  },
  warningBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.warning,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});