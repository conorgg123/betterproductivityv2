import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Task } from '@/types/task';
import { useColors } from '@/constants/colors';
import { getQuadrantInfo } from '@/constants/quadrants';
import { Clock, X, Repeat } from 'lucide-react-native';
import { ScheduledTask } from '@/store/flow-store';

interface TimelineItemProps {
  task: Task;
  scheduledTask: ScheduledTask;
  onRemove: (taskId: string) => void;
  onPress: () => void;
}

export default function TimelineItem({ task, scheduledTask, onRemove, onPress }: TimelineItemProps) {
  const colors = useColors();
  const quadrantInfo = getQuadrantInfo(task.quadrant || 'do');
  
  // Convert minutes to hours and minutes for display
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };
  
  // Calculate end time
  const endTime = scheduledTask.startTime + scheduledTask.duration;
  
  // Calculate height based on duration (1 minute = 1 unit of height)
  const itemHeight = Math.max(scheduledTask.duration, 30); // Minimum height of 30
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.cardBackground,
          borderLeftColor: quadrantInfo.color,
          borderLeftWidth: 4,
          height: itemHeight,
          top: scheduledTask.startTime,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {task.title}
            </Text>
            
            {scheduledTask.isRecurring && (
              <Repeat size={12} color={quadrantInfo.color} style={styles.repeatIcon} />
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => onRemove(task.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={16} color={colors.textLight} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.timeInfo}>
          <Clock size={12} color={colors.textLight} />
          <Text style={[styles.timeText, { color: colors.textLight }]}>
            {formatTime(scheduledTask.startTime)} - {formatTime(endTime)}
          </Text>
        </View>
        
        {task.description && itemHeight > 50 ? (
          <Text 
            style={[styles.description, { color: colors.textLight }]} 
            numberOfLines={2}
          >
            {task.description}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 70, // Position to the right of the time markers
    right: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
    zIndex: 10, // Ensure tasks appear above hour markers
  },
  content: {
    flex: 1,
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  repeatIcon: {
    marginLeft: 4,
  },
  removeButton: {
    padding: 2,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    marginLeft: 4,
  },
  description: {
    fontSize: 12,
    marginTop: 4,
  },
});