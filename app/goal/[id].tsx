import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Check, Clock, Plus, Target, Trash2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useGoalStore } from '@/store/goalStore';
import { useTaskStore } from '@/store/taskStore';
import { Milestone } from '@/types';
import ProgressBar from '@/components/ProgressBar';
import { formatTimeHuman } from '@/utils/date';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { getGoalById, updateGoal, deleteGoal, addMilestone, updateMilestone, deleteMilestone } = useGoalStore();
  const { getTasksByGoal, addTask } = useTaskStore();
  
  const goal = getGoalById(id);
  const tasks = getTasksByGoal(id);
  
  const [title, setTitle] = useState(goal?.title || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [newMilestone, setNewMilestone] = useState('');
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  
  useEffect(() => {
    if (!goal) {
      Alert.alert('Error', 'Goal not found');
      router.back();
    }
  }, [goal]);
  
  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description || '');
    }
  }, [goal]);
  
  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Goal title cannot be empty');
      return;
    }
    
    if (goal) {
      updateGoal(id, {
        title,
        description,
      });
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      router.back();
    }
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? This will not delete associated tasks.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            if (goal) {
              deleteGoal(id);
              router.back();
            }
          }
        }
      ]
    );
  };
  
  const handleAddMilestone = () => {
    if (!newMilestone.trim()) {
      return;
    }
    
    addMilestone(id, newMilestone);
    setNewMilestone('');
    setShowAddMilestone(false);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const handleToggleMilestone = (milestoneId: string, completed: boolean) => {
    updateMilestone(id, milestoneId, completed);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const handleDeleteMilestone = (milestoneId: string) => {
    deleteMilestone(id, milestoneId);
  };
  
  const handleCreateTaskFromMilestone = (milestone: Milestone) => {
    const taskId = addTask({
      title: milestone.title,
      priority: 3,
      date: new Date().toISOString().split('T')[0],
      goalId: id,
    });
    
    Alert.alert(
      'Task Created',
      'A new task has been created from this milestone.',
      [{ text: 'OK' }]
    );
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  if (!goal) return null;
  
  const progress = goal.current / goal.target;
  const progressPercent = Math.round(progress * 100);
  const isCompleted = goal.current >= goal.target;
  
  // Format the progress based on goal type
  const formatProgress = () => {
    if (goal.type === 'effort') {
      return `${formatTimeHuman(goal.current)} / ${formatTimeHuman(goal.target)}`;
    } else {
      return `${goal.current} / ${goal.target} ${goal.unit || ''}`;
    }
  };
  
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
        <View style={styles.header}>
          <View 
            style={[
              styles.iconContainer,
              { backgroundColor: goal.color }
            ]}
          >
            {goal.type === 'effort' ? (
              <Clock size={24} color={colors.white} />
            ) : (
              <Target size={24} color={colors.white} />
            )}
          </View>
          
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Goal title"
          />
          
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Add description"
            multiline
            numberOfLines={3}
          />
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Progress</Text>
          
          <ProgressBar 
            progress={progress} 
            color={goal.color}
            height={12}
            showPercentage={false}
          />
          
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {formatProgress()} ({progressPercent}%)
            </Text>
            
            {isCompleted && (
              <View style={styles.completedBadge}>
                <Check size={16} color={colors.white} />
                <Text style={styles.completedText}>Completed</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Milestones</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddMilestone(true)}
            >
              <Plus size={16} color={colors.primary} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          {showAddMilestone && (
            <View style={styles.addMilestoneContainer}>
              <TextInput
                style={styles.milestoneInput}
                value={newMilestone}
                onChangeText={setNewMilestone}
                placeholder="New milestone"
                autoFocus
              />
              <TouchableOpacity 
                style={styles.addMilestoneButton}
                onPress={handleAddMilestone}
              >
                <Text style={styles.addMilestoneButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {goal.milestones.length > 0 ? (
            <View style={styles.milestoneList}>
              {goal.milestones.map((milestone) => (
                <View key={milestone.id} style={styles.milestoneItem}>
                  <TouchableOpacity
                    style={[
                      styles.milestoneCheckbox,
                      milestone.completed && styles.milestoneChecked
                    ]}
                    onPress={() => handleToggleMilestone(milestone.id, !milestone.completed)}
                  >
                    {milestone.completed && (
                      <Check size={16} color={colors.white} />
                    )}
                  </TouchableOpacity>
                  
                  <Text 
                    style={[
                      styles.milestoneText,
                      milestone.completed && styles.milestoneTextCompleted
                    ]}
                  >
                    {milestone.title}
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.milestoneAction}
                    onPress={() => handleCreateTaskFromMilestone(milestone)}
                  >
                    <Text style={styles.milestoneActionText}>Create Task</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              No milestones yet. Add some to track your progress.
            </Text>
          )}
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Related Tasks</Text>
          
          {tasks.length > 0 ? (
            <View style={styles.taskList}>
              {tasks.map((task) => (
                <TouchableOpacity 
                  key={task.id} 
                  style={styles.taskItem}
                  onPress={() => router.push(`/task/${task.id}`)}
                >
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
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              No tasks linked to this goal yet.
            </Text>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: goal.color }]}
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
  },
  header: {
    backgroundColor: colors.white,
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray900,
    textAlign: 'center',
    marginBottom: 8,
    width: '100%',
  },
  descriptionInput: {
    fontSize: 16,
    color: colors.gray700,
    textAlign: 'center',
    width: '100%',
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.white,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.gray400,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  progressText: {
    fontSize: 16,
    color: colors.gray700,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
    marginLeft: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
  },
  addMilestoneContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  milestoneInput: {
    flex: 1,
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
  },
  addMilestoneButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  addMilestoneButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
  milestoneList: {
    marginBottom: 8,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  milestoneCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray400,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  milestoneText: {
    flex: 1,
    fontSize: 16,
    color: colors.gray800,
  },
  milestoneTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.gray500,
  },
  milestoneAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.gray100,
  },
  milestoneActionText: {
    fontSize: 12,
    color: colors.gray700,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray600,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
  },
  taskList: {
    marginBottom: 8,
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
  saveButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});