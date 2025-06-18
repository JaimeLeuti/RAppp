import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Target, Clock, CheckCircle2, Calendar } from 'lucide-react-native';
import { Goal } from '@/types';
import { colors, shadows } from '@/constants/colors';
import { formatTimeHuman, getDaysUntil } from '@/utils/date';

interface GoalCardProps {
  goal: Goal;
  onPress?: () => void;
}

export default function GoalCard({ goal, onPress }: GoalCardProps) {
  const router = useRouter();
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/goal/${goal.id}`);
    }
  };
  
  const progress = Math.min(goal.current / goal.target, 1);
  const progressPercent = Math.round(progress * 100);
  const isCompleted = goal.current >= goal.target;
  const daysLeft = getDaysUntil(goal.endDate);
  
  const formatProgress = () => {
    if (goal.type === 'effort') {
      return `${formatTimeHuman(goal.current)} / ${formatTimeHuman(goal.target)}`;
    } else {
      return `${goal.current} / ${goal.target} ${goal.unit || ''}`;
    }
  };
  
  const getIcon = () => {
    if (goal.type === 'effort') {
      return <Clock size={20} color={colors.white} />;
    } else {
      return <Target size={20} color={colors.white} />;
    }
  };
  
  const getTimeframeLabel = () => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly',
      custom: 'Custom',
    };
    return labels[goal.timeframe];
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: goal.color }]}>
          {getIcon()}
        </View>
        
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={1}>
            {goal.title}
          </Text>
          <Text style={styles.timeframe}>
            {getTimeframeLabel()}
          </Text>
        </View>
        
        {isCompleted && (
          <View style={styles.completedBadge}>
            <CheckCircle2 size={20} color={colors.success} />
          </View>
        )}
      </View>
      
      {/* Description */}
      {goal.description && (
        <Text style={styles.description} numberOfLines={2}>
          {goal.description}
        </Text>
      )}
      
      {/* Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            {formatProgress()}
          </Text>
          <Text style={styles.progressPercent}>
            {progressPercent}%
          </Text>
        </View>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${progressPercent}%`, 
                backgroundColor: goal.color 
              }
            ]} 
          />
        </View>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.milestonesInfo}>
          <Text style={styles.milestonesText}>
            {goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} milestones
          </Text>
        </View>
        
        <View style={styles.daysLeft}>
          <Calendar size={14} color={colors.gray500} />
          <Text style={styles.daysLeftText}>
            {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Due today' : 'Overdue'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...shadows.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 2,
  },
  timeframe: {
    fontSize: 14,
    color: colors.gray600,
    fontWeight: '500',
  },
  completedBadge: {
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: colors.gray600,
    lineHeight: 20,
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: colors.gray700,
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 16,
    color: colors.gray900,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestonesInfo: {
    flex: 1,
  },
  milestonesText: {
    fontSize: 12,
    color: colors.gray500,
    fontWeight: '500',
  },
  daysLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  daysLeftText: {
    fontSize: 12,
    color: colors.gray500,
    marginLeft: 4,
    fontWeight: '500',
  },
});