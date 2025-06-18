import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Clock, Trash2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import { useGoalStore } from '@/store/goalStore';
import { useTimerStore } from '@/store/timerStore';
import { formatTime, formatTimeHuman } from '@/utils/date';
import { TaskPriority } from '@/types';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { getTaskById, updateTask, deleteTask, updateTaskStatus } = useTaskStore();
  const { goals, getGoalById, updateGoalProgress } = useGoalStore();
  const { isRunning, taskId, startTimer, stopTimer, elapsedTime } = useTimerStore();
  
  const task = getTaskById(id);
  const linkedGoal = task?.goalId ? getGoalById(task.goalId) : undefined;
  
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 1);
  const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>(task?.goalId);
  const [timeInput, setTimeInput] = useState('');
  
  const isActive = isRunning && taskId === id;
  
  useEffect(() => {
    if (!task) {
      Alert.alert('Error', 'Task not found');
      router.back();
    }
  }, [task]);
  
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setSelectedGoalId(task.goalId);
    }
  }, [task]);
  
  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Task title cannot be empty');
      return;
    }
    
    if (task) {
      updateTask(id, {
        title,
        description,
        priority,
        goalId: selectedGoalId,
      });
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      router.back();
    }
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            if (task) {
              deleteTask(id);
              router.back();
            }
          }
        }
      ]
    );
  };
  
  const handleStatusToggle = () => {
    if (task) {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      updateTaskStatus(id, newStatus);
      
      if (newStatus === 'completed' && task.goalId) {
        // If task is linked to a goal, prompt for progress update
        if (linkedGoal?.type === 'effort') {
          // For effort-based goals, add the time spent
          updateGoalProgress(task.goalId, task.timeSpent);
        } else {
          // For quantity-based goals, add 1 unit by default
          updateGoalProgress(task.goalId, 1);
        }
      }
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  };
  
  const handleTimerToggle = () => {
    if (isActive) {
      stopTimer();
    } else {
      startTimer(id);
    }
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const handleAddTime = () => {
    const timeInMinutes = parseInt(timeInput);
    if (isNaN(timeInMinutes) || timeInMinutes <= 0) {
      Alert.alert('Error', 'Please enter a valid time in minutes');
      return;
    }
    
    if (task) {
      const timeInSeconds = timeInMinutes * 60;
      updateTask(id, {
        timeSpent: task.timeSpent + timeInSeconds,
      });
      setTimeInput('');
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };
  
  const renderPriorityButton = (p: TaskPriority) => (
    <TouchableOpacity
      style={[
        styles.priorityButton,
        priority === p && { backgroundColor: colors.priority[p - 1] }
      ]}
      onPress={() => setPriority(p)}
    >
      <Text
        style={[
          styles.priorityButtonText,
          priority === p && { color: colors.white }
        ]}
      >
        {p}
      </Text>
    </TouchableOpacity>
  );
  
  if (!task) return null;
  
  return (
    <>
      <Stack.Screen 
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} style={{ marginRight: 16 }}>
              <Trash2 size={20} color={colors.error} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={[
                styles.statusButton,
                task.status === 'completed' && styles.completedButton
              ]}
              onPress={handleStatusToggle}
            >
              <Text style={styles.statusText}>
                {task.status === 'completed' ? 'Completed' : 'Mark as Complete'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Task title"
          />
          
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Add description"
            multiline
            numberOfLines={4}
          />
          
          <Text style={styles.sectionTitle}>Priority</Text>
          <View style={styles.priorityContainer}>
            {[1, 2, 3, 4, 5].map((p) => renderPriorityButton(p as TaskPriority))}
          </View>
          
          <Text style={styles.sectionTitle}>Linked Goal</Text>
          <View style={styles.goalContainer}>
            <TouchableOpacity
              style={[
                styles.goalButton,
                !selectedGoalId && styles.selectedGoalButton
              ]}
              onPress={() => setSelectedGoalId(undefined)}
            >
              <Text style={styles.goalButtonText}>None</Text>
            </TouchableOpacity>
            
            {goals.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalButton,
                  selectedGoalId === goal.id && styles.selectedGoalButton,
                  { borderColor: goal.color }
                ]}
                onPress={() => setSelectedGoalId(goal.id)}
              >
                <Text 
                  style={[
                    styles.goalButtonText,
                    selectedGoalId === goal.id && { color: goal.color }
                  ]}
                  numberOfLines={1}
                >
                  {goal.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Time Tracking</Text>
          
          <View style={styles.timeContainer}>
            <View style={styles.timeInfo}>
              <Clock size={20} color={colors.gray700} />
              <Text style={styles.timeText}>
                {formatTimeHuman(task.timeSpent)}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.timerButton, isActive && styles.timerActiveButton]}
              onPress={handleTimerToggle}
            >
              <Text style={[styles.timerButtonText, isActive && styles.timerActiveText]}>
                {isActive ? `Stop (${formatTime(elapsedTime)})` : 'Start Timer'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.addTimeContainer}>
            <TextInput
              style={styles.timeInput}
              value={timeInput}
              onChangeText={setTimeInput}
              placeholder="Add time (minutes)"
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.addTimeButton}
              onPress={handleAddTime}
            >
              <Text style={styles.addTimeButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
    padding: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.gray400,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.gray200,
  },
  completedButton: {
    backgroundColor: colors.success,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray700,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 16,
    padding: 0,
  },
  descriptionInput: {
    fontSize: 16,
    color: colors.gray700,
    marginBottom: 24,
    padding: 0,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: 12,
  },
  priorityContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  priorityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  priorityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray700,
  },
  goalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  goalButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray300,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedGoalButton: {
    backgroundColor: colors.gray100,
    borderColor: colors.primary,
  },
  goalButtonText: {
    fontSize: 14,
    color: colors.gray700,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray800,
    marginLeft: 8,
  },
  timerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.gray200,
  },
  timerActiveButton: {
    backgroundColor: colors.primary,
  },
  timerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray700,
  },
  timerActiveText: {
    color: colors.white,
  },
  addTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    flex: 1,
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
  },
  addTimeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.gray200,
  },
  addTimeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray700,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});