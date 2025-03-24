import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { useTaskStore } from '@/store/task-store';
import { useStatsStore } from '@/store/stats-store';
import { quadrants } from '@/constants/quadrants';
import { BarChart, Calendar, CheckCircle, Clock, TrendingUp, ListTodo, Calendar as CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react-native';
import StatsCard from '@/components/StatsCard';
import { useColors } from '@/constants/colors';
import { Task } from '@/types/task';

export default function StatsScreen() {
  const { getCompletedTasksCount, getTotalTasksCount, getCompletionRate, getTasksByQuadrant, getAllTasks } = useTaskStore();
  const { streakDays, getTodayStats } = useStatsStore();
  const colors = useColors();
  const [expandedSection, setExpandedSection] = useState<string | null>('today');
  
  const completedTasks = getCompletedTasksCount();
  const totalTasks = getTotalTasksCount();
  const completionRate = getCompletionRate();
  const allTasks = getAllTasks();
  const todayStats = getTodayStats();
  
  // Get today's tasks
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = allTasks.filter(task => {
    if (task.dueDate) {
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === today;
    }
    return false;
  });
  
  // Get upcoming tasks (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const upcomingTasks = allTasks.filter(task => {
    if (task.dueDate && !task.completed) {
      const taskDate = new Date(task.dueDate);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      return taskDate > todayDate && taskDate <= nextWeek;
    }
    return false;
  });
  
  // Calculate quadrant distribution
  const quadrantDistribution = quadrants.map(quadrant => {
    const tasks = getTasksByQuadrant(quadrant.id as any);
    return {
      id: quadrant.id,
      title: quadrant.title,
      color: quadrant.color,
      count: tasks.length,
      percentage: totalTasks > 0 ? (tasks.length / totalTasks) * 100 : 0
    };
  });
  
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  const renderTaskItem = (task: Task) => {
    return (
      <View key={task.id} style={[styles.taskItem, { backgroundColor: colors.cardBackground }]}>
        <View style={[styles.taskColorIndicator, { backgroundColor: getQuadrantColor(task.quadrant) }]} />
        <View style={styles.taskContent}>
          <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>
          {task.dueDate && (
            <Text style={[styles.taskDueDate, { color: colors.textLight }]}>
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </Text>
          )}
        </View>
        <View style={[styles.taskStatus, { 
          backgroundColor: task.completed ? `${colors.success}20` : `${colors.warning}20`
        }]}>
          <Text style={[styles.taskStatusText, { 
            color: task.completed ? colors.success : colors.warning
          }]}>
            {task.completed ? 'Done' : 'Pending'}
          </Text>
        </View>
      </View>
    );
  };
  
  const getQuadrantColor = (quadrantId: string) => {
    const quadrant = quadrants.find(q => q.id === quadrantId);
    return quadrant ? quadrant.color : colors.textLight;
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: 'Daily Summary',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Overview</Text>
          
          <View style={styles.statsRow}>
            <StatsCard 
              icon={<CheckCircle size={20} color={colors.primary} />}
              title="Completion Rate"
              value={`${Math.round(completionRate)}%`}
              subtitle={`${completedTasks} of ${totalTasks} tasks`}
            />
            
            <StatsCard 
              icon={<Calendar size={20} color={colors.primary} />}
              title="Current Streak"
              value={streakDays.toString()}
              subtitle={`day${streakDays !== 1 ? 's' : ''}`}
            />
          </View>
          
          <View style={styles.statsRow}>
            <StatsCard 
              icon={<ListTodo size={20} color={colors.primary} />}
              title="Today's Tasks"
              value={todayTasks.length.toString()}
              subtitle="scheduled for today"
            />
            
            <StatsCard 
              icon={<CalendarIcon size={20} color={colors.primary} />}
              title="Added Today"
              value={(todayStats?.addedTasks || 0).toString()}
              subtitle="new tasks"
            />
          </View>
        </View>
        
        {/* Today's Tasks Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={() => toggleSection('today')}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Tasks</Text>
            {expandedSection === 'today' ? (
              <ChevronUp size={20} color={colors.textLight} />
            ) : (
              <ChevronDown size={20} color={colors.textLight} />
            )}
          </TouchableOpacity>
          
          {expandedSection === 'today' && (
            <View style={styles.tasksList}>
              {todayTasks.length > 0 ? (
                todayTasks.map(task => renderTaskItem(task))
              ) : (
                <Text style={[styles.emptyText, { color: colors.textLight }]}>
                  No tasks scheduled for today
                </Text>
              )}
            </View>
          )}
        </View>
        
        {/* Upcoming Tasks Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={() => toggleSection('upcoming')}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Tasks</Text>
            {expandedSection === 'upcoming' ? (
              <ChevronUp size={20} color={colors.textLight} />
            ) : (
              <ChevronDown size={20} color={colors.textLight} />
            )}
          </TouchableOpacity>
          
          {expandedSection === 'upcoming' && (
            <View style={styles.tasksList}>
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map(task => renderTaskItem(task))
              ) : (
                <Text style={[styles.emptyText, { color: colors.textLight }]}>
                  No upcoming tasks for the next 7 days
                </Text>
              )}
            </View>
          )}
        </View>
        
        {/* Task Distribution Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={() => toggleSection('distribution')}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Task Distribution</Text>
            {expandedSection === 'distribution' ? (
              <ChevronUp size={20} color={colors.textLight} />
            ) : (
              <ChevronDown size={20} color={colors.textLight} />
            )}
          </TouchableOpacity>
          
          {expandedSection === 'distribution' && (
            <View style={[styles.distributionCard, { 
              backgroundColor: colors.cardBackground,
              shadowColor: colors.black
            }]}>
              {quadrantDistribution.map((item) => (
                <View key={item.id} style={styles.distributionItem}>
                  <View style={styles.distributionHeader}>
                    <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                    <Text style={[styles.distributionTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.distributionPercentage, { color: colors.textLight }]}>
                      {Math.round(item.percentage)}%
                    </Text>
                  </View>
                  
                  <View style={[styles.progressBarContainer, { backgroundColor: colors.inputBackground }]}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { 
                          backgroundColor: item.color,
                          width: `${item.percentage}%` 
                        }
                      ]} 
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
        
        {/* Productivity Tips Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={() => toggleSection('tips')}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Productivity Tips</Text>
            {expandedSection === 'tips' ? (
              <ChevronUp size={20} color={colors.textLight} />
            ) : (
              <ChevronDown size={20} color={colors.textLight} />
            )}
          </TouchableOpacity>
          
          {expandedSection === 'tips' && (
            <View style={[styles.tipsCard, { 
              backgroundColor: colors.cardBackground,
              shadowColor: colors.black
            }]}>
              <Text style={[styles.tipTitle, { color: colors.text }]}>
                Focus on "Do" tasks first
              </Text>
              <Text style={[styles.tipDescription, { color: colors.textLight }]}>
                Complete urgent and important tasks before moving to other quadrants.
              </Text>
              
              <View style={[styles.tipDivider, { backgroundColor: colors.border }]} />
              
              <Text style={[styles.tipTitle, { color: colors.text }]}>
                Schedule time for "Schedule" tasks
              </Text>
              <Text style={[styles.tipDescription, { color: colors.textLight }]}>
                Block time in your calendar for important but not urgent tasks.
              </Text>
              
              <View style={[styles.tipDivider, { backgroundColor: colors.border }]} />
              
              <Text style={[styles.tipTitle, { color: colors.text }]}>
                Delegate effectively
              </Text>
              <Text style={[styles.tipDescription, { color: colors.textLight }]}>
                Assign urgent but not important tasks to others when possible.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  tasksList: {
    marginTop: 8,
  },
  taskItem: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 10,
    padding: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskColorIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  taskDueDate: {
    fontSize: 12,
  },
  taskStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    padding: 16,
    fontSize: 14,
  },
  distributionCard: {
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  distributionItem: {
    marginBottom: 16,
  },
  distributionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  distributionTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  distributionPercentage: {
    fontSize: 14,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  tipsCard: {
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  tipDivider: {
    height: 1,
    marginVertical: 12,
  },
});