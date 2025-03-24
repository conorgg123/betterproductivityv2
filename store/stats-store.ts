import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuadrantType } from '@/types/task';
import { useAchievementsStore } from './achievements-store';

interface DailyStats {
  date: string; // ISO date string (YYYY-MM-DD)
  addedTasks: number;
  completedTasks: number;
  quadrantAddition: Record<QuadrantType, number>;
  quadrantCompletion: Record<QuadrantType, number>;
}

interface StatsState {
  dailyStats: DailyStats[];
  lastActiveDate: string | null;
  streakDays: number;
  
  recordTaskAddition: (quadrant: QuadrantType) => void;
  recordTaskCompletion: (quadrant: QuadrantType) => void;
  updateStreak: () => void;
  getCompletionRateByQuadrant: (quadrant: QuadrantType) => number;
  getTotalCompletedTasks: () => number;
  getTodayStats: () => DailyStats | undefined;
  getWeekStats: () => DailyStats[];
  getMonthStats: () => DailyStats[];
}

// Helper to get today's date as YYYY-MM-DD
const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

// Helper to get or create today's stats
const getOrCreateTodayStats = (dailyStats: DailyStats[]): [DailyStats[], DailyStats] => {
  const today = getTodayDateString();
  const todayStats = dailyStats.find(stats => stats.date === today);
  
  if (todayStats) {
    return [dailyStats, todayStats];
  }
  
  const newTodayStats: DailyStats = {
    date: today,
    addedTasks: 0,
    completedTasks: 0,
    quadrantAddition: {
      do: 0,
      schedule: 0,
      delegate: 0,
      eliminate: 0
    },
    quadrantCompletion: {
      do: 0,
      schedule: 0,
      delegate: 0,
      eliminate: 0
    }
  };
  
  return [[...dailyStats, newTodayStats], newTodayStats];
};

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      dailyStats: [],
      lastActiveDate: null,
      streakDays: 0,
      
      recordTaskAddition: (quadrant) => {
        set(state => {
          const [updatedStats, todayStats] = getOrCreateTodayStats(state.dailyStats);
          const statsIndex = updatedStats.findIndex(s => s.date === todayStats.date);
          
          const updatedTodayStats = {
            ...todayStats,
            addedTasks: todayStats.addedTasks + 1,
            quadrantAddition: {
              ...todayStats.quadrantAddition,
              [quadrant]: (todayStats.quadrantAddition[quadrant] || 0) + 1
            }
          };
          
          updatedStats[statsIndex] = updatedTodayStats;
          
          return {
            dailyStats: updatedStats,
            lastActiveDate: getTodayDateString()
          };
        });
      },
      
      recordTaskCompletion: (quadrant) => {
        set(state => {
          const [updatedStats, todayStats] = getOrCreateTodayStats(state.dailyStats);
          const statsIndex = updatedStats.findIndex(s => s.date === todayStats.date);
          
          const updatedTodayStats = {
            ...todayStats,
            completedTasks: todayStats.completedTasks + 1,
            quadrantCompletion: {
              ...todayStats.quadrantCompletion,
              [quadrant]: (todayStats.quadrantCompletion[quadrant] || 0) + 1
            }
          };
          
          updatedStats[statsIndex] = updatedTodayStats;
          
          return {
            dailyStats: updatedStats,
            lastActiveDate: getTodayDateString()
          };
        });
      },
      
      updateStreak: () => {
        set(state => {
          const today = getTodayDateString();
          
          // If this is the first activity, start streak at 1
          if (!state.lastActiveDate) {
            return { streakDays: 1, lastActiveDate: today };
          }
          
          // If already active today, no change
          if (state.lastActiveDate === today) {
            return state;
          }
          
          // Check if the last active date was yesterday
          const lastActiveDate = new Date(state.lastActiveDate);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          const isConsecutive = 
            lastActiveDate.getDate() === yesterday.getDate() &&
            lastActiveDate.getMonth() === yesterday.getMonth() &&
            lastActiveDate.getFullYear() === yesterday.getFullYear();
          
          // If consecutive, increment streak, otherwise reset to 1
          const newStreakDays = isConsecutive ? state.streakDays + 1 : 1;
          
          // Update achievements based on streak
          const achievementsStore = useAchievementsStore.getState();
          if (newStreakDays >= 3) {
            achievementsStore.updateAchievementProgress('task-streak-3', 3);
          }
          if (newStreakDays >= 7) {
            achievementsStore.updateAchievementProgress('task-streak-7', 7);
          }
          if (newStreakDays >= 14) {
            achievementsStore.updateAchievementProgress('task-streak-14', 14);
          }
          if (newStreakDays >= 30) {
            achievementsStore.updateAchievementProgress('task-streak-30', 30);
          }
          
          return { 
            streakDays: newStreakDays, 
            lastActiveDate: today 
          };
        });
      },
      
      getCompletionRateByQuadrant: (quadrant) => {
        const stats = get().dailyStats;
        
        const totalAdded = stats.reduce((sum, day) => 
          sum + (day.quadrantAddition[quadrant] || 0), 0);
          
        const totalCompleted = stats.reduce((sum, day) => 
          sum + (day.quadrantCompletion[quadrant] || 0), 0);
          
        return totalAdded > 0 ? (totalCompleted / totalAdded) * 100 : 0;
      },
      
      getTotalCompletedTasks: () => {
        return get().dailyStats.reduce((sum, day) => sum + day.completedTasks, 0);
      },
      
      getTodayStats: () => {
        const today = getTodayDateString();
        return get().dailyStats.find(stats => stats.date === today);
      },
      
      getWeekStats: () => {
        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        
        return get().dailyStats.filter(stats => {
          const statsDate = new Date(stats.date);
          return statsDate >= oneWeekAgo && statsDate <= today;
        });
      },
      
      getMonthStats: () => {
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);
        
        return get().dailyStats.filter(stats => {
          const statsDate = new Date(stats.date);
          return statsDate >= oneMonthAgo && statsDate <= today;
        });
      }
    }),
    {
      name: 'stats-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);