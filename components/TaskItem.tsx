import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Pressable } from 'react-native';
import { Task } from '@/types/task';
import { useTaskStore } from '@/store/task-store';
import { getQuadrantInfo } from '@/constants/quadrants';
import { Check, MoreVertical, Clock, Calendar, User, Repeat, AlarmClock } from 'lucide-react-native';
import { useColors } from '@/constants/colors';
import TaskActionsMenu from './TaskActionsMenu';
import { useRouter } from 'expo-router';

interface TaskItemProps {
  task: Task;
  onPress?: (task: Task) => void;
}

export default function TaskItem({ task, onPress }: TaskItemProps) {
  const { toggleTaskCompletion } = useTaskStore();
  const quadrantInfo = getQuadrantInfo(task.quadrant || 'do'); // Default to 'do' if undefined
  const colors = useColors();
  const router = useRouter();
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const moreButtonRef = useRef<TouchableOpacity>(null);
  
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  const formatTime = (minutes?: number) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };
  
  const formatTimeOfDay = (minutes?: number) => {
    if (!minutes && minutes !== 0) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  const handleMorePress = () => {
    if (moreButtonRef.current) {
      moreButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setMenuPosition({ 
          top: pageY + height + 5, 
          right: 20 // Adjust this value based on your layout
        });
        setMenuVisible(true);
      });
    }
  };

  const handleTaskPress = () => {
    if (onPress) {
      onPress(task);
    } else {
      // Navigate to task details or edit page
      router.push(`/edit-task/${task.id}`);
    }
  };

  return (
    <Pressable 
      style={[styles.container, 
        { 
          backgroundColor: colors.cardBackground,
          shadowColor: colors.black
        },
        task.completed && styles.completedContainer
      ]}
      onPress={handleTaskPress}
    >
      <TouchableOpacity 
        style={[styles.checkbox, { borderColor: quadrantInfo.color }]}
        onPress={() => toggleTaskCompletion(task.id)}
      >
        {task.completed && (
          <View style={[styles.checkboxInner, { backgroundColor: quadrantInfo.color }]}>
            <Check size={14} color={colors.white} />
          </View>
        )}
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text 
          style={[
            styles.title, 
            { color: colors.text },
            task.completed && [styles.completedText, { color: colors.textLight }]
          ]} 
          numberOfLines={1}
        >
          {task.title}
        </Text>
        
        {task.description ? (
          <Text style={[styles.description, { color: colors.textLight }]} numberOfLines={1}>
            {task.description}
          </Text>
        ) : null}
        
        <View style={styles.metaContainer}>
          {task.dueDate ? (
            <View style={styles.metaItem}>
              <Calendar size={12} color={colors.textLight} />
              <Text style={[styles.metaText, { color: colors.textLight }]}>{formatDate(task.dueDate)}</Text>
            </View>
          ) : null}
          
          {task.estimatedTime ? (
            <View style={styles.metaItem}>
              <Clock size={12} color={colors.textLight} />
              <Text style={[styles.metaText, { color: colors.textLight }]}>{formatTime(task.estimatedTime)}</Text>
            </View>
          ) : null}
          
          {task.repeat && task.repeat !== 'none' ? (
            <View style={styles.metaItem}>
              <Repeat size={12} color={colors.textLight} />
              <Text style={[styles.metaText, { color: colors.textLight }]}>{task.repeat}</Text>
            </View>
          ) : null}
          
          {task.preferredStartTime !== undefined && task.preferredEndTime !== undefined ? (
            <View style={styles.metaItem}>
              <AlarmClock size={12} color={colors.textLight} />
              <Text style={[styles.metaText, { color: colors.textLight }]}>
                {formatTimeOfDay(task.preferredStartTime)} - {formatTimeOfDay(task.preferredEndTime)}
              </Text>
            </View>
          ) : null}
          
          {task.assignedTo ? (
            <View style={styles.metaItem}>
              <User size={12} color={colors.textLight} />
              <Text style={[styles.metaText, { color: colors.textLight }]}>{task.assignedTo}</Text>
            </View>
          ) : null}
        </View>
      </View>
      
      <TouchableOpacity 
        ref={moreButtonRef}
        style={styles.moreButton}
        onPress={handleMorePress}
      >
        <MoreVertical size={16} color={colors.textLight} />
      </TouchableOpacity>

      <TaskActionsMenu
        task={task}
        isVisible={menuVisible}
        onClose={() => setMenuVisible(false)}
        position={menuPosition}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completedContainer: {
    opacity: 0.7,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxInner: {
    width: 18,
    height: 18,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 14,
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  moreButton: {
    padding: 4,
  },
});