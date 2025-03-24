import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/constants/colors';

interface TimelineHourMarkerProps {
  hour: number;
  top: number;
}

export default function TimelineHourMarker({ hour, top }: TimelineHourMarkerProps) {
  const colors = useColors();
  
  // Format hour for display (12-hour format with AM/PM)
  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHour} ${period}`;
  };
  
  // Highlight current hour
  const isCurrentHour = () => {
    const now = new Date();
    return now.getHours() === hour;
  };
  
  return (
    <View style={[styles.container, { top }]} pointerEvents="none">
      <Text 
        style={[
          styles.hourText, 
          { 
            color: isCurrentHour() ? colors.primary : colors.textLight,
            fontWeight: isCurrentHour() ? '700' : '500'
          }
        ]}
      >
        {formatHour(hour)}
      </Text>
      <View 
        style={[
          styles.line, 
          { 
            backgroundColor: isCurrentHour() ? colors.primary : colors.border,
            opacity: isCurrentHour() ? 0.7 : 0.5
          }
        ]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    zIndex: 1,
  },
  hourText: {
    width: 60,
    fontSize: 12,
    textAlign: 'right',
    paddingRight: 10,
  },
  line: {
    flex: 1,
    height: 1,
  },
});