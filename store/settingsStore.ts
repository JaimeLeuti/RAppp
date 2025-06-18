import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from '@/types';

interface SettingsState extends Settings {
  updateSettings: (settings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  theme: 'light',
  reminderEnabled: false,
  reminderTime: '20:00',
  weekStartsOn: 1, // Monday
  showCompletedTasks: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      
      updateSettings: (settings) => {
        set((state) => ({
          ...state,
          ...settings,
        }));
      },
    }),
    {
      name: 'dofive-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);