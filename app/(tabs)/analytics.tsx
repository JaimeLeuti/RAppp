import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useHistoryStore } from '@/store/historyStore';
import { useTaskStore } from '@/store/taskStore';
import { useGoalStore } from '@/store/goalStore';
import { colors, shadows } from '@/constants/colors';
import { getToday, getWeekDates, formatTimeHuman, getMonthName } from '@/utils/date';
import { BarChart3, TrendingUp, Target, Clock, Calendar, Award } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { 
    getCurrentStreak, 
    getLongestStreak, 
    getTotalTasksCompleted, 
    getTotalTimeSpent,
    getAverageFocusScore,
    getProductiveDays,
    getWeeklyStats,
    getMonthlyStats,
    dailyProgress
  } = useHistoryStore();
  
  const { tasks, getOverdueTasks } = useTaskStore();
  const { getActiveGoals, getCompletedGoals } = useGoalStore();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  
  const today = getToday();
  const currentStreak = getCurrentStreak();
  const longestStreak = getLongestStreak();
  const totalTasks = getTotalTasksCompleted();
  const totalTime = getTotalTimeSpent();
  const averageFocus = getAverageFocusScore();
  const productiveDays = getProductiveDays();
  const overdueTasks = getOverdueTasks();
  const activeGoals = getActiveGoals();
  const completedGoals = getCompletedGoals();
  
  // Get period-specific stats
  const weekDates = getWeekDates();
  const weekStats = getWeeklyStats(weekDates[0]);
  const currentDate = new Date();
  const monthStats = getMonthlyStats(currentDate.getFullYear(), currentDate.getMonth() + 1);
  
  const getPeriodStats = () => {
    switch (selectedPeriod) {
      case 'week':
        return weekStats;
      case 'month':
        return monthStats;
      case 'all':
      default:
        return {
          totalTasks,
          totalTime,
          averageFocusScore: averageFocus,
          activeDays: productiveDays,
        };
    }
  };
  
  const periodStats = getPeriodStats();
  
  const StatCard = ({ title, value, subtitle, icon: Icon, color = colors.primary }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    color?: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Icon size={20} color={colors.white} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
  
  const ProgressCard = ({ title, current, total, color = colors.primary }: {
    title: string;
    current: number;
    total: number;
    color?: string;
  }) => {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    
    return (
      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>{title}</Text>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>{current} / {total}</Text>
          <Text style={styles.progressPercent}>{percentage}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${percentage}%`, backgroundColor: color }
            ]} 
          />
        </View>
      </View>
    );
  };
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Track your productivity journey</Text>
      </View>
      
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {[
          { key: 'week', label: 'This Week' },
          { key: 'month', label: 'This Month' },
          { key: 'all', label: 'All Time' },
        ].map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.selectedPeriodButton
            ]}
            onPress={() => setSelectedPeriod(period.key as any)}
          >
            <Text 
              style={[
                styles.periodButtonText,
                selectedPeriod === period.key && styles.selectedPeriodButtonText
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Key Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Tasks Completed"
            value={periodStats.totalTasks}
            icon={BarChart3}
            color={colors.success}
          />
          <StatCard
            title="Time Tracked"
            value={formatTimeHuman(periodStats.totalTime)}
            icon={Clock}
            color={colors.primary}
          />
          <StatCard
            title="Active Days"
            value={periodStats.activeDays}
            subtitle={selectedPeriod === 'week' ? 'out of 7' : selectedPeriod === 'month' ? `out of ${new Date().getDate()}` : 'total'}
            icon={Calendar}
            color={colors.warning}
          />
          <StatCard
            title="Focus Score"
            value={periodStats.averageFocusScore || 0}
            subtitle="average"
            icon={TrendingUp}
            color={colors.info}
          />
        </View>
      </View>
      
      {/* Streaks & Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Streaks & Achievements</Text>
        <View style={styles.achievementsGrid}>
          <StatCard
            title="Current Streak"
            value={currentStreak}
            subtitle="days"
            icon={Award}
            color={colors.success}
          />
          <StatCard
            title="Longest Streak"
            value={longestStreak}
            subtitle="days"
            icon={Target}
            color={colors.secondary}
          />
        </View>
      </View>
      
      {/* Goals Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Goals Overview</Text>
        <View style={styles.goalsOverview}>
          <ProgressCard
            title="Active Goals"
            current={activeGoals.length}
            total={activeGoals.length + completedGoals.length}
            color={colors.primary}
          />
          <ProgressCard
            title="Completed Goals"
            current={completedGoals.length}
            total={activeGoals.length + completedGoals.length}
            color={colors.success}
          />
        </View>
      </View>
      
      {/* Task Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Task Status</Text>
        <View style={styles.taskStatusGrid}>
          <View style={styles.taskStatusCard}>
            <Text style={styles.taskStatusValue}>{tasks.length}</Text>
            <Text style={styles.taskStatusLabel}>Total Tasks</Text>
          </View>
          <View style={styles.taskStatusCard}>
            <Text style={[styles.taskStatusValue, { color: colors.success }]}>
              {tasks.filter(t => t.status === 'completed').length}
            </Text>
            <Text style={styles.taskStatusLabel}>Completed</Text>
          </View>
          <View style={styles.taskStatusCard}>
            <Text style={[styles.taskStatusValue, { color: colors.warning }]}>
              {tasks.filter(t => t.status === 'pending').length}
            </Text>
            <Text style={styles.taskStatusLabel}>Pending</Text>
          </View>
          <View style={styles.taskStatusCard}>
            <Text style={[styles.taskStatusValue, { color: colors.error }]}>
              {overdueTasks.length}
            </Text>
            <Text style={styles.taskStatusLabel}>Overdue</Text>
          </View>
        </View>
      </View>
      
      {/* Productivity Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Productivity Insights</Text>
        <View style={styles.insightsContainer}>
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Daily Average</Text>
            <Text style={styles.insightValue}>
              {productiveDays > 0 ? Math.round(totalTasks / productiveDays) : 0} tasks
            </Text>
            <Text style={styles.insightSubtitle}>per productive day</Text>
          </View>
          
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Time per Task</Text>
            <Text style={styles.insightValue}>
              {totalTasks > 0 ? formatTimeHuman(Math.round(totalTime / totalTasks)) : '0m'}
            </Text>
            <Text style={styles.insightSubtitle}>average</Text>
          </View>
          
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Completion Rate</Text>
            <Text style={styles.insightValue}>
              {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%
            </Text>
            <Text style={styles.insightSubtitle}>overall</Text>
          </View>
        </View>
      </View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
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
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 16,
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedPeriodButton: {
    backgroundColor: colors.white,
    ...shadows.small,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray600,
  },
  selectedPeriodButtonText: {
    color: colors.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 16,
    marginHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    width: (width - 52) / 2,
    marginH: 6,
    ...shadows.medium,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    color: colors.gray600,
    fontWeight: '500',
  },
  statSubtitle: {
    fontSize: 10,
    color: colors.gray500,
  },
  achievementsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  goalsOverview: {
    paddingHorizontal: 20,
  },
  progressCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    ...shadows.medium,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: colors.gray600,
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 16,
    color: colors.gray900,
    fontWeight: 'bold',
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
  taskStatusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  taskStatusCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: (width - 64) / 4,
    marginHorizontal: 4,
    marginBottom: 12,
    ...shadows.medium,
  },
  taskStatusValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 4,
  },
  taskStatusLabel: {
    fontSize: 12,
    color: colors.gray600,
    fontWeight: '500',
    textAlign: 'center',
  },
  insightsContainer: {
    paddingHorizontal: 20,
  },
  insightCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    ...shadows.medium,
  },
  insightTitle: {
    fontSize: 14,
    color: colors.gray600,
    fontWeight: '500',
    marginBottom: 8,
  },
  insightValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  insightSubtitle: {
    fontSize: 12,
    color: colors.gray500,
  },
});