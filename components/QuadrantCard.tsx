import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTaskStore } from '@/store/task-store';
import { QuadrantType } from '@/types/task';
import { Plus } from 'lucide-react-native';
import { useColors } from '@/constants/colors';

interface QuadrantCardProps {
  quadrant: {
    id: string;
    title: string;
    color: string;
    icon?: React.ReactNode;
    description?: string;
  };
  onAddTask: (quadrantId: string) => void;
  onPress: (quadrantId: string) => void;
}

export default function QuadrantCard({ quadrant, onAddTask, onPress }: QuadrantCardProps) {
  const colors = useColors();
  const { getTasksByQuadrant } = useTaskStore();
  
  // Safely handle the quadrant ID
  const quadrantId = quadrant?.id || '';
  
  // Get tasks for this quadrant, with a safety check
  const tasks = quadrantId ? getTasksByQuadrant(quadrantId as QuadrantType) : [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // Safely handle the quadrant color
  const quadrantColor = quadrant?.color || colors.primary;
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.cardBackground,
          borderColor: `${quadrantColor}30`,
        }
      ]}
      onPress={() => quadrantId && onPress(quadrantId)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${quadrantColor}20` }]}>
          {quadrant?.icon}
        </View>
        
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: quadrantColor }]}
          onPress={() => quadrantId && onAddTask(quadrantId)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Plus size={16} color={colors.white} />
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.title, { color: quadrantColor }]}>
        {quadrant?.title || 'Quadrant'}
      </Text>
      
      <Text style={[styles.description, { color: colors.textLight }]}>
        {quadrant?.description || ''}
      </Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{totalTasks}</Text>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>Tasks</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{completedTasks}</Text>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>Done</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {completionRate.toFixed(0)}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>Rate</Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBar, 
            { 
              backgroundColor: `${quadrantColor}20`,
              width: '100%'
            }
          ]}
        >
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: quadrantColor,
                width: `${completionRate}%`
              }
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 6,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
  },
  progressContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});