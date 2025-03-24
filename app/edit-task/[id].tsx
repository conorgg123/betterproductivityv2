import React, { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView, View, Text } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import TaskForm from '@/components/TaskForm';
import { useColors } from '@/constants/colors';
import { useTaskStore } from '@/store/task-store';
import { Task } from '@/types/task';

export default function EditTaskScreen() {
  const router = useRouter();
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const { tasks } = useTaskStore();
  const [task, setTask] = useState<Task | undefined>(undefined);
  
  useEffect(() => {
    if (id) {
      const foundTask = tasks.find(t => t.id === String(id));
      if (foundTask) {
        setTask(foundTask);
      } else {
        // Task not found, go back
        router.back();
      }
    }
  }, [id, tasks]);
  
  const handleClose = () => {
    router.back();
  };

  if (!task) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.text }}>Loading task...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: 'Edit Task',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }} 
      />
      
      <TaskForm initialTask={task} onClose={handleClose} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});