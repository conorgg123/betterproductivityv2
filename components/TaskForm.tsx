import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert
} from 'react-native';
import { Task, QuadrantType, RepeatType } from '@/types/task';
import { useTaskStore } from '@/store/task-store';
import { useStatsStore } from '@/store/stats-store';
import { quadrants } from '@/constants/quadrants';
import { X, Calendar, Clock, User, Repeat, AlarmClock } from 'lucide-react-native';
import { useColors } from '@/constants/colors';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';

interface TaskFormProps {
  initialTask?: Task;
  initialQuadrant?: QuadrantType;
  onClose: () => void;
}

export default function TaskForm({ initialTask, initialQuadrant, onClose }: TaskFormProps) {
  const { addTask, updateTask } = useTaskStore();
  const statsStore = useStatsStore();
  const colors = useColors();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quadrant, setQuadrant] = useState<QuadrantType>('do');
  const [dueDate, setDueDate] = useState<number | undefined>(undefined);
  const [estimatedTime, setEstimatedTime] = useState<number | undefined>(undefined);
  const [assignedTo, setAssignedTo] = useState<string | undefined>(undefined);
  const [completed, setCompleted] = useState(false);
  const [repeat, setRepeat] = useState<RepeatType>('none');
  const [preferredStartTime, setPreferredStartTime] = useState<number | undefined>(undefined);
  const [preferredEndTime, setPreferredEndTime] = useState<number | undefined>(undefined);
  
  // Date and time picker states
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
  const [isRepeatPickerVisible, setRepeatPickerVisible] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  
  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setQuadrant(initialTask.quadrant || 'do'); // Default to 'do' if undefined
      setDueDate(initialTask.dueDate);
      setEstimatedTime(initialTask.estimatedTime);
      setCompleted(initialTask.completed);
      setRepeat(initialTask.repeat || 'none');
      setPreferredStartTime(initialTask.preferredStartTime);
      setPreferredEndTime(initialTask.preferredEndTime);
      
      // Set hours and minutes if estimatedTime exists
      if (initialTask.estimatedTime) {
        setHours(Math.floor(initialTask.estimatedTime / 60));
        setMinutes(initialTask.estimatedTime % 60);
      }
      
      setAssignedTo(initialTask.assignedTo);
    } else if (initialQuadrant) {
      setQuadrant(initialQuadrant);
    }
  }, [initialTask, initialQuadrant]);
  
  const handleSave = () => {
    if (!title.trim()) return;
    
    // Calculate total minutes from hours and minutes
    const totalMinutes = hours * 60 + minutes;
    
    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      quadrant, // This is now guaranteed to be defined
      completed: initialTask ? completed : false,
      dueDate,
      estimatedTime: totalMinutes > 0 ? totalMinutes : undefined,
      assignedTo: assignedTo?.trim() || undefined,
      repeat: repeat !== 'none' ? repeat : undefined,
      preferredStartTime,
      preferredEndTime,
    };
    
    try {
      if (initialTask) {
        updateTask(initialTask.id, taskData);
      } else {
        addTask(taskData);
        // Only record stats if statsStore is properly initialized
        if (statsStore && typeof statsStore.recordTaskAddition === 'function') {
          statsStore.recordTaskAddition(quadrant);
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task. Please try again.');
    }
  };
  
  // Date picker handlers
  const showDatePicker = () => {
    console.log('Opening date picker');
    setDatePickerVisible(true);
  };
  
  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };
  
  const handleConfirmDate = (date: Date) => {
    console.log('Date selected:', date);
    setDueDate(date.getTime());
    hideDatePicker();
  };
  
  // Time picker handlers
  const showTimePicker = () => {
    setTimePickerVisible(true);
  };
  
  const hideTimePicker = () => {
    setTimePickerVisible(false);
  };
  
  // Start time picker handlers
  const showStartTimePicker = () => {
    setStartTimePickerVisible(true);
  };
  
  const hideStartTimePicker = () => {
    setStartTimePickerVisible(false);
  };
  
  const handleConfirmStartTime = (time: number) => {
    setPreferredStartTime(time);
    hideStartTimePicker();
  };
  
  // End time picker handlers
  const showEndTimePicker = () => {
    setEndTimePickerVisible(true);
  };
  
  const hideEndTimePicker = () => {
    setEndTimePickerVisible(false);
  };
  
  const handleConfirmEndTime = (time: number) => {
    setPreferredEndTime(time);
    hideEndTimePicker();
  };
  
  // Repeat picker handlers
  const showRepeatPicker = () => {
    setRepeatPickerVisible(true);
  };
  
  const hideRepeatPicker = () => {
    setRepeatPickerVisible(false);
  };
  
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const formatTime = (hours: number, minutes: number) => {
    if (hours === 0 && minutes === 0) return '';
    return `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m` : ''}`.trim();
  };
  
  const formatTimeOfDay = (minutes?: number) => {
    if (!minutes && minutes !== 0) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };
  
  const getRepeatText = (repeatType: RepeatType) => {
    switch (repeatType) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      default: return 'Does not repeat';
    }
  };
  
  // Generate picker items for hours (0-24)
  const hourItems = Array.from({ length: 25 }, (_, i) => (
    <Picker.Item key={`hour-${i}`} label={`${i} hour${i !== 1 ? 's' : ''}`} value={i} />
  ));
  
  // Generate picker items for minutes (0-55, step 5)
  const minuteItems = Array.from({ length: 12 }, (_, i) => {
    const value = i * 5;
    return <Picker.Item key={`minute-${value}`} label={`${value} minute${value !== 1 ? 's' : ''}`} value={value} />;
  });
  
  // Generate time picker items (24-hour format)
  const timePickerItems = () => {
    const items = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const totalMinutes = hour * 60 + minute;
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        const label = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
        items.push(<Picker.Item key={`time-${totalMinutes}`} label={label} value={totalMinutes} />);
      }
    }
    return items;
  };
  
  // Platform-specific date picker
  const renderDatePicker = () => {
    if (Platform.OS === 'web') {
      // Web fallback for date picker
      return (
        <Modal
          visible={isDatePickerVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={hideDatePicker}
        >
          <View style={styles.timePickerModalContainer}>
            <View style={[styles.timePickerContent, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.timePickerHeader}>
                <Text style={[styles.timePickerTitle, { color: colors.text }]}>Select Due Date</Text>
                <TouchableOpacity onPress={hideDatePicker}>
                  <X size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.webDatePickerContainer}>
                <input
                  type="date"
                  style={{
                    fontSize: 16,
                    padding: 12,
                    width: '100%',
                    borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                    backgroundColor: colors.inputBackground
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    if (e.target.value) {
                      const selectedDate = new Date(e.target.value);
                      handleConfirmDate(selectedDate);
                    }
                  }}
                />
              </View>
              
              <TouchableOpacity 
                style={[styles.confirmButton, { backgroundColor: colors.primary }]}
                onPress={hideDatePicker}
              >
                <Text style={styles.confirmButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      );
    }
    
    // Native date picker
    return (
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        date={dueDate ? new Date(dueDate) : new Date()}
        minimumDate={new Date()}
      />
    );
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Title</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.inputBackground,
              color: colors.text
            }]}
            value={title}
            onChangeText={setTitle}
            placeholder="What needs to be done?"
            placeholderTextColor={colors.textLight}
            autoFocus
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea, { 
              backgroundColor: colors.inputBackground,
              color: colors.text
            }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add details about this task..."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Quadrant</Text>
          <View style={styles.quadrantSelector}>
            {quadrants.map((q) => (
              <TouchableOpacity
                key={q.id}
                style={[
                  styles.quadrantOption,
                  { borderColor: colors.border },
                  quadrant === q.id && { backgroundColor: `${q.color}20`, borderColor: q.color }
                ]}
                onPress={() => setQuadrant(q.id as QuadrantType)}
              >
                <Text style={[
                  styles.quadrantText,
                  { color: colors.text },
                  quadrant === q.id && { color: q.color, fontWeight: '600' }
                ]}>
                  {q.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Due Date (optional)</Text>
          <TouchableOpacity 
            style={[styles.inputRow, { backgroundColor: colors.inputBackground }]}
            onPress={showDatePicker}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.iconContainer}>
              <Calendar size={18} color={colors.primary} />
            </View>
            <Text 
              style={[
                styles.inlineInput, 
                { color: dueDate ? colors.text : colors.textLight }
              ]}
            >
              {dueDate ? formatDate(dueDate) : 'Add due date'}
            </Text>
            {dueDate && (
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={() => setDueDate(undefined)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={16} color={colors.textLight} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Repeat (optional)</Text>
          <TouchableOpacity 
            style={[styles.inputRow, { backgroundColor: colors.inputBackground }]}
            onPress={showRepeatPicker}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.iconContainer}>
              <Repeat size={18} color={colors.primary} />
            </View>
            <Text 
              style={[
                styles.inlineInput, 
                { color: repeat !== 'none' ? colors.text : colors.textLight }
              ]}
            >
              {getRepeatText(repeat)}
            </Text>
            {repeat !== 'none' && (
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={() => setRepeat('none')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={16} color={colors.textLight} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Estimated Time (optional)</Text>
          <TouchableOpacity 
            style={[styles.inputRow, { backgroundColor: colors.inputBackground }]}
            onPress={showTimePicker}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.iconContainer}>
              <Clock size={18} color={colors.primary} />
            </View>
            <Text 
              style={[
                styles.inlineInput, 
                { color: (hours > 0 || minutes > 0) ? colors.text : colors.textLight }
              ]}
            >
              {(hours > 0 || minutes > 0) ? formatTime(hours, minutes) : 'Add estimated time'}
            </Text>
            {(hours > 0 || minutes > 0) && (
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={() => {
                  setHours(0);
                  setMinutes(0);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={16} color={colors.textLight} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Preferred Time Frame (optional)</Text>
          <View style={styles.timeFrameContainer}>
            <TouchableOpacity 
              style={[styles.timeFrameInput, { backgroundColor: colors.inputBackground }]}
              onPress={showStartTimePicker}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <AlarmClock size={18} color={colors.primary} />
              </View>
              <Text 
                style={[
                  styles.inlineInput, 
                  { color: preferredStartTime !== undefined ? colors.text : colors.textLight }
                ]}
              >
                {preferredStartTime !== undefined ? formatTimeOfDay(preferredStartTime) : 'Start time'}
              </Text>
              {preferredStartTime !== undefined && (
                <TouchableOpacity 
                  style={styles.clearButton} 
                  onPress={() => setPreferredStartTime(undefined)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={16} color={colors.textLight} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
            
            <Text style={[styles.timeFrameSeparator, { color: colors.textLight }]}>to</Text>
            
            <TouchableOpacity 
              style={[styles.timeFrameInput, { backgroundColor: colors.inputBackground }]}
              onPress={showEndTimePicker}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <AlarmClock size={18} color={colors.primary} />
              </View>
              <Text 
                style={[
                  styles.inlineInput, 
                  { color: preferredEndTime !== undefined ? colors.text : colors.textLight }
                ]}
              >
                {preferredEndTime !== undefined ? formatTimeOfDay(preferredEndTime) : 'End time'}
              </Text>
              {preferredEndTime !== undefined && (
                <TouchableOpacity 
                  style={styles.clearButton} 
                  onPress={() => setPreferredEndTime(undefined)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={16} color={colors.textLight} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {quadrant === 'delegate' && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Assign To (optional)</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.inputBackground }]}>
              <View style={styles.iconContainer}>
                <User size={18} color={colors.primary} />
              </View>
              <TextInput
                style={[styles.inlineInput, { color: colors.text }]}
                value={assignedTo}
                onChangeText={setAssignedTo}
                placeholder="Assign to someone"
                placeholderTextColor={colors.textLight}
              />
              {assignedTo && (
                <TouchableOpacity 
                  style={styles.clearButton} 
                  onPress={() => setAssignedTo(undefined)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={16} color={colors.textLight} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>
      
      <View style={[styles.footer, { 
        borderTopColor: colors.border,
        backgroundColor: colors.cardBackground 
      }]}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton, { backgroundColor: colors.inputBackground }]} 
          onPress={onClose}
        >
          <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.button, 
            styles.saveButton, 
            { backgroundColor: colors.primary },
            !title.trim() && styles.disabledButton
          ]} 
          onPress={handleSave}
          disabled={!title.trim()}
        >
          <Text style={styles.saveButtonText}>
            {initialTask ? 'Update' : 'Add Task'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Date Picker */}
      {renderDatePicker()}
      
      {/* Time Picker Modal */}
      <Modal
        visible={isTimePickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={hideTimePicker}
      >
        <View style={styles.timePickerModalContainer}>
          <View style={[styles.timePickerContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.timePickerHeader}>
              <Text style={[styles.timePickerTitle, { color: colors.text }]}>Select Estimated Time</Text>
              <TouchableOpacity onPress={hideTimePicker}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.pickerContainer}>
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: colors.textLight }]}>Hours</Text>
                <Picker
                  selectedValue={hours}
                  onValueChange={(value) => setHours(value)}
                  style={[styles.picker, { color: colors.text }]}
                  itemStyle={{ color: colors.text }}
                >
                  {hourItems}
                </Picker>
              </View>
              
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: colors.textLight }]}>Minutes</Text>
                <Picker
                  selectedValue={minutes}
                  onValueChange={(value) => setMinutes(value)}
                  style={[styles.picker, { color: colors.text }]}
                  itemStyle={{ color: colors.text }}
                >
                  {minuteItems}
                </Picker>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.confirmButton, { backgroundColor: colors.primary }]}
              onPress={hideTimePicker}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Start Time Picker Modal */}
      <Modal
        visible={isStartTimePickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={hideStartTimePicker}
      >
        <View style={styles.timePickerModalContainer}>
          <View style={[styles.timePickerContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.timePickerHeader}>
              <Text style={[styles.timePickerTitle, { color: colors.text }]}>Select Start Time</Text>
              <TouchableOpacity onPress={hideStartTimePicker}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Picker
              selectedValue={preferredStartTime !== undefined ? preferredStartTime : 540} // Default to 9:00 AM
              onValueChange={(value) => handleConfirmStartTime(value)}
              style={{ color: colors.text }}
              itemStyle={{ color: colors.text }}
            >
              {timePickerItems()}
            </Picker>
            
            <TouchableOpacity 
              style={[styles.confirmButton, { backgroundColor: colors.primary }]}
              onPress={hideStartTimePicker}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* End Time Picker Modal */}
      <Modal
        visible={isEndTimePickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={hideEndTimePicker}
      >
        <View style={styles.timePickerModalContainer}>
          <View style={[styles.timePickerContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.timePickerHeader}>
              <Text style={[styles.timePickerTitle, { color: colors.text }]}>Select End Time</Text>
              <TouchableOpacity onPress={hideEndTimePicker}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Picker
              selectedValue={preferredEndTime !== undefined ? preferredEndTime : 1020} // Default to 5:00 PM
              onValueChange={(value) => handleConfirmEndTime(value)}
              style={{ color: colors.text }}
              itemStyle={{ color: colors.text }}
            >
              {timePickerItems()}
            </Picker>
            
            <TouchableOpacity 
              style={[styles.confirmButton, { backgroundColor: colors.primary }]}
              onPress={hideEndTimePicker}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Repeat Picker Modal */}
      <Modal
        visible={isRepeatPickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={hideRepeatPicker}
      >
        <View style={styles.timePickerModalContainer}>
          <View style={[styles.timePickerContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.timePickerHeader}>
              <Text style={[styles.timePickerTitle, { color: colors.text }]}>Repeat Task</Text>
              <TouchableOpacity onPress={hideRepeatPicker}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.repeatOptions}>
              {(['none', 'daily', 'weekly', 'monthly'] as RepeatType[]).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.repeatOption,
                    { borderColor: colors.border },
                    repeat === option && { backgroundColor: `${colors.primary}20`, borderColor: colors.primary }
                  ]}
                  onPress={() => {
                    setRepeat(option);
                    hideRepeatPicker();
                  }}
                >
                  <Text style={[
                    styles.repeatOptionText,
                    { color: colors.text },
                    repeat === option && { color: colors.primary, fontWeight: '600' }
                  ]}>
                    {getRepeatText(option)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
  },
  quadrantSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  quadrantOption: {
    flex: 1,
    minWidth: '45%',
    margin: 4,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  quadrantText: {
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50, // Explicit height to ensure touchable area
  },
  iconContainer: {
    marginRight: 8,
    padding: 4,
  },
  inlineInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    marginRight: 8,
  },
  cancelButtonText: {
    fontWeight: '600',
  },
  saveButton: {
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  // Time picker modal styles
  timePickerModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  timePickerContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  pickerContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  picker: {
    width: '100%',
    height: 150,
  },
  confirmButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  // Web date picker styles
  webDatePickerContainer: {
    marginBottom: 20,
  },
  // Time frame styles
  timeFrameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeFrameInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  timeFrameSeparator: {
    marginHorizontal: 8,
    fontSize: 14,
  },
  // Repeat options
  repeatOptions: {
    marginBottom: 20,
  },
  repeatOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  repeatOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
});