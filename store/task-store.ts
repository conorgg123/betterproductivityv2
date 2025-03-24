import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, QuadrantType, RepeatType } from '@/types/task';
import { useStatsStore } from './stats-store';
import { useAchievementsStore } from './achievements-store';

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  moveTask: (id: string, quadrant: QuadrantType) => void;
  getTasksByQuadrant: (quadrant: QuadrantType) => Task[];
  getTaskById: (id: string) => Task | undefined;
  getAllTasks: () => Task[];
  getCompletedTasksCount: () => number;
  getTotalTasksCount: () => number;
  getCompletionRate: () => number;
  createRecurringTask: (taskId: string) => void;
  getRecurringTasks: () => Task[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      
      addTask: (taskData) => {
        // Ensure quadrant is defined, default to 'do' if not
        const quadrant = taskData.quadrant || 'do';
        
        const newTask: Task = {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          completed: false,
          quadrant, // Use the validated quadrant
          ...taskData
        };
        
        set(state => ({
          tasks: [...state.tasks, newTask]
        }));
        
        try {
          // Record stats
          const statsStore = useStatsStore.getState();
          if (statsStore && typeof statsStore.recordTaskAddition === 'function') {
            statsStore.recordTaskAddition(quadrant);
            statsStore.updateStreak();
          }
          
          // Update achievements
          const achievementsStore = useAchievementsStore.getState();
          if (achievementsStore && typeof achievementsStore.updateAchievementProgress === 'function') {
            achievementsStore.updateAchievementProgress('tasks-added-1', 1);
            achievementsStore.updateAchievementProgress('tasks-added-10', 1);
            achievementsStore.updateAchievementProgress('tasks-added-50', 1);
            achievementsStore.updateAchievementProgress('tasks-added-100', 1);
            
            // Quadrant-specific achievements
            if (quadrant === 'do') {
              achievementsStore.updateAchievementProgress('do-tasks-added-5', 1);
            } else if (quadrant === 'schedule') {
              achievementsStore.updateAchievementProgress('schedule-tasks-added-5', 1);
            } else if (quadrant === 'delegate') {
              achievementsStore.updateAchievementProgress('delegate-tasks-added-5', 1);
            } else if (quadrant === 'eliminate') {
              achievementsStore.updateAchievementProgress('eliminate-tasks-added-5', 1);
            }
            
            // Add XP for adding a task
            if (typeof achievementsStore.addExperience === 'function') {
              achievementsStore.addExperience(5);
            }
          }
        } catch (error) {
          console.error('Error updating stats or achievements:', error);
        }
      },
      
      updateTask: (id, updates) => {
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === id ? { ...task, ...updates } : task
          )
        }));
      },
      
      deleteTask: (id) => {
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== id)
        }));
      },
      
      toggleTaskCompletion: (id) => {
        const task = get().tasks.find(t => t.id === id);
        if (!task) return;
        
        const wasCompleted = task.completed;
        const quadrant = task.quadrant || 'do'; // Ensure quadrant is defined
        
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
          )
        }));
        
        // Only record completion if task is being marked as completed
        if (!wasCompleted) {
          try {
            // Record stats
            const statsStore = useStatsStore.getState();
            if (statsStore && typeof statsStore.recordTaskCompletion === 'function') {
              statsStore.recordTaskCompletion(quadrant);
              statsStore.updateStreak();
            }
            
            // Update achievements
            const achievementsStore = useAchievementsStore.getState();
            if (achievementsStore && typeof achievementsStore.updateAchievementProgress === 'function') {
              achievementsStore.updateAchievementProgress('tasks-completed-1', 1);
              achievementsStore.updateAchievementProgress('tasks-completed-10', 1);
              achievementsStore.updateAchievementProgress('tasks-completed-50', 1);
              achievementsStore.updateAchievementProgress('tasks-completed-100', 1);
              
              // Add XP for completing a task
              if (typeof achievementsStore.addExperience === 'function') {
                achievementsStore.addExperience(10);
              }
              
              // Quadrant-specific achievements
              if (quadrant === 'do') {
                achievementsStore.updateAchievementProgress('do-tasks-completed-5', 1);
              } else if (quadrant === 'schedule') {
                achievementsStore.updateAchievementProgress('schedule-tasks-completed-5', 1);
              } else if (quadrant === 'delegate') {
                achievementsStore.updateAchievementProgress('delegate-tasks-completed-5', 1);
              } else if (quadrant === 'eliminate') {
                achievementsStore.updateAchievementProgress('eliminate-tasks-completed-5', 1);
              }
            }
            
            // If this is a recurring task, create the next instance
            if (task.repeat && task.repeat !== 'none') {
              get().createRecurringTask(id);
            }
          } catch (error) {
            console.error('Error updating stats or achievements:', error);
          }
        }
      },
      
      moveTask: (id, quadrant) => {
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === id ? { ...task, quadrant } : task
          )
        }));
      },
      
      getTasksByQuadrant: (quadrant) => {
        if (!quadrant) return [];
        return get().tasks.filter(task => task.quadrant === quadrant);
      },
      
      getTaskById: (id) => {
        return get().tasks.find(task => task.id === id);
      },
      
      getAllTasks: () => {
        return get().tasks;
      },
      
      getCompletedTasksCount: () => {
        return get().tasks.filter(task => task.completed).length;
      },
      
      getTotalTasksCount: () => {
        return get().tasks.length;
      },
      
      getCompletionRate: () => {
        const total = get().tasks.length;
        const completed = get().tasks.filter(task => task.completed).length;
        return total > 0 ? (completed / total) * 100 : 0;
      },
      
      createRecurringTask: (taskId) => {
        const originalTask = get().tasks.find(t => t.id === taskId);
        if (!originalTask || !originalTask.repeat || originalTask.repeat === 'none') return;
        
        // Calculate the next due date based on the repeat type
        let nextDueDate: number | undefined = undefined;
        
        if (originalTask.dueDate) {
          const dueDate = new Date(originalTask.dueDate);
          
          switch (originalTask.repeat) {
            case 'daily':
              dueDate.setDate(dueDate.getDate() + 1);
              nextDueDate = dueDate.getTime();
              break;
            case 'weekly':
              dueDate.setDate(dueDate.getDate() + 7);
              nextDueDate = dueDate.getTime();
              break;
            case 'monthly':
              dueDate.setMonth(dueDate.getMonth() + 1);
              nextDueDate = dueDate.getTime();
              break;
          }
        } else {
          // If no due date, set one based on current date
          const now = new Date();
          
          switch (originalTask.repeat) {
            case 'daily':
              now.setDate(now.getDate() + 1);
              nextDueDate = now.getTime();
              break;
            case 'weekly':
              now.setDate(now.getDate() + 7);
              nextDueDate = now.getTime();
              break;
            case 'monthly':
              now.setMonth(now.getMonth() + 1);
              nextDueDate = now.getTime();
              break;
          }
        }
        
        // Create a new task based on the original
        const newTask: Omit<Task, 'id' | 'createdAt' | 'completed'> = {
          title: originalTask.title,
          description: originalTask.description,
          quadrant: originalTask.quadrant,
          dueDate: nextDueDate,
          estimatedTime: originalTask.estimatedTime,
          assignedTo: originalTask.assignedTo,
          repeat: originalTask.repeat,
          preferredStartTime: originalTask.preferredStartTime,
          preferredEndTime: originalTask.preferredEndTime,
        };
        
        // Add the new recurring task
        get().addTask(newTask);
      },
      
      getRecurringTasks: () => {
        return get().tasks.filter(task => task.repeat && task.repeat !== 'none');
      }
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);