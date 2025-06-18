import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from '@/types';

interface SettingsState extends Settings {
  updateSettings: (settings: Partial<Settings>) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  theme: 'system',
  reminderEnabled: true,
  reminderTime: '09:00',
  weekStartsOn: 1, // Monday
  showCompletedTasks: true,
  focusMode: false,
  soundEnabled: true,
  vibrationEnabled: true,
  maxDailyTasks: 5,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      
      updateSettings: (settings) => {
        set((state) => ({
          ...state,
          ...settings,
        }));
      },
      
      resetSettings: () => {
        set(defaultSettings);
      },
    }),
    {
      name: 'dofive-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);