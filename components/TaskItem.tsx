import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, Clock, Play, Square, MoreHorizontal, Timer } from 'lucide-react-native';
import { Task } from '@/types';
import { colors, shadows } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import { useTimerStore } from '@/store/timerStore';
import { formatTimeHuman } from '@/utils/date';

interface TaskItemProps {
  task: Task;
  showWarning?: boolean;
  onPress?: () => void;
}

export default function TaskItem({ task, showWarning = false, onPress }: TaskItemProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  
  const { updateTaskStatus, moveTaskToDate, deleteTask } = useTaskStore();
  const { isRunning, taskId, startTimer, stopTimer } = useTimerStore();
  
  const isActive = isRunning && taskId === task.id;
  
  const handleStatusToggle = () => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTaskStatus(task.id, newStatus);
    
    // Stop timer if task is completed
    if (newStatus === 'completed' && isActive) {
      stopTimer();
    }
  };
  
  const handleTimerToggle = () => {
    if (isActive) {
      stopTimer();
    } else {
      startTimer(task.id);
    }
  };
  
  const handleTaskPress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/task/${task.id}`);
    }
  };
  
  const getPriorityColor = () => {
    return colors.priority[task.priority];
  };
  
  const getPriorityLabel = () => {
    const labels = ['', 'Critical', 'High', 'Medium', 'Low', 'Minimal'];
    return labels[task.priority];
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderLeftColor: getPriorityColor() },
        task.status === 'completed' && styles.completed,
        showWarning && styles.warning,
      ]}
      onPress={handleTaskPress}
      activeOpacity={0.7}
    >
      {/* Priority indicator */}
      <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor() }]} />
      
      {/* Checkbox */}
      <TouchableOpacity 
        style={styles.checkbox} 
        onPress={handleStatusToggle}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {task.status === 'completed' ? (
          <View style={[styles.checkboxChecked, { backgroundColor: colors.success }]}>
            <Check size={16} color={colors.white} />
          </View>
        ) : (
          <View style={[styles.checkboxUnchecked, { borderColor: getPriorityColor() }]} />
        )}
      </TouchableOpacity>
      
      {/* Content */}
      <View style={styles.content}>
        <Text 
          style={[
            styles.title,
            task.status === 'completed' && styles.completedText
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        
        {task.description && (
          <Text 
            style={[
              styles.description,
              task.status === 'completed' && styles.completedText
            ]}
            numberOfLines={1}
          >
            {task.description}
          </Text>
        )}
        
        <View style={styles.metadata}>
          {task.timeSpent > 0 && (
            <View style={styles.timeContainer}>
              <Clock size={12} color={colors.gray500} />
              <Text style={styles.timeText}>
                {formatTimeHuman(task.timeSpent)}
              </Text>
            </View>
          )}
          
          {task.estimatedTime && task.estimatedTime > 0 && (
            <View style={styles.timeContainer}>
              <Timer size={12} color={colors.gray500} />
              <Text style={styles.timeText}>
                ~{formatTimeHuman(task.estimatedTime)}
              </Text>
            </View>
          )}
          
          <Text style={styles.priorityText}>
            {getPriorityLabel()}
          </Text>
        </View>
        
        {task.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {task.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {task.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{task.tags.length - 3}</Text>
            )}
          </View>
        )}
      </View>
      
      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[
            styles.timerButton, 
            isActive && styles.timerActive,
            task.status === 'completed' && styles.disabled
          ]} 
          onPress={handleTimerToggle}
          disabled={task.status === 'completed'}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isActive ? (
            <Square size={16} color={colors.white} />
          ) : (
            <Play size={16} color={task.status === 'completed' ? colors.gray400 : colors.primary} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setShowMenu(!showMenu)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MoreHorizontal size={18} color={colors.gray500} />
        </TouchableOpacity>
      </View>
      
      {/* Warning badge for 6+ tasks */}
      {showWarning && (
        <View style={styles.warningBadge}>
          <Text style={styles.warningText}>6+</Text>
        </View>
      )}
      
      {/* Menu */}
      {showMenu && (
        <View style={styles.menu}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              moveTaskToDate(task.id, new Date(Date.now() + 86400000).toISOString().split('T')[0]);
              setShowMenu(false);
            }}
          >
            <Text style={styles.menuText}>Move to tomorrow</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              deleteTask(task.id);
              setShowMenu(false);
            }}
          >
            <Text style={[styles.menuText, { color: colors.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    position: 'relative',
    ...shadows.medium,
  },
  completed: {
    opacity: 0.7,
    backgroundColor: colors.gray50,
  },
  warning: {
    borderColor: colors.warning,
    borderWidth: 1,
  },
  priorityIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxUnchecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 4,
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: 8,
    lineHeight: 20,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.gray500,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: colors.gray500,
    marginLeft: 4,
  },
  priorityText: {
    fontSize: 12,
    color: colors.gray500,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.gray100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    color: colors.gray600,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 11,
    color: colors.gray500,
    fontStyle: 'italic',
  },
  actions: {
    alignItems: 'center',
  },
  timerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  timerActive: {
    backgroundColor: colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    position: 'absolute',
    right: 16,
    top: 70,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 8,
    minWidth: 150,
    ...shadows.large,
    zIndex: 10,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuText: {
    fontSize: 14,
    color: colors.gray800,
    fontWeight: '500',
  },
  warningBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.warning,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});