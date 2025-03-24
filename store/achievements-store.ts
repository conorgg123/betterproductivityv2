import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuadrantType } from '@/types/task';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: number | null;
  progress: number;
  target: number;
  category: 'productivity' | 'consistency' | 'balance' | 'mastery' | 'special';
  experienceReward: number; // XP reward when unlocked
}

interface AchievementsState {
  achievements: Achievement[];
  level: number;
  experience: number;
  experienceToNextLevel: number;
  
  unlockAchievement: (id: string) => void;
  updateAchievementProgress: (id: string, progress: number) => void;
  addExperience: (amount: number) => void;
  getUnlockedAchievements: () => Achievement[];
  getInProgressAchievements: () => Achievement[];
  getAchievementsByCategory: (category: Achievement['category']) => Achievement[];
}

// Experience required for each level (increases with each level)
const getExperienceForLevel = (level: number) => 100 * Math.pow(1.5, level - 1);

// Initial achievements
const initialAchievements: Achievement[] = [
  // Productivity Category
  {
    id: 'first-task',
    title: 'First Step',
    description: 'Complete your first task',
    icon: 'check-circle',
    unlockedAt: null,
    progress: 0,
    target: 1,
    category: 'productivity',
    experienceReward: 50
  },
  {
    id: 'task-master-20',
    title: 'Task Master',
    description: 'Complete 20 tasks total',
    icon: 'award',
    unlockedAt: null,
    progress: 0,
    target: 20,
    category: 'productivity',
    experienceReward: 100
  },
  {
    id: 'task-master-50',
    title: 'Task Virtuoso',
    description: 'Complete 50 tasks total',
    icon: 'award',
    unlockedAt: null,
    progress: 0,
    target: 50,
    category: 'productivity',
    experienceReward: 200
  },
  {
    id: 'task-master-100',
    title: 'Task Legend',
    description: 'Complete 100 tasks total',
    icon: 'award',
    unlockedAt: null,
    progress: 0,
    target: 100,
    category: 'productivity',
    experienceReward: 500
  },
  {
    id: 'efficiency-expert',
    title: 'Efficiency Expert',
    description: 'Complete 5 tasks in a single day',
    icon: 'zap',
    unlockedAt: null,
    progress: 0,
    target: 5,
    category: 'productivity',
    experienceReward: 100
  },
  {
    id: 'productivity-machine',
    title: 'Productivity Machine',
    description: 'Complete 10 tasks in a single day',
    icon: 'zap',
    unlockedAt: null,
    progress: 0,
    target: 10,
    category: 'productivity',
    experienceReward: 250
  },
  {
    id: 'weekend-warrior',
    title: 'Weekend Warrior',
    description: 'Complete tasks on both Saturday and Sunday',
    icon: 'calendar',
    unlockedAt: null,
    progress: 0,
    target: 2,
    category: 'productivity',
    experienceReward: 75
  },
  
  // Consistency Category
  {
    id: 'task-streak-3',
    title: 'Momentum',
    description: 'Complete tasks 3 days in a row',
    icon: 'flame',
    unlockedAt: null,
    progress: 0,
    target: 3,
    category: 'consistency',
    experienceReward: 75
  },
  {
    id: 'task-streak-7',
    title: 'Habit Forming',
    description: 'Complete tasks 7 days in a row',
    icon: 'flame',
    unlockedAt: null,
    progress: 0,
    target: 7,
    category: 'consistency',
    experienceReward: 150
  },
  {
    id: 'task-streak-14',
    title: 'Consistency King',
    description: 'Complete tasks 14 days in a row',
    icon: 'flame',
    unlockedAt: null,
    progress: 0,
    target: 14,
    category: 'consistency',
    experienceReward: 300
  },
  {
    id: 'task-streak-30',
    title: 'Unstoppable',
    description: 'Complete tasks 30 days in a row',
    icon: 'flame',
    unlockedAt: null,
    progress: 0,
    target: 30,
    category: 'consistency',
    experienceReward: 500
  },
  {
    id: 'morning-person',
    title: 'Morning Person',
    description: 'Complete tasks before 9 AM',
    icon: 'sun',
    unlockedAt: null,
    progress: 0,
    target: 5,
    category: 'consistency',
    experienceReward: 100
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'Complete tasks after 9 PM',
    icon: 'moon',
    unlockedAt: null,
    progress: 0,
    target: 5,
    category: 'consistency',
    experienceReward: 100
  },
  
  // Balance Category
  {
    id: 'all-quadrants',
    title: 'Matrix Master',
    description: 'Complete tasks in all four quadrants',
    icon: 'grid',
    unlockedAt: null,
    progress: 0,
    target: 4,
    category: 'balance',
    experienceReward: 100
  },
  {
    id: 'balanced-day',
    title: 'Balanced Day',
    description: 'Complete at least one task in each quadrant in a single day',
    icon: 'scale',
    unlockedAt: null,
    progress: 0,
    target: 1,
    category: 'balance',
    experienceReward: 150
  },
  {
    id: 'quadrant-balance',
    title: 'Quadrant Balance',
    description: 'Have at least 5 completed tasks in each quadrant',
    icon: 'grid',
    unlockedAt: null,
    progress: 0,
    target: 5,
    category: 'balance',
    experienceReward: 200
  },
  {
    id: 'elimination-expert',
    title: 'Elimination Expert',
    description: 'Complete 10 tasks in the Eliminate quadrant',
    icon: 'trash',
    unlockedAt: null,
    progress: 0,
    target: 10,
    category: 'balance',
    experienceReward: 75
  },
  
  // Mastery Category
  {
    id: 'important-focus',
    title: 'Priority Focus',
    description: 'Complete 10 tasks in important quadrants',
    icon: 'target',
    unlockedAt: null,
    progress: 0,
    target: 10,
    category: 'mastery',
    experienceReward: 100
  },
  {
    id: 'important-master',
    title: 'Priority Master',
    description: 'Complete 25 tasks in important quadrants',
    icon: 'target',
    unlockedAt: null,
    progress: 0,
    target: 25,
    category: 'mastery',
    experienceReward: 200
  },
  {
    id: 'delegate-pro',
    title: 'Delegation Pro',
    description: 'Delegate 10 tasks',
    icon: 'users',
    unlockedAt: null,
    progress: 0,
    target: 10,
    category: 'mastery',
    experienceReward: 100
  },
  {
    id: 'urgent-handler',
    title: 'Urgent Handler',
    description: 'Complete 15 tasks in urgent quadrants',
    icon: 'alarm-clock',
    unlockedAt: null,
    progress: 0,
    target: 15,
    category: 'mastery',
    experienceReward: 100
  },
  {
    id: 'do-quadrant-master',
    title: 'Do Quadrant Master',
    description: 'Complete 20 tasks in the Do quadrant',
    icon: 'check-square',
    unlockedAt: null,
    progress: 0,
    target: 20,
    category: 'mastery',
    experienceReward: 150
  },
  {
    id: 'schedule-master',
    title: 'Schedule Master',
    description: 'Complete 20 tasks in the Schedule quadrant',
    icon: 'calendar',
    unlockedAt: null,
    progress: 0,
    target: 20,
    category: 'mastery',
    experienceReward: 150
  },
  
  // Special Category
  {
    id: 'early-adopter',
    title: 'Early Adopter',
    description: 'Use the app within the first month of release',
    icon: 'star',
    unlockedAt: null,
    progress: 0,
    target: 1,
    category: 'special',
    experienceReward: 50
  },
  {
    id: 'customization-fan',
    title: 'Customization Fan',
    description: 'Change app theme or settings',
    icon: 'palette',
    unlockedAt: null,
    progress: 0,
    target: 1,
    category: 'special',
    experienceReward: 25
  },
  {
    id: 'achievement-hunter',
    title: 'Achievement Hunter',
    description: 'Unlock 10 different achievements',
    icon: 'trophy',
    unlockedAt: null,
    progress: 0,
    target: 10,
    category: 'special',
    experienceReward: 200
  },
  {
    id: 'level-up-5',
    title: 'Rising Star',
    description: 'Reach level 5',
    icon: 'trending-up',
    unlockedAt: null,
    progress: 0,
    target: 5,
    category: 'special',
    experienceReward: 100
  },
  {
    id: 'level-up-10',
    title: 'Matrix Expert',
    description: 'Reach level 10',
    icon: 'trending-up',
    unlockedAt: null,
    progress: 0,
    target: 10,
    category: 'special',
    experienceReward: 250
  }
];

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      achievements: initialAchievements,
      level: 1,
      experience: 0,
      experienceToNextLevel: getExperienceForLevel(1),
      
      unlockAchievement: (id) => set((state) => {
        const achievementIndex = state.achievements.findIndex(a => a.id === id);
        if (achievementIndex === -1 || state.achievements[achievementIndex].unlockedAt !== null) {
          return state;
        }
        
        const achievement = state.achievements[achievementIndex];
        const newAchievements = [...state.achievements];
        newAchievements[achievementIndex] = {
          ...achievement,
          unlockedAt: Date.now(),
          progress: achievement.target
        };
        
        // Award experience for unlocking an achievement
        const experienceGain = achievement.experienceReward;
        const { level, experience, experienceToNextLevel } = calculateLevelAndExperience(
          state.level, 
          state.experience + experienceGain, 
          state.experienceToNextLevel
        );
        
        // Check if we should unlock the level-up achievements
        if (level >= 5) {
          const levelAchievementIndex = state.achievements.findIndex(a => a.id === 'level-up-5');
          if (levelAchievementIndex !== -1 && newAchievements[levelAchievementIndex].unlockedAt === null) {
            newAchievements[levelAchievementIndex] = {
              ...newAchievements[levelAchievementIndex],
              unlockedAt: Date.now(),
              progress: newAchievements[levelAchievementIndex].target
            };
          }
        }
        
        if (level >= 10) {
          const levelAchievementIndex = state.achievements.findIndex(a => a.id === 'level-up-10');
          if (levelAchievementIndex !== -1 && newAchievements[levelAchievementIndex].unlockedAt === null) {
            newAchievements[levelAchievementIndex] = {
              ...newAchievements[levelAchievementIndex],
              unlockedAt: Date.now(),
              progress: newAchievements[levelAchievementIndex].target
            };
          }
        }
        
        // Check if we should unlock the achievement hunter achievement
        const unlockedCount = newAchievements.filter(a => a.unlockedAt !== null).length;
        if (unlockedCount >= 10) {
          const hunterAchievementIndex = state.achievements.findIndex(a => a.id === 'achievement-hunter');
          if (hunterAchievementIndex !== -1 && newAchievements[hunterAchievementIndex].unlockedAt === null) {
            newAchievements[hunterAchievementIndex] = {
              ...newAchievements[hunterAchievementIndex],
              unlockedAt: Date.now(),
              progress: newAchievements[hunterAchievementIndex].target
            };
          }
        }
        
        return { 
          achievements: newAchievements,
          level,
          experience,
          experienceToNextLevel
        };
      }),
      
      updateAchievementProgress: (id, progress) => set((state) => {
        const achievementIndex = state.achievements.findIndex(a => a.id === id);
        if (achievementIndex === -1 || state.achievements[achievementIndex].unlockedAt !== null) {
          return state;
        }
        
        const achievement = state.achievements[achievementIndex];
        const newProgress = Math.min(progress, achievement.target);
        
        // If the achievement is now complete, unlock it
        if (newProgress >= achievement.target) {
          return get().unlockAchievement(id);
        }
        
        const newAchievements = [...state.achievements];
        newAchievements[achievementIndex] = {
          ...achievement,
          progress: newProgress
        };
        
        return { achievements: newAchievements };
      }),
      
      addExperience: (amount) => set((state) => {
        const { level, experience, experienceToNextLevel } = calculateLevelAndExperience(
          state.level, 
          state.experience + amount, 
          state.experienceToNextLevel
        );
        
        // Check if we should update level-up achievements
        if (level !== state.level) {
          // We've leveled up, so check if we need to unlock level achievements
          setTimeout(() => {
            if (level >= 5) {
              get().updateAchievementProgress('level-up-5', level);
            }
            if (level >= 10) {
              get().updateAchievementProgress('level-up-10', level);
            }
          }, 0);
        }
        
        return { level, experience, experienceToNextLevel };
      }),
      
      getUnlockedAchievements: () => {
        return get().achievements.filter(a => a.unlockedAt !== null);
      },
      
      getInProgressAchievements: () => {
        return get().achievements.filter(a => a.unlockedAt === null && a.progress > 0);
      },
      
      getAchievementsByCategory: (category) => {
        return get().achievements.filter(a => a.category === category);
      }
    }),
    {
      name: 'achievements-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper function to calculate level and experience
function calculateLevelAndExperience(currentLevel: number, newExperience: number, currentExpToNextLevel: number) {
  let level = currentLevel;
  let experience = newExperience;
  let experienceToNextLevel = currentExpToNextLevel;
  
  // Check if we've leveled up
  while (experience >= experienceToNextLevel) {
    experience -= experienceToNextLevel;
    level += 1;
    experienceToNextLevel = getExperienceForLevel(level);
  }
  
  return { level, experience, experienceToNextLevel };
}