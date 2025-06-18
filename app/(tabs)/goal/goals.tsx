import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useGoalStore } from '@/store/goalStore';
import { Goal, GoalTimeframe, GoalType } from '@/types';
import { colors } from '@/constants/colors';
import GoalItem from '@/components/GoalItem';
import AddButton from '@/components/AddButton';
import EmptyState from '@/components/EmptyState';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const goalColors = [
  colors.primary,
  colors.secondary,
  '#10B981', // Green
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#F97316', // Orange
];

const timeframes: { label: string; value: GoalTimeframe }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Custom', value: 'custom' },
];

const goalTypes: { label: string; value: GoalType }[] = [
  { label: 'Effort-based (time)', value: 'effort' },
  { label: 'Quantifiable (units)', value: 'quantity' },
  { label: 'Hybrid', value: 'hybrid' },
];

export default function GoalsScreen() {
  const { goals, addGoal } = useGoalStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<GoalTimeframe>('weekly');
  const [selectedType, setSelectedType] = useState<GoalType>('effort');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');
  const [selectedColor, setSelectedColor] = useState(goalColors[0]);
  
  const activeGoals = goals.filter(goal => goal.current < goal.target);
  const completedGoals = goals.filter(goal => goal.current >= goal.target);
  
  const handleAddGoal = () => {
    if (!title.trim()) {
      alert('Please enter a goal title');
      return;
    }
    
    if (!target || isNaN(Number(target)) || Number(target) <= 0) {
      alert('Please enter a valid target value');
      return;
    }
    
    // Calculate start and end dates based on timeframe
    const startDate = new Date().toISOString().split('T')[0];
    let endDate = new Date();
    
    switch (selectedTimeframe) {
      case 'daily':
        endDate.setDate(endDate.getDate() + 1);
        break;
      case 'weekly':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      case 'custom':
        // For custom, default to 30 days
        endDate.setDate(endDate.getDate() + 30);
        break;
    }
    
    // Convert target to seconds if effort-based
    let targetValue = Number(target);
    if (selectedType === 'effort') {
      // Assume target is in hours, convert to seconds
      targetValue = targetValue * 60 * 60;
    }
    
    addGoal({
      title,
      description,
      type: selectedType,
      timeframe: selectedTimeframe,
      startDate,
      endDate: endDate.toISOString().split('T')[0],
      target: targetValue,
      unit: selectedType === 'effort' ? 'seconds' : unit,
      color: selectedColor,
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setSelectedTimeframe('weekly');
    setSelectedType('effort');
    setTarget('');
    setUnit('');
    setSelectedColor(goalColors[0]);
    setModalVisible(false);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  const renderGoalItem = ({ item }: { item: Goal }) => <GoalItem goal={item} />;
  
  return (
    <View style={styles.container}>
      {/* Tabs for Active/Completed */}
      <View style={styles.tabContainer}>
        <Text style={styles.tabTitle}>Active Goals</Text>
      </View>
      
      {/* Goal List */}
      {activeGoals.length > 0 ? (
        <FlatList
          data={activeGoals}
          renderItem={renderGoalItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={
            completedGoals.length > 0 ? (
              <View style={styles.completedSection}>
                <Text style={styles.completedTitle}>Completed Goals</Text>
                {completedGoals.map((goal) => (
                  <GoalItem key={goal.id} goal={goal} />
                ))}
              </View>
            ) : null
          }
        />
      ) : (
        <EmptyState
          title="No goals yet"
          message="Create your first goal to start tracking your progress."
          actionLabel="Create Goal"
          onAction={() => setModalVisible(true)}
        />
      )}
      
      {/* Add Goal Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Goal</Text>
            
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Goal title"
              value={title}
              onChangeText={setTitle}
            />
            
            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your goal"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
            
            <Text style={styles.inputLabel}>Goal Type</Text>
            <View style={styles.optionsContainer}>
              {goalTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.optionButton,
                    selectedType === type.value && styles.selectedOption
                  ]}
                  onPress={() => setSelectedType(type.value)}
                >
                  <Text 
                    style={[
                      styles.optionText,
                      selectedType === type.value && styles.selectedOptionText
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.inputLabel}>Timeframe</Text>
            <View style={styles.optionsContainer}>
              {timeframes.map((timeframe) => (
                <TouchableOpacity
                  key={timeframe.value}
                  style={[
                    styles.optionButton,
                    selectedTimeframe === timeframe.value && styles.selectedOption
                  ]}
                  onPress={() => setSelectedTimeframe(timeframe.value)}
                >
                  <Text 
                    style={[
                      styles.optionText,
                      selectedTimeframe === timeframe.value && styles.selectedOptionText
                    ]}
                  >
                    {timeframe.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.targetContainer}>
              <View style={{ flex: 2 }}>
                <Text style={styles.inputLabel}>
                  {selectedType === 'effort' ? 'Target Hours' : 'Target Amount'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={selectedType === 'effort' ? "Hours" : "Amount"}
                  value={target}
                  onChangeText={setTarget}
                  keyboardType="numeric"
                />
              </View>
              
              {selectedType !== 'effort' && (
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.inputLabel}>Unit</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., pages"
                    value={unit}
                    onChangeText={setUnit}
                  />
                </View>
              )}
            </View>
            
            <Text style={styles.inputLabel}>Color</Text>
            <View style={styles.colorContainer}>
              {goalColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColorButton
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
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
                onPress={handleAddGoal}
              >
                <Text style={styles.addButtonText}>Create Goal</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
      
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
  tabContainer: {
    padding: 16,
    backgroundColor: colors.white,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray800,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  completedSection: {
    marginTop: 24,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray800,
    marginBottom: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.white,
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    flex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray800,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray300,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: colors.gray700,
  },
  selectedOptionText: {
    color: colors.white,
  },
  targetContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  colorContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  selectedColorButton: {
    borderWidth: 3,
    borderColor: colors.gray800,
  },
  modalActions: {
    flexDirection: 'row',
    marginBottom: 40,
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