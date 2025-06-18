import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTaskStore } from '@/store/taskStore';
import { useGoalStore } from '@/store/goalStore';
import { useTimerStore } from '@/store/timerStore';
import { useHistoryStore } from '@/store/historyStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Task, TaskPriority } from '@/types';
import { colors, shadows } from '@/constants/colors';
import { getToday, getTomorrow, getRelativeDate } from '@/utils/date';
import TaskItem from '@/components/TaskItem';
import Timer from '@/components/Timer';
import AddButton from '@/components/AddButton';
import EmptyState from '@/components/EmptyState';
import { Calendar, Clock, Target, X } from 'lucide-react-native';

export default function TodayScreen() {
  const { 
    tasks, 
    addTask, 
    getTasksByDate, 
    getCompletedTasksCountByDate,
    getTotalTimeSpentByDate 
  } = useTaskStore();
  
  const { getActiveGoals } = useGoalStore();
  const { isRunning, taskId } = useTimerStore();
  const { updateDailyProgress } = useHistoryStore();
  const { maxDailyTasks } = useSettingsStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>(3);
  const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>(undefined);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [showTomorrow, setShowTomorrow] = useState(false);
  
  const today = getToday();
  const tomorrow = getTomorrow();
  
  const todayTasks = getTasksByDate(today);
  const tomorrowTasks = getTasksByDate(tomorrow);
  const activeGoals = getActiveGoals();
  
  const completedTasksCount = getCompletedTasksCountByDate(today);
  const totalTimeSpent = getTotalTimeSpentByDate(today);
  
  // Update daily progress when tasks or time changes
  useEffect(() => {
    updateDailyProgress(today, completedTasksCount, totalTimeSpent);
  }, [completedTasksCount, totalTimeSpent, today, updateDailyProgress]);
  
  const handleAddTask = () => {
    if (!taskTitle.trim()) {
      Alert.alert('Error', 'Task title cannot be empty');
      return;
    }
    
    const targetDate = showTomorrow ? tomorrow : today;
    const currentTasksCount = getTasksByDate(targetDate).length;
    
    if (!showTomorrow && currentTasksCount >= maxDailyTasks) {
      Alert.alert(
        'Daily Limit Reached',
        `You've reached your daily limit of ${maxDailyTasks} tasks. Consider moving some to tomorrow or increasing your limit in settings.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Anyway', onPress: () => proceedWithAddTask() }
        ]
      );
      return;
    }
    
    proceedWithAddTask();
  };
  
  const proceedWithAddTask = () => {
    const estimatedTimeInSeconds = estimatedTime ? parseInt(estimatedTime) * 60 : undefined;
    
    addTask({
      title: taskTitle,
      description: taskDescription,
      priority: taskPriority,
      date: showTomorrow ? tomorrow : today,
      goalId: selectedGoalId,
      estimatedTime: estimatedTimeInSeconds,
    });
    
    // Reset form
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority(3);
    setSelectedGoalId(undefined);
    setEstimatedTime('');
    setModalVisible(false);
  };
  
  const renderTaskItem = ({ item, index }: { item: Task; index: number }) => {
    const showWarning = !showTomorrow && index >= maxDailyTasks;
    return <TaskItem task={item} showWarning={showWarning} />;
  };
  
  const renderPriorityButton = (priority: TaskPriority) => (
    <TouchableOpacity
      key={`priority-${priority}`}
      style={[
        styles.priorityButton,
        taskPriority === priority && { 
          backgroundColor: colors.priority[priority],
          borderColor: colors.priority[priority]
        }
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
  
  const currentTasks = showTomorrow ? tomorrowTasks : todayTasks;
  const currentDate = showTomorrow ? tomorrow : today;
  
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
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Math.round((totalTimeSpent / 3600) * 10) / 10}h
          </Text>
          <Text style={styles.statLabel}>Time Spent</Text>
        </View>
      </View>
      
      {/* Date Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, !showTomorrow && styles.activeTab]}
          onPress={() => setShowTomorrow(false)}
        >
          <Calendar size={16} color={!showTomorrow ? colors.primary : colors.gray500} />
          <Text style={[styles.tabText, !showTomorrow && styles.activeTabText]}>
            Today
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, showTomorrow && styles.activeTab]}
          onPress={() => setShowTomorrow(true)}
        >
          <Calendar size={16} color={showTomorrow ? colors.primary : colors.gray500} />
          <Text style={[styles.tabText, showTomorrow && styles.activeTabText]}>
            Tomorrow
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Task List */}
      {currentTasks.length > 0 ? (
        <FlatList
          data={currentTasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          title={`No tasks for ${showTomorrow ? 'tomorrow' : 'today'}`}
          message={`${showTomorrow ? 'Plan ahead by adding tasks for tomorrow' : 'Add up to 5 important tasks to focus on today'}.`}
          actionLabel="Add Task"
          onAction={() => setModalVisible(true)}
          imageUrl="https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400"
        />
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Add Task for {getRelativeDate(currentDate)}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color={colors.gray600} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="What needs to be done?"
                value={taskTitle}
                onChangeText={setTaskTitle}
                autoFocus
              />
              
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add more details..."
                value={taskDescription}
                onChangeText={setTaskDescription}
                multiline
                numberOfLines={3}
              />
              
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.priorityContainer}>
                {[1, 2, 3, 4, 5].map((priority) => renderPriorityButton(priority as TaskPriority))}
              </View>
              
              <Text style={styles.inputLabel}>Estimated Time (minutes)</Text>
              <TextInput
                style={styles.input}
                placeholder="How long will this take?"
                value={estimatedTime}
                onChangeText={setEstimatedTime}
                keyboardType="numeric"
              />
              
              <Text style={styles.inputLabel}>Link to Goal (Optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                  
                  {activeGoals.map((goal) => (
                    <TouchableOpacity
                      key={goal.id}
                      style={[
                        styles.goalButton,
                        selectedGoalId === goal.id && styles.selectedGoalButton,
                        { borderColor: goal.color }
                      ]}
                      onPress={() => setSelectedGoalId(goal.id)}
                    >
                      <View style={[styles.goalIndicator, { backgroundColor: goal.color }]} />
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
              </ScrollView>
            </ScrollView>
            
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
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 16,
    ...shadows.medium,
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
    fontSize: 12,
    color: colors.gray600,
    marginTop: 4,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: colors.gray200,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.white,
    ...shadows.small,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray600,
    marginLeft: 6,
  },
  activeTabText: {
    color: colors.primary,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray900,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.gray900,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  priorityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gray100,
    borderWidth: 2,
    borderColor: colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  priorityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray700,
  },
  goalContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  goalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
    marginRight: 12,
    maxWidth: 200,
  },
  selectedGoalButton: {
    backgroundColor: colors.gray50,
    borderColor: colors.primary,
  },
  goalIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  goalButtonText: {
    fontSize: 14,
    color: colors.gray700,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: colors.gray100,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
    fontWeight: '600',
    color: colors.white,
  },
});