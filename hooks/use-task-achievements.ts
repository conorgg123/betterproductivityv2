import { useEffect } from 'react';
import { useTaskStore } from '@/store/task-store';
import { useStatsStore } from '@/store/stats-store';
import { useAchievementsStore } from '@/store/achievements-store';
import { QuadrantType } from '@/types/task';

export function useTaskAchievements() {
  const { 
    getTotalTasksCount, 
    getCompletedTasksCount,
    getTasksByQuadrant,
    getCompletedTasksByQuadrant
  } = useTaskStore();
  
  const { 
    dailyStats, 
    streakDays 
  } = useStatsStore();
  
  const { 
    updateAchievementProgress, 
    unlockAchievement,
    addExperience
  } = useAchievementsStore();
  
  // Update achievements based on task completion
  useEffect(() => {
    const completedTasks = getCompletedTasksCount();
    
    // First task achievement
    if (completedTasks > 0) {
      updateAchievementProgress('first-task', 1);
    }
    
    // Task master achievements
    updateAchievementProgress('task-master-20', completedTasks);
    updateAchievementProgress('task-master-50', completedTasks);
    updateAchievementProgress('task-master-100', completedTasks);
    
    // Check for tasks in all quadrants
    const quadrants: QuadrantType[] = ['do', 'schedule', 'delegate', 'eliminate'];
    let quadrantsWithCompletedTasks = 0;
    let quadrantCompletionCounts: Record<QuadrantType, number> = {
      'do': 0,
      'schedule': 0,
      'delegate': 0,
      'eliminate': 0
    };
    
    quadrants.forEach(quadrant => {
      const completedInQuadrant = getCompletedTasksByQuadrant(quadrant).length;
      quadrantCompletionCounts[quadrant] = completedInQuadrant;
      
      if (completedInQuadrant > 0) {
        quadrantsWithCompletedTasks++;
      }
      
      // For important quadrants achievement (do + schedule)
      if (quadrant === 'do' || quadrant === 'schedule') {
        const importantTasksCompleted = 
          quadrantCompletionCounts['do'] + quadrantCompletionCounts['schedule'];
        updateAchievementProgress('important-focus', importantTasksCompleted);
        updateAchievementProgress('important-master', importantTasksCompleted);
      }
      
      // For urgent quadrants achievement (do + delegate)
      if (quadrant === 'do' || quadrant === 'delegate') {
        const urgentTasksCompleted = 
          quadrantCompletionCounts['do'] + quadrantCompletionCounts['delegate'];
        updateAchievementProgress('urgent-handler', urgentTasksCompleted);
      }
      
      // For specific quadrant achievements
      if (quadrant === 'do') {
        updateAchievementProgress('do-quadrant-master', completedInQuadrant);
      } else if (quadrant === 'schedule') {
        updateAchievementProgress('schedule-master', completedInQuadrant);
      } else if (quadrant === 'delegate') {
        updateAchievementProgress('delegate-pro', completedInQuadrant);
      } else if (quadrant === 'eliminate') {
        updateAchievementProgress('elimination-expert', completedInQuadrant);
      }
    });
    
    // All quadrants achievement
    updateAchievementProgress('all-quadrants', quadrantsWithCompletedTasks);
    
    // Check for quadrant balance (at least 5 in each)
    const hasQuadrantBalance = Object.values(quadrantCompletionCounts).every(count => count >= 5);
    if (hasQuadrantBalance) {
      updateAchievementProgress('quadrant-balance', 5);
    }
    
    // Streak achievements
    if (streakDays >= 3) {
      updateAchievementProgress('task-streak-3', 3);
    }
    
    if (streakDays >= 7) {
      updateAchievementProgress('task-streak-7', 7);
    }
    
    if (streakDays >= 14) {
      updateAchievementProgress('task-streak-14', 14);
    }
    
    if (streakDays >= 30) {
      updateAchievementProgress('task-streak-30', 30);
    }
    
    // Check for efficiency expert (5 tasks in a day) and productivity machine (10 tasks in a day)
    const today = new Date().toISOString().split('T')[0];
    const todayStats = dailyStats.find(stats => stats.date === today);
    
    if (todayStats) {
      if (todayStats.completedTasks >= 5) {
        updateAchievementProgress('efficiency-expert', 5);
      }
      
      if (todayStats.completedTasks >= 10) {
        updateAchievementProgress('productivity-machine', 10);
      }
      
      // Check for balanced day (at least one task in each quadrant in a single day)
      const quadrantsCompletedToday = Object.values(todayStats.quadrantCompletion || {}).filter(Boolean).length;
      if (quadrantsCompletedToday >= 4) {
        updateAchievementProgress('balanced-day', 1);
      }
    }
    
    // Time-based achievements
    const currentHour = new Date().getHours();
    if (currentHour < 9) {
      // Morning person achievement
      updateAchievementProgress('morning-person', 1);
    } else if (currentHour >= 21) {
      // Night owl achievement
      updateAchievementProgress('night-owl', 1);
    }
    
    // Weekend warrior achievement
    const currentDay = new Date().getDay();
    if (currentDay === 0 || currentDay === 6) { // 0 is Sunday, 6 is Saturday
      const weekendStats = dailyStats.filter(stats => {
        const statsDate = new Date(stats.date);
        const day = statsDate.getDay();
        return (day === 0 || day === 6) && stats.completedTasks > 0;
      });
      
      const uniqueWeekendDays = new Set(weekendStats.map(stats => {
        const statsDate = new Date(stats.date);
        return statsDate.getDay();
      }));
      
      if (uniqueWeekendDays.size >= 2) {
        updateAchievementProgress('weekend-warrior', 2);
      }
    }
    
  }, [getCompletedTasksCount, streakDays, dailyStats]);
  
  return {
    addExperienceForTaskCompletion: () => {
      // Add experience when a task is completed
      addExperience(10);
    }
  };
}