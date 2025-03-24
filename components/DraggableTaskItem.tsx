import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { Task } from '@/types/task';
import { useColors } from '@/constants/colors';
import { getQuadrantInfo } from '@/constants/quadrants';
import { Clock, Repeat, AlarmClock } from 'lucide-react-native';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';

interface DraggableTaskItemProps {
  task: Task;
  onDragStart: (task: Task) => void;
  onDragEnd: (task: Task, position: { x: number; y: number }) => void;
  onPress: (task: Task) => void;
  isScheduled?: boolean;
}

export default function DraggableTaskItem({ 
  task, 
  onDragStart, 
  onDragEnd, 
  onPress,
  isScheduled = false
}: DraggableTaskItemProps) {
  const colors = useColors();
  const quadrantInfo = getQuadrantInfo(task.quadrant || 'do');
  
  // Animation values
  const translateX = new Animated.Value(0);
  const translateY = new Animated.Value(0);
  const scale = new Animated.Value(1);
  const zIndex = new Animated.Value(1);
  
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
  
  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );
  
  const handleStateChange = (event: any) => {
    if (event.nativeEvent.state === State.BEGAN) {
      // Scale up slightly when drag starts and increase z-index
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1.05,
          useNativeDriver: true,
        }),
        Animated.timing(zIndex, {
          toValue: 9999, // Extremely high z-index during drag to ensure it's above everything
          duration: 0,
          useNativeDriver: true,
        })
      ]).start();
      
      onDragStart(task);
    } else if (event.nativeEvent.state === State.END) {
      // Reset position, scale, and z-index
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(zIndex, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        })
      ]).start();
      
      onDragEnd(task, { 
        x: event.nativeEvent.absoluteX, 
        y: event.nativeEvent.absoluteY 
      });
    }
  };
  
  return (
    <GestureHandlerRootView>
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleStateChange}
      >
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: colors.cardBackground,
              borderLeftColor: quadrantInfo.color,
              transform: [
                { translateX },
                { translateY },
                { scale }
              ],
              opacity: isScheduled ? 0.6 : 1,
              zIndex: zIndex as any, // Type assertion to handle Animated.Value
              elevation: zIndex as any, // For Android
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.content}
            onPress={() => onPress(task)}
            activeOpacity={0.7}
          >
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {task.title}
              </Text>
              
              {task.repeat && task.repeat !== 'none' && (
                <Repeat size={14} color={quadrantInfo.color} style={styles.repeatIcon} />
              )}
            </View>
            
            <View style={styles.metaContainer}>
              {task.estimatedTime ? (
                <View style={styles.metaItem}>
                  <Clock size={12} color={colors.textLight} />
                  <Text style={[styles.metaText, { color: colors.textLight }]}>
                    {formatTime(task.estimatedTime)}
                  </Text>
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
            </View>
            
            {isScheduled && (
              <View style={[styles.scheduledBadge, { backgroundColor: quadrantInfo.color }]}>
                <Text style={styles.scheduledText}>Scheduled</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative', // Ensure position is set for z-index to work properly
  },
  content: {
    padding: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  repeatIcon: {
    marginLeft: 4,
  },
  metaContainer: {
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
  scheduledBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderBottomLeftRadius: 6,
    borderTopRightRadius: 8,
  },
  scheduledText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
});