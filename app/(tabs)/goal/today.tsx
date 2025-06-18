import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Modal, TextInput, TouchableOpacity } from 'react-native';
import { useTaskStore } from '@/store/taskStore';
import { useGoalStore } from '@/store/goalStore';
import { useTimerStore } from '@/store/timerStore';
import { useHistoryStore } from '@/store/historyStore';
import { Task, TaskPriority } from '@/types';
import { colors } from '@/constants/colors';
import { getToday, getTomorrow } from '@/utils/date';
import TaskItem from '@/components/TaskItem';
import Timer from '@/components/Timer';
import AddButton from '@/components/AddButton';
import EmptyState from '@/components/EmptyState';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function TodayScreen() {
  const { tasks, addTask, getTasksByDate, getCompletedTasksCountByDate } = useTaskStore();
  const { goals, getActiveGoals } = useGoalStore();
  const { isRunning, taskId } = useTimerStore();
  const { updateDailyProgress } = useHistoryStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>(1);
  const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>(undefined);
  const [showTomorrow, setShowTomorrow] = useState(false);
  
  const today = getToday();
  const tomorrow = getTomorrow();
  
  const todayTasks = getTasksByDate(today);
  const tomorrowTasks = getTasksByDate(tomorrow);
  const activeGoals = getActiveGoals();
  
  const completedTasksCount = getCompletedTasksCountByDate(today);
  const totalTimeSpent = todayTasks.reduce((total, task) => total + task.timeSpent, 0);
  
  // Update daily progress when tasks or time changes
  useEffect(() => {
    updateDailyProgress(today, completedTasksCount, totalTimeSpent);
  }, [completedTasksCount, totalTimeSpent]);
  
  const handleAddTask = () => {
    if (!taskTitle.trim()) {
      Alert.alert('Error', 'Task title cannot be empty');
      return;
    }
    
    addTask({
      title: taskTitle,
      description: '',
      priority: taskPriority,
      date: showTomorrow ? tomorrow : today,
      goalId: selectedGoalId,
    });
    
    // Reset form
    setTaskTitle('');
    setTaskPriority(1);
    setSelectedGoalId(undefined);
    setModalVisible(false);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  const renderTaskItem = ({ item, index }: { item: Task; index: number }) => {
    const showWarning = !showTomorrow && index >= 5;
    return <TaskItem task={item} index={index} showWarning={showWarning} />;
  };
  
  const renderPriorityButton = (priority: TaskPriority) => (
    <TouchableOpacity
      key={`priority-${priority}`}
      style={[
        styles.priorityButton,
        taskPriority === priority && { backgroundColor: colors.priority[priority - 1] }
      ]}
      onPress={() => setTaskPriority(priority)}
    >
      <Text
        style={[
          styles.priorityButtonText,
          taskPriority === priority && { color: colors.white }
        ]}
      >
        {priority}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completedTasksCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{todayTasks.length}</Text>
          <Text style={styles.statLabel}>Total Tasks</Text>
        </View>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, !showTomorrow && styles.activeTab]}
          onPress={() => setShowTomorrow(false)}
        >
          <Text style={[styles.tabText, !showTomorrow && styles.activeTabText]}>
            Today
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, showTomorrow && styles.activeTab]}
          onPress={() => setShowTomorrow(true)}
        >
          <Text style={[styles.tabText, showTomorrow && styles.activeTabText]}>
            Tomorrow
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Task List */}
      {showTomorrow ? (
        tomorrowTasks.length > 0 ? (
          <FlatList
            data={tomorrowTasks}
            renderItem={renderTaskItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <EmptyState
            title="No tasks for tomorrow"
            message="Plan ahead by adding tasks for tomorrow."
            actionLabel="Add Task"
            onAction={() => setModalVisible(true)}
          />
        )
      ) : (
        todayTasks.length > 0 ? (
          <FlatList
            data={todayTasks}
            renderItem={renderTaskItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <EmptyState
            title="No tasks for today"
            message="Add up to 5 important tasks to focus on today."
            actionLabel="Add Task"
            onAction={() => setModalVisible(true)}
          />
        )
      )}
      
      {/* Add Task Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {showTomorrow ? 'Add Task for Tomorrow' : 'Add Task for Today'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Task title"
              value={taskTitle}
              onChangeText={setTaskTitle}
              autoFocus
            />
            
            <Text style={styles.sectionTitle}>Priority</Text>
            <View style={styles.priorityContainer}>
              {[1, 2, 3, 4, 5].map((priority) => renderPriorityButton(priority as TaskPriority))}
            </View>
            
            <Text style={styles.sectionTitle}>Link to Goal (Optional)</Text>
            <View style={styles.goalContainer}>
              <TouchableOpacity
                key="goal-none"
                style={[
                  styles.goalButton,
                  !selectedGoalId && styles.selectedGoalButton
                ]}
                onPress={() => setSelectedGoalId(undefined)}
              >
                <Text style={styles.goalButtonText}>None</Text>
              </TouchableOpacity>
              
              {activeGoals.map((goal) => (
                <TouchableOpacity
                  key={`goal-${goal.id}`}
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
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddTask}
              >
                <Text style={styles.addButtonText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Timer */}
      {isRunning && taskId && <Timer />}
      
      {/* Add Button */}
      <AddButton onPress={() => setModalVisible(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: colors.gray400,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray900,
  },
  statLabel: {
    fontSize: 14,
    color: colors.gray600,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: colors.gray200,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.gray200,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.white,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray600,
  },
  activeTabText: {
    color: colors.gray900,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray800,
    marginBottom: 8,
  },
  priorityContainer: {
    flexDirection: 'row',
    marginBottom: 16,
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
    marginBottom: 24,
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
  modalActions: {
    flexDirection: 'row',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray700,
  },
  addButton: {
    flex: 2,
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.white,
  },
});