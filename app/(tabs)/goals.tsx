import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useGoalStore } from '@/store/goalStore';
import { Goal, GoalTimeframe, GoalType } from '@/types';
import { colors, shadows } from '@/constants/colors';
import { getToday, addDays } from '@/utils/date';
import GoalCard from '@/components/GoalCard';
import AddButton from '@/components/AddButton';
import EmptyState from '@/components/EmptyState';
import { X, Target, Clock, Calendar } from 'lucide-react-native';

const goalColors = colors.goalColors;

const timeframes: { label: string; value: GoalTimeframe; days: number }[] = [
  { label: 'Daily', value: 'daily', days: 1 },
  { label: 'Weekly', value: 'weekly', days: 7 },
  { label: 'Monthly', value: 'monthly', days: 30 },
  { label: 'Quarterly', value: 'quarterly', days: 90 },
  { label: 'Yearly', value: 'yearly', days: 365 },
  { label: 'Custom', value: 'custom', days: 30 },
];

const goalTypes: { label: string; value: GoalType; description: string; icon: any }[] = [
  { 
    label: 'Time-based', 
    value: 'effort', 
    description: 'Track time spent (hours/minutes)',
    icon: Clock
  },
  { 
    label: 'Count-based', 
    value: 'quantity', 
    description: 'Track quantity (pages, workouts, etc.)',
    icon: Target
  },
  { 
    label: 'Hybrid', 
    value: 'hybrid', 
    description: 'Combine time and quantity tracking',
    icon: Calendar
  },
];

export default function GoalsScreen() {
  const { goals, addGoal, getActiveGoals, getCompletedGoals } = useGoalStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<GoalTimeframe>('weekly');
  const [selectedType, setSelectedType] = useState<GoalType>('effort');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');
  const [selectedColor, setSelectedColor] = useState(goalColors[0]);
  const [selectedIcon, setSelectedIcon] = useState('target');
  const [showCompleted, setShowCompleted] = useState(false);
  
  const activeGoals = getActiveGoals();
  const completedGoals = getCompletedGoals();
  
  const handleAddGoal = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Goal title cannot be empty');
      return;
    }
    
    if (!target || isNaN(Number(target)) || Number(target) <= 0) {
      Alert.alert('Error', 'Please enter a valid target value');
      return;
    }
    
    if (selectedType !== 'effort' && !unit.trim()) {
      Alert.alert('Error', 'Please specify a unit for your goal');
      return;
    }
    
    const startDate = getToday();
    const timeframeData = timeframes.find(t => t.value === selectedTimeframe);
    const endDate = addDays(startDate, timeframeData?.days || 30);
    
    // Convert target to seconds if effort-based
    let targetValue = Number(target);
    if (selectedType === 'effort') {
      targetValue = targetValue * 60 * 60; // Convert hours to seconds
    }
    
    addGoal({
      title,
      description,
      type: selectedType,
      timeframe: selectedTimeframe,
      startDate,
      endDate,
      target: targetValue,
      unit: selectedType === 'effort' ? 'seconds' : unit,
      color: selectedColor,
      icon: selectedIcon,
    });
    
    // Reset form
    resetForm();
    setModalVisible(false);
  };
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedTimeframe('weekly');
    setSelectedType('effort');
    setTarget('');
    setUnit('');
    setSelectedColor(goalColors[0]);
    setSelectedIcon('target');
  };
  
  const renderGoalItem = ({ item }: { item: Goal }) => <GoalCard goal={item} />;
  
  const currentGoals = showCompleted ? completedGoals : activeGoals;
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Goals</Text>
        <Text style={styles.headerSubtitle}>
          {activeGoals.length} active • {completedGoals.length} completed
        </Text>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, !showCompleted && styles.activeTab]}
          onPress={() => setShowCompleted(false)}
        >
          <Text style={[styles.tabText, !showCompleted && styles.activeTabText]}>
            Active ({activeGoals.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, showCompleted && styles.activeTab]}
          onPress={() => setShowCompleted(true)}
        >
          <Text style={[styles.tabText, showCompleted && styles.activeTabText]}>
            Completed ({completedGoals.length})
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Goal List */}
      {currentGoals.length > 0 ? (
        <FlatList
          data={currentGoals}
          renderItem={renderGoalItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          title={showCompleted ? "No completed goals yet" : "No active goals"}
          message={showCompleted ? "Complete some goals to see them here." : "Create your first goal to start tracking your progress."}
          actionLabel={showCompleted ? undefined : "Create Goal"}
          onAction={showCompleted ? undefined : () => setModalVisible(true)}
          imageUrl="https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400"
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Goal</Text>
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
                placeholder="What do you want to achieve?"
                value={title}
                onChangeText={setTitle}
                autoFocus
              />
              
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your goal in detail..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
              
              <Text style={styles.inputLabel}>Goal Type</Text>
              <View style={styles.typeContainer}>
                {goalTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.typeButton,
                        selectedType === type.value && styles.selectedTypeButton
                      ]}
                      onPress={() => setSelectedType(type.value)}
                    >
                      <IconComponent 
                        size={20} 
                        color={selectedType === type.value ? colors.primary : colors.gray600} 
                      />
                      <Text 
                        style={[
                          styles.typeButtonText,
                          selectedType === type.value && styles.selectedTypeButtonText
                        ]}
                      >
                        {type.label}
                      </Text>
                      <Text style={styles.typeDescription}>
                        {type.description}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              <Text style={styles.inputLabel}>Timeframe</Text>
              <View style={styles.timeframeContainer}>
                {timeframes.map((timeframe) => (
                  <TouchableOpacity
                    key={timeframe.value}
                    style={[
                      styles.timeframeButton,
                      selectedTimeframe === timeframe.value && styles.selectedTimeframeButton
                    ]}
                    onPress={() => setSelectedTimeframe(timeframe.value)}
                  >
                    <Text 
                      style={[
                        styles.timeframeButtonText,
                        selectedTimeframe === timeframe.value && styles.selectedTimeframeButtonText
                      ]}
                    >
                      {timeframe.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.targetContainer}>
                <View style={styles.targetInput}>
                  <Text style={styles.inputLabel}>
                    {selectedType === 'effort' ? 'Target Hours *' : 'Target Amount *'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={selectedType === 'effort' ? "e.g., 20" : "e.g., 100"}
                    value={target}
                    onChangeText={setTarget}
                    keyboardType="numeric"
                  />
                </View>
                
                {selectedType !== 'effort' && (
                  <View style={styles.unitInput}>
                    <Text style={styles.inputLabel}>Unit *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., pages, workouts"
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
                onPress={handleAddGoal}
              >
                <Text style={styles.addButtonText}>Create Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Add Button */}
      {!showCompleted && <AddButton onPress={() => setModalVisible(true)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.gray600,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 16,
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
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
  typeContainer: {
    marginTop: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
    marginBottom: 12,
  },
  selectedTypeButton: {
    borderColor: colors.primary,
    backgroundColor: colors.gray50,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray700,
    marginLeft: 12,
    flex: 1,
  },
  selectedTypeButtonText: {
    color: colors.primary,
  },
  typeDescription: {
    fontSize: 12,
    color: colors.gray500,
    flex: 2,
    textAlign: 'right',
  },
  timeframeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  timeframeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTimeframeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeframeButtonText: {
    fontSize: 14,
    color: colors.gray700,
    fontWeight: '500',
  },
  selectedTimeframeButtonText: {
    color: colors.white,
  },
  targetContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  targetInput: {
    flex: 2,
    marginRight: 12,
  },
  unitInput: {
    flex: 1,
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  colorButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    marginBottom: 12,
  },
  selectedColorButton: {
    borderWidth: 3,
    borderColor: colors.gray800,
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