import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { Bell, Clock, HelpCircle, Moon, Settings } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useSettingsStore } from '@/store/settingsStore';

export default function ProfileScreen() {
  const { 
    theme, 
    reminderEnabled, 
    reminderTime, 
    weekStartsOn, 
    showCompletedTasks,
    updateSettings 
  } = useSettingsStore();
  
  const handleReminderToggle = (value: boolean) => {
    updateSettings({ reminderEnabled: value });
  };
  
  const handleCompletedTasksToggle = (value: boolean) => {
    updateSettings({ showCompletedTasks: value });
  };
  
  const getWeekStartDay = () => {
    switch (weekStartsOn) {
      case 0:
        return 'Sunday';
      case 1:
        return 'Monday';
      case 6:
        return 'Saturday';
      default:
        return 'Monday';
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>DF</Text>
        </View>
        <Text style={styles.username}>DoFive User</Text>
        <Text style={styles.tagline}>Focus on what matters most</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Bell size={20} color={colors.gray700} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Daily Reminder</Text>
            <Text style={styles.settingDescription}>
              Remind me to plan my tasks
            </Text>
          </View>
          <Switch
            value={reminderEnabled}
            onValueChange={handleReminderToggle}
            trackColor={{ false: colors.gray300, true: colors.primaryLight }}
            thumbColor={reminderEnabled ? colors.primary : colors.gray100}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Clock size={20} color={colors.gray700} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Reminder Time</Text>
            <Text style={styles.settingDescription}>
              {reminderTime}
            </Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.settingButton,
              { opacity: reminderEnabled ? 1 : 0.5 }
            ]}
            disabled={!reminderEnabled}
          >
            <Text style={styles.settingButtonText}>Change</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Settings size={20} color={colors.gray700} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Week Starts On</Text>
            <Text style={styles.settingDescription}>
              {getWeekStartDay()}
            </Text>
          </View>
          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Change</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Moon size={20} color={colors.gray700} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Dark Mode</Text>
            <Text style={styles.settingDescription}>
              Coming soon
            </Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={() => {}}
            disabled={true}
            trackColor={{ false: colors.gray300, true: colors.primaryLight }}
            thumbColor={theme === 'dark' ? colors.primary : colors.gray100}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <HelpCircle size={20} color={colors.gray700} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Show Completed Tasks</Text>
            <Text style={styles.settingDescription}>
              Display completed tasks in lists
            </Text>
          </View>
          <Switch
            value={showCompletedTasks}
            onValueChange={handleCompletedTasksToggle}
            trackColor={{ false: colors.gray300, true: colors.primaryLight }}
            thumbColor={showCompletedTasks ? colors.primary : colors.gray100}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity style={styles.aboutItem}>
          <Text style={styles.aboutText}>How DoFive Works</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.aboutItem}>
          <Text style={styles.aboutText}>Privacy Policy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.aboutItem}>
          <Text style={styles.aboutText}>Terms of Service</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.aboutItem, styles.noBorder]}>
          <Text style={styles.aboutText}>Version 1.0.0</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
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
    padding: 24,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: colors.gray600,
  },
  section: {
    backgroundColor: colors.white,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gray200,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
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
    fontWeight: '500',
    color: colors.gray800,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.gray600,
    marginTop: 2,
  },
  settingButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.gray100,
  },
  settingButtonText: {
    fontSize: 14,
    color: colors.gray700,
  },
  aboutItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  aboutText: {
    fontSize: 16,
    color: colors.gray800,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  logoutButton: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.gray200,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.error,
  },
});