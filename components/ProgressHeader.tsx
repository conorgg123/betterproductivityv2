import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTaskStore } from '@/store/task-store';
import { useStatsStore } from '@/store/stats-store';
import { useColors } from '@/constants/colors';

export default function ProgressHeader() {
  const { getCompletedTasksCount, getTotalTasksCount, getCompletionRate } = useTaskStore();
  const { streakDays } = useStatsStore();
  const colors = useColors();
  
  const completedTasks = getCompletedTasksCount();
  const totalTasks = getTotalTasksCount();
  const completionRate = getCompletionRate();
  
  return (
    <View style={styles.container}>
      <View style={[styles.progressContainer, { 
        backgroundColor: colors.cardBackground,
        shadowColor: colors.black
      }]}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Today's Progress</Text>
          <Text style={[styles.percentage, { color: colors.primary }]}>{Math.round(completionRate)}%</Text>
        </View>
        
        <View style={[styles.progressBarContainer, { backgroundColor: colors.inputBackground }]}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${completionRate}%`, backgroundColor: colors.primary }
            ]} 
          />
        </View>
        
        <Text style={[styles.taskCount, { color: colors.textLight }]}>
          {completedTasks} of {totalTasks} tasks completed
        </Text>
      </View>
      
      {streakDays > 0 && (
        <View style={styles.streakContainer}>
          <Text style={[styles.streakText, { color: colors.text }]}>
            🔥 {streakDays} day{streakDays !== 1 ? 's' : ''} streak
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressContainer: {
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  percentage: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  taskCount: {
    fontSize: 14,
    textAlign: 'center',
  },
  streakContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  streakText: {
    fontSize: 16,
    fontWeight: '600',
  },
});