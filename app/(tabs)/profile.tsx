import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  User, 
  Settings, 
  Bell, 
  Moon, 
  Clock, 
  Calendar,
  Target,
  BarChart3,
  HelpCircle,
  Shield,
  Heart,
  ChevronRight,
  LogOut
} from 'lucide-react-native';
import { colors, shadows } from '@/constants/colors';
import { useSettingsStore } from '@/store/settingsStore';
import { useHistoryStore } from '@/store/historyStore';
import { useTaskStore } from '@/store/taskStore';
import { useGoalStore } from '@/store/goalStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { 
    reminderEnabled, 
    reminderTime, 
    showCompletedTasks,
    focusMode,
    soundEnabled,
    vibrationEnabled,
    maxDailyTasks,
    updateSettings 
  } = useSettingsStore();
  
  const { getCurrentStreak, getTotalTasksCompleted, getTotalTimeSpent } = useHistoryStore();
  const { tasks } = useTaskStore();
  const { goals } = useGoalStore();
  
  const currentStreak = getCurrentStreak();
  const totalTasks = getTotalTasksCompleted();
  const totalTime = getTotalTimeSpent();
  
  const handleReminderToggle = (value: boolean) => {
    updateSettings({ reminderEnabled: value });
  };
  
  const handleCompletedTasksToggle = (value: boolean) => {
    updateSettings({ showCompletedTasks: value });
  };
  
  const handleFocusModeToggle = (value: boolean) => {
    updateSettings({ focusMode: value });
  };
  
  const handleSoundToggle = (value: boolean) => {
    updateSettings({ soundEnabled: value });
  };
  
  const handleVibrationToggle = (value: boolean) => {
    updateSettings({ vibrationEnabled: value });
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your data will be saved locally.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => {
          // In a real app, this would handle logout
          Alert.alert('Signed Out', 'You have been signed out successfully.');
        }}
      ]
    );
  };
  
  const SettingItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement,
    showChevron = true 
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIcon}>
        <Icon size={20} color={colors.gray700} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement}
      {showChevron && onPress && (
        <ChevronRight size={20} color={colors.gray400} />
      )}
    </TouchableOpacity>
  );
  
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
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>DF</Text>
        </View>
        <Text style={styles.username}>DoFive User</Text>
        <Text style={styles.tagline}>Focus on what matters most</Text>
      </View>
      
      {/* Quick Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Current Streak"
            value={currentStreak}
            subtitle="days"
            icon={Target}
            color={colors.success}
          />
          <StatCard
            title="Total Tasks"
            value={totalTasks}
            subtitle="completed"
            icon={BarChart3}
            color={colors.primary}
          />
          <StatCard
            title="Time Tracked"
            value={`${Math.round(totalTime / 3600)}h`}
            subtitle="total"
            icon={Clock}
            color={colors.warning}
          />
          <StatCard
            title="Active Goals"
            value={goals.filter(g => !g.isArchived && g.current < g.target).length}
            subtitle="in progress"
            icon={Target}
            color={colors.info}
          />
        </View>
      </View>
      
      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.settingsContainer}>
          <SettingItem
            icon={Bell}
            title="Daily Reminders"
            subtitle="Get reminded to plan your day"
            rightElement={
              <Switch
                value={reminderEnabled}
                onValueChange={handleReminderToggle}
                trackColor={{ false: colors.gray300, true: colors.primaryLight }}
                thumbColor={reminderEnabled ? colors.primary : colors.gray100}
              />
            }
            showChevron={false}
          />
          
          <SettingItem
            icon={Clock}
            title="Reminder Time"
            subtitle={reminderTime}
            onPress={() => {
              // In a real app, this would open a time picker
              Alert.alert('Time Picker', 'Time picker would open here');
            }}
          />
          
          <SettingItem
            icon={Target}
            title="Focus Mode"
            subtitle="Hide distractions while working"
            rightElement={
              <Switch
                value={focusMode}
                onValueChange={handleFocusModeToggle}
                trackColor={{ false: colors.gray300, true: colors.primaryLight }}
                thumbColor={focusMode ? colors.primary : colors.gray100}
              />
            }
            showChevron={false}
          />
          
          <SettingItem
            icon={BarChart3}
            title="Show Completed Tasks"
            subtitle="Display completed tasks in lists"
            rightElement={
              <Switch
                value={showCompletedTasks}
                onValueChange={handleCompletedTasksToggle}
                trackColor={{ false: colors.gray300, true: colors.primaryLight }}
                thumbColor={showCompletedTasks ? colors.primary : colors.gray100}
              />
            }
            showChevron={false}
          />
          
          <SettingItem
            icon={Calendar}
            title="Daily Task Limit"
            subtitle={`Maximum ${maxDailyTasks} tasks per day`}
            onPress={() => {
              // In a real app, this would open a number picker
              Alert.alert('Task Limit', 'Task limit picker would open here');
            }}
          />
        </View>
      </View>
      
      {/* Sound & Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sound & Notifications</Text>
        <View style={styles.settingsContainer}>
          <SettingItem
            icon={Bell}
            title="Sound Effects"
            subtitle="Play sounds for interactions"
            rightElement={
              <Switch
                value={soundEnabled}
                onValueChange={handleSoundToggle}
                trackColor={{ false: colors.gray300, true: colors.primaryLight }}
                thumbColor={soundEnabled ? colors.primary : colors.gray100}
              />
            }
            showChevron={false}
          />
          
          <SettingItem
            icon={Moon}
            title="Vibration"
            subtitle="Haptic feedback for actions"
            rightElement={
              <Switch
                value={vibrationEnabled}
                onValueChange={handleVibrationToggle}
                trackColor={{ false: colors.gray300, true: colors.primaryLight }}
                thumbColor={vibrationEnabled ? colors.primary : colors.gray100}
              />
            }
            showChevron={false}
          />
        </View>
      </View>
      
      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <View style={styles.settingsContainer}>
          <SettingItem
            icon={Settings}
            title="General Settings"
            subtitle="App preferences and configuration"
            onPress={() => router.push('/settings')}
          />
          
          <SettingItem
            icon={Shield}
            title="Privacy & Security"
            subtitle="Data protection and privacy settings"
            onPress={() => {
              Alert.alert('Privacy', 'Privacy settings would open here');
            }}
          />
          
          <SettingItem
            icon={HelpCircle}
            title="Help & Support"
            subtitle="Get help and contact support"
            onPress={() => {
              Alert.alert('Help', 'Help center would open here');
            }}
          />
          
          <SettingItem
            icon={Heart}
            title="Rate DoFive"
            subtitle="Share your feedback"
            onPress={() => {
              Alert.alert('Rate App', 'App store rating would open here');
            }}
          />
        </View>
      </View>
      
      {/* Sign Out */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      
      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>DoFive v1.0.0</Text>
        <Text style={styles.appInfoText}>Made with ❤️ for productivity</Text>
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
    backgroundColor: colors.white,
    padding: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    color: colors.gray600,
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 6,
    marginBottom: 12,
    width: '47%',
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
    fontSize: 18,
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
  section: {
    marginBottom: 24,
  },
  settingsContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 16,
    ...shadows.medium,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.gray600,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    ...shadows.medium,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    padding: 20,
  },
  appInfoText: {
    fontSize: 14,
    color: colors.gray500,
    marginBottom: 4,
  },
});