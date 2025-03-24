import React, { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import TaskForm from '@/components/TaskForm';
import { useColors } from '@/constants/colors';
import { QuadrantType } from '@/types/task';

export default function AddTaskScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams();
  const [initialQuadrant, setInitialQuadrant] = useState<QuadrantType | undefined>(undefined);
  
  useEffect(() => {
    if (params.quadrant) {
      setInitialQuadrant(params.quadrant as QuadrantType);
    }
  }, [params]);
  
  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: 'Add Task',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }} 
      />
      
      <TaskForm initialQuadrant={initialQuadrant} onClose={handleClose} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});