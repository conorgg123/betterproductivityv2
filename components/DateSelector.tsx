import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useColors } from '@/constants/colors';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';

interface DateSelectorProps {
  selectedDate: string; // ISO date string (YYYY-MM-DD)
  onDateChange: (date: string) => void;
}

export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const colors = useColors();
  
  // Parse the selected date
  const date = new Date(selectedDate);
  
  // Format the date for display
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: new Date().getFullYear() !== date.getFullYear() ? 'numeric' : undefined
    };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Navigate to previous day
  const goToPreviousDay = () => {
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    onDateChange(prevDate.toISOString().split('T')[0]);
  };
  
  // Navigate to next day
  const goToNextDay = () => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    onDateChange(nextDate.toISOString().split('T')[0]);
  };
  
  // Go to today
  const goToToday = () => {
    onDateChange(new Date().toISOString().split('T')[0]);
  };
  
  // Check if selected date is today
  const isToday = () => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.dateControls}>
        <TouchableOpacity 
          style={[styles.arrowButton, { backgroundColor: colors.cardBackground }]}
          onPress={goToPreviousDay}
        >
          <ChevronLeft size={20} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.dateContainer}>
          <Text style={[styles.dateText, { color: colors.text }]}>
            {formatDate(date)}
          </Text>
          {!isToday() && (
            <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
              <Calendar size={14} color={colors.primary} />
              <Text style={[styles.todayText, { color: colors.primary }]}>Today</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.arrowButton, { backgroundColor: colors.cardBackground }]}
          onPress={goToNextDay}
        >
          <ChevronRight size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  dateControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  todayText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});