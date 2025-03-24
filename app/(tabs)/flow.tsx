import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  Platform,
  Dimensions,
  LayoutChangeEvent,
  Modal,
  TextInput,
  FlatList
} from 'react-native';
import { Stack } from 'expo-router';
import { useColors } from '@/constants/colors';
import { useTaskStore } from '@/store/task-store';
import { useFlowStore } from '@/store/flow-store';
import { Task } from '@/types/task';
import DateSelector from '@/components/DateSelector';
import TimelineHourMarker from '@/components/TimelineHourMarker';
import TimelineItem from '@/components/TimelineItem';
import DraggableTaskItem from '@/components/DraggableTaskItem';
import { Plus, Info, Clock, X, Search, Repeat } from 'lucide-react-native';

export default function FlowScreen() {
  const colors = useColors();
  const { getAllTasks, getTaskById } = useTaskStore();
  const { 
    scheduledTasks, 
    selectedDate, 
    setSelectedDate, 
    addTaskToSchedule, 
    removeTaskFromSchedule,
    updateScheduledTask,
    isTaskScheduled,
    getScheduledTasksForDate,
    generateRecurringSchedule
  } = useFlowStore();
  
  const [timelineHeight, setTimelineHeight] = useState(1440); // 24 hours * 60 minutes
  const [timelineLayout, setTimelineLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [currentDragTask, setCurrentDragTask] = useState<Task | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [editingTask, setEditingTask] = useState<{taskId: string, startTime: number, endTime: number} | null>(null);
  const [timelineClickPosition, setTimelineClickPosition] = useState<number | null>(null);
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const timelineRef = useRef<ScrollView>(null);
  const tasks = getAllTasks();
  
  // Generate recurring tasks when component mounts or date changes
  useEffect(() => {
    generateRecurringSchedule();
  }, [selectedDate]);
  
  // Scroll to current time on initial render
  useEffect(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    // Scroll to current time with some offset to show a bit of the past
    const scrollToPosition = Math.max(0, currentMinutes - 60);
    
    // Use a timeout to ensure the timeline has rendered
    const timer = setTimeout(() => {
      if (timelineRef.current) {
        timelineRef.current.scrollTo({ y: scrollToPosition, animated: true });
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle timeline layout to get its position
  const handleTimelineLayout = (event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setTimelineLayout({ x, y, width, height });
  };
  
  // Track scroll position
  const handleScroll = (event: any) => {
    setScrollOffset(event.nativeEvent.contentOffset.y);
  };
  
  // Generate hour markers for the timeline (24 hours)
  const hourMarkers = Array.from({ length: 24 }, (_, i) => (
    <TimelineHourMarker key={i} hour={i} top={i * 60} />
  ));
  
  // Handle task drag start
  const handleTaskDragStart = (task: Task) => {
    setCurrentDragTask(task);
  };
  
  // Handle task drag end
  const handleTaskDragEnd = (task: Task, position: { x: number; y: number }) => {
    setCurrentDragTask(null);
    
    // Check if the drop position is within the timeline area
    if (
      position.x >= timelineLayout.x && 
      position.x <= timelineLayout.x + timelineLayout.width &&
      position.y >= timelineLayout.y && 
      position.y <= timelineLayout.y + timelineLayout.height
    ) {
      // Calculate the time based on the Y position relative to the timeline
      const relativeY = position.y - timelineLayout.y + scrollOffset;
      
      // Convert to minutes (rounded to nearest 15 minutes)
      const minutes = Math.round(relativeY / 15) * 15;
      
      // Use the task's estimated time or default to 30 minutes
      const duration = task.estimatedTime || 30;
      
      // Add the task to the schedule
      addTaskToSchedule(task.id, minutes, duration);
    }
  };
  
  // Handle removing a task from the schedule
  const handleRemoveFromSchedule = (taskId: string) => {
    removeTaskFromSchedule(taskId);
  };
  
  // Handle task press
  const handleTaskPress = (task: Task) => {
    // For now, just toggle scheduling
    if (isTaskScheduled(task.id)) {
      removeTaskFromSchedule(task.id);
    }
  };
  
  // Handle timeline task press to edit
  const handleTimelineTaskPress = (taskId: string, startTime: number, duration: number) => {
    setEditingTask({ 
      taskId, 
      startTime, 
      endTime: startTime + duration 
    });
  };
  
  // Handle saving edited task time
  const handleSaveTaskTime = () => {
    if (editingTask) {
      // Calculate duration from start and end times
      const duration = editingTask.endTime - editingTask.startTime;
      
      // Ensure duration is at least 5 minutes
      if (duration < 5) {
        // Show error or adjust end time
        const adjustedEndTime = editingTask.startTime + 5;
        setEditingTask({
          ...editingTask,
          endTime: adjustedEndTime
        });
        return;
      }
      
      updateScheduledTask(editingTask.taskId, {
        startTime: editingTask.startTime,
        duration: duration
      });
      setEditingTask(null);
    }
  };
  
  // Handle timeline click to add a task
  const handleTimelineClick = (event: any) => {
    // Only handle direct clicks on the timeline, not on tasks
    if (event.target === event.currentTarget) {
      // Calculate the time based on the Y position relative to the timeline
      const relativeY = event.nativeEvent.locationY + scrollOffset;
      
      // Convert to minutes (rounded to nearest 15 minutes)
      const minutes = Math.round(relativeY / 15) * 15;
      
      setTimelineClickPosition(minutes);
      setShowTaskSelector(true);
    }
  };
  
  // Handle selecting a task from the task selector
  const handleSelectTask = (task: Task) => {
    if (timelineClickPosition !== null) {
      // Use the task's estimated time or default to 30 minutes
      const duration = task.estimatedTime || 30;
      
      // Add the task to the schedule
      addTaskToSchedule(task.id, timelineClickPosition, duration);
      
      // Close the task selector
      setShowTaskSelector(false);
      setTimelineClickPosition(null);
      setSearchQuery('');
    }
  };
  
  // Convert minutes to hours and minutes for display
  const formatTimeForInput = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };
  
  // Parse time string (HH:MM) to minutes
  const parseTimeToMinutes = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return (hours * 60) + (minutes || 0);
  };
  
  // Format time for display (12-hour format with AM/PM)
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };
  
  // Render scheduled tasks on the timeline
  const renderScheduledTasks = () => {
    const tasksForDate = getScheduledTasksForDate(selectedDate);
    
    return tasksForDate.map((scheduledTask) => {
      const task = getTaskById(scheduledTask.taskId);
      if (!task) return null;
      
      return (
        <TimelineItem
          key={`${scheduledTask.taskId}-${scheduledTask.date}`}
          task={task}
          scheduledTask={scheduledTask}
          onRemove={handleRemoveFromSchedule}
          onPress={() => handleTimelineTaskPress(scheduledTask.taskId, scheduledTask.startTime, scheduledTask.duration)}
        />
      );
    });
  };
  
  // Filter tasks that are not completed and not already scheduled
  const availableTasks = tasks.filter(task => 
    !task.completed && 
    (searchQuery ? 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) : 
      true
    )
  );
  
  // Filter tasks for the task selector (exclude already scheduled tasks)
  const selectableTasks = tasks.filter(task => 
    !task.completed && 
    !isTaskScheduled(task.id) &&
    (searchQuery ? 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) : 
      true
    )
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: 'Daily Flow',
          headerRight: () => (
            <TouchableOpacity style={styles.infoButton}>
              <Info size={20} color={colors.primary} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <DateSelector 
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
      
      <View style={styles.contentContainer}>
        {/* Timeline Section */}
        <View style={[styles.timelineContainer, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Timeline</Text>
          
          <ScrollView
            ref={timelineRef}
            style={styles.timeline}
            contentContainerStyle={{ height: timelineHeight }}
            showsVerticalScrollIndicator={true}
            onLayout={handleTimelineLayout}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <TouchableOpacity 
              style={styles.timelineClickArea}
              onPress={handleTimelineClick}
              activeOpacity={1}
            >
              {hourMarkers}
              {renderScheduledTasks()}
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        {/* Available Tasks Section */}
        <View style={styles.tasksContainer}>
          <View style={styles.tasksHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Tasks</Text>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: colors.primary }]}
            >
              <Plus size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <Search size={18} color={colors.textLight} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { 
                color: colors.text,
                backgroundColor: colors.inputBackground
              }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search tasks..."
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <ScrollView style={styles.tasksList}>
            {availableTasks.length > 0 ? (
              availableTasks.map(task => (
                <DraggableTaskItem
                  key={task.id}
                  task={task}
                  onDragStart={handleTaskDragStart}
                  onDragEnd={handleTaskDragEnd}
                  onPress={handleTaskPress}
                  isScheduled={isTaskScheduled(task.id)}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: colors.textLight }]}>
                  No tasks available. Add tasks from the Matrix tab.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
      
      {/* Dragging overlay - shows on top of everything when dragging */}
      {currentDragTask && (
        <View style={styles.dragOverlay} pointerEvents="none">
          <Text style={styles.hiddenText}>Dragging</Text>
        </View>
      )}
      
      {/* Edit Task Time Modal */}
      <Modal
        visible={!!editingTask}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditingTask(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Edit Task Time
              </Text>
              <TouchableOpacity onPress={() => setEditingTask(null)}>
                <X size={20} color={colors.textLight} />
              </TouchableOpacity>
            </View>
            
            {editingTask && (
              <View style={styles.modalBody}>
                <View style={styles.timeInputContainer}>
                  <Clock size={18} color={colors.primary} style={styles.timeIcon} />
                  <Text style={[styles.timeInputLabel, { color: colors.text }]}>Start Time:</Text>
                  <TextInput
                    style={[styles.timeInput, { 
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.inputBackground
                    }]}
                    value={formatTimeForInput(editingTask.startTime)}
                    onChangeText={(text) => {
                      if (editingTask) {
                        setEditingTask({
                          ...editingTask,
                          startTime: parseTimeToMinutes(text)
                        });
                      }
                    }}
                    placeholder="HH:MM"
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
                
                <View style={styles.timeInputContainer}>
                  <Clock size={18} color={colors.primary} style={styles.timeIcon} />
                  <Text style={[styles.timeInputLabel, { color: colors.text }]}>End Time:</Text>
                  <TextInput
                    style={[styles.timeInput, { 
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.inputBackground
                    }]}
                    value={formatTimeForInput(editingTask.endTime)}
                    onChangeText={(text) => {
                      if (editingTask) {
                        setEditingTask({
                          ...editingTask,
                          endTime: parseTimeToMinutes(text)
                        });
                      }
                    }}
                    placeholder="HH:MM"
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
                
                <TouchableOpacity 
                  style={[styles.saveButton, { backgroundColor: colors.primary }]}
                  onPress={handleSaveTaskTime}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Task Selector Modal */}
      <Modal
        visible={showTaskSelector}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowTaskSelector(false);
          setTimelineClickPosition(null);
          setSearchQuery('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {timelineClickPosition !== null ? `Add Task at ${formatTime(timelineClickPosition)}` : 'Add Task'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowTaskSelector(false);
                setTimelineClickPosition(null);
                setSearchQuery('');
              }}>
                <X size={20} color={colors.textLight} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <Search size={18} color={colors.textLight} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { 
                  color: colors.text,
                  backgroundColor: colors.inputBackground
                }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search tasks..."
                placeholderTextColor={colors.textLight}
              />
            </View>
            
            <FlatList
              data={selectableTasks}
              keyExtractor={(item) => item.id}
              style={styles.taskSelectorList}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyStateText, { color: colors.textLight }]}>
                    No available tasks found. Add tasks from the Matrix tab.
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.taskSelectorItem, { backgroundColor: colors.inputBackground }]}
                  onPress={() => handleSelectTask(item)}
                >
                  <View style={styles.taskSelectorItemContent}>
                    <Text style={[styles.taskSelectorTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    
                    {item.repeat && item.repeat !== 'none' && (
                      <Repeat size={14} color={colors.primary} style={styles.repeatIcon} />
                    )}
                  </View>
                  
                  {item.description ? (
                    <Text style={[styles.taskSelectorDescription, { color: colors.textLight }]} numberOfLines={1}>
                      {item.description}
                    </Text>
                  ) : null}
                  
                  {item.estimatedTime ? (
                    <View style={styles.taskSelectorMeta}>
                      <Clock size={12} color={colors.textLight} />
                      <Text style={[styles.taskSelectorMetaText, { color: colors.textLight }]}>
                        {item.estimatedTime < 60 
                          ? `${item.estimatedTime}m` 
                          : `${Math.floor(item.estimatedTime / 60)}h ${item.estimatedTime % 60 > 0 
                              ? `${item.estimatedTime % 60}m` 
                              : ''}`
                        }
                      </Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  timelineContainer: {
    flex: 2,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeline: {
    flex: 1,
    marginTop: 8,
  },
  timelineClickArea: {
    flex: 1,
    height: '100%',
  },
  tasksContainer: {
    flex: 1,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 40,
    borderRadius: 8,
    fontSize: 14,
  },
  tasksList: {
    flex: 1,
  },
  emptyState: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    fontSize: 14,
  },
  infoButton: {
    padding: 8,
  },
  dragOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 1000, // Ensure this is above everything
  },
  hiddenText: {
    opacity: 0,
    height: 0,
    width: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    gap: 16,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeIcon: {
    marginRight: 4,
  },
  timeInputLabel: {
    fontSize: 16,
    fontWeight: '500',
    width: 100,
  },
  timeInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  saveButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Task selector styles
  taskSelectorList: {
    maxHeight: 300,
  },
  taskSelectorItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  taskSelectorItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskSelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    flex: 1,
  },
  repeatIcon: {
    marginLeft: 8,
  },
  taskSelectorDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  taskSelectorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskSelectorMetaText: {
    fontSize: 12,
    marginLeft: 4,
  },
});