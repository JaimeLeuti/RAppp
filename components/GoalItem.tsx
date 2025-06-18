import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, Clock, Target } from 'lucide-react-native';
import { Goal } from '@/types';
import { colors } from '@/constants/colors';
import { formatTimeHuman } from '@/utils/date';

interface GoalItemProps {
  goal: Goal;
}

export default function GoalItem({ goal }: GoalItemProps) {
  const router = useRouter();
  
  const handlePress = () => {
    router.push(`/goal/${goal.id}`);
  };
  
  const progress = Math.min(goal.current / goal.target, 1);
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
  
  // Get icon based on goal type
  const getIcon = () => {
    if (goal.type === 'effort') {
      return <Clock size={16} color={colors.white} />;
    } else {
      return <Target size={16} color={colors.white} />;
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: goal.color }]}>
        {getIcon()}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {goal.title}
        </Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercent}%`, backgroundColor: goal.color }
              ]} 
            />
          </View>
          
          <Text style={styles.progressText}>
            {formatProgress()} ({progressPercent}%)
          </Text>
        </View>
      </View>
      
      {isCompleted && (
        <View style={styles.completedBadge}>
          <CheckCircle2 size={20} color={colors.success} />
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
    shadowColor: colors.gray400,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray800,
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray200,
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: colors.gray600,
  },
  completedBadge: {
    marginLeft: 8,
  },
});