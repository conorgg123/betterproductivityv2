import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '@/types/task';
import { useTaskStore } from './task-store';

export interface ScheduledTask {
  taskId: string;
  startTime: number; // minutes from midnight
  duration: number; // minutes
  date: string; // ISO date string (YYYY-MM-DD)
  isRecurring?: boolean;
}

interface FlowState {
  scheduledTasks: ScheduledTask[];
  selectedDate: string; // ISO date string (YYYY-MM-DD)
  
  // Actions
  addTaskToSchedule: (taskId: string, startTime: number, duration: number) => void;
  updateScheduledTask: (taskId: string, updates: Partial<Omit<ScheduledTask, 'taskId'>>) => void;
  removeTaskFromSchedule: (taskId: string) => void;
  clearSchedule: () => void;
  setSelectedDate: (date: string) => void;
  getScheduledTasksForDate: (date: string) => ScheduledTask[];
  isTaskScheduled: (taskId: string) => boolean;
  generateRecurringSchedule: () => void;
}

export const useFlowStore = create<FlowState>()(
  persist(
    (set, get) => ({
      scheduledTasks: [],
      selectedDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      
      addTaskToSchedule: (taskId, startTime, duration) => {
        const date = get().selectedDate;
        
        // Check if task is already scheduled for this date
        const existingIndex = get().scheduledTasks.findIndex(
          st => st.taskId === taskId && st.date === date
        );
        
        // Get the task to check if it's recurring
        const task = useTaskStore.getState().getTaskById(taskId);
        const isRecurring = task?.repeat && task.repeat !== 'none';
        
        if (existingIndex >= 0) {
          // Update existing scheduled task
          set(state => ({
            scheduledTasks: state.scheduledTasks.map((st, index) => 
              index === existingIndex ? { taskId, startTime, duration, date, isRecurring } : st
            )
          }));
        } else {
          // Add new scheduled task
          set(state => ({
            scheduledTasks: [...state.scheduledTasks, { taskId, startTime, duration, date, isRecurring }]
          }));
        }
      },
      
      updateScheduledTask: (taskId, updates) => {
        const date = get().selectedDate;
        
        set(state => ({
          scheduledTasks: state.scheduledTasks.map(st => 
            st.taskId === taskId && st.date === date ? { ...st, ...updates } : st
          )
        }));
      },
      
      removeTaskFromSchedule: (taskId) => {
        const date = get().selectedDate;
        
        set(state => ({
          scheduledTasks: state.scheduledTasks.filter(st => !(st.taskId === taskId && st.date === date))
        }));
      },
      
      clearSchedule: () => {
        const date = get().selectedDate;
        
        set(state => ({
          scheduledTasks: state.scheduledTasks.filter(st => st.date !== date)
        }));
      },
      
      setSelectedDate: (date) => {
        set({ selectedDate: date });
        
        // When changing date, check if we need to generate recurring tasks
        setTimeout(() => {
          get().generateRecurringSchedule();
        }, 0);
      },
      
      getScheduledTasksForDate: (date) => {
        return get().scheduledTasks.filter(st => st.date === date);
      },
      
      isTaskScheduled: (taskId) => {
        const date = get().selectedDate;
        return get().scheduledTasks.some(st => st.taskId === taskId && st.date === date);
      },
      
      generateRecurringSchedule: () => {
        const date = get().selectedDate;
        const taskStore = useTaskStore.getState();
        const recurringTasks = taskStore.getRecurringTasks();
        
        // For each recurring task, check if it should be scheduled on this date
        recurringTasks.forEach(task => {
          // Skip if task is already scheduled for this date
          if (get().scheduledTasks.some(st => st.taskId === task.id && st.date === date)) {
            return;
          }
          
          // Check if the task has preferred time settings
          if (task.preferredStartTime !== undefined && task.estimatedTime) {
            // Auto-schedule the task at its preferred time
            get().addTaskToSchedule(
              task.id, 
              task.preferredStartTime, 
              task.estimatedTime
            );
          }
        });
      }
    }),
    {
      name: 'flow-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);