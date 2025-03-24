import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, FlatList, Text, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTaskStore } from '@/store/task-store';
import { quadrants } from '@/constants/quadrants';
import { Task, QuadrantType } from '@/types/task';
import ProgressHeader from '@/components/ProgressHeader';
import QuadrantCard from '@/components/QuadrantCard';
import TaskItem from '@/components/TaskItem';
import { ChevronLeft, Plus } from 'lucide-react-native';
import { useColors } from '@/constants/colors';

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { getTasksByQuadrant } = useTaskStore();
  
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);
  
  const handleQuadrantPress = (quadrantId: string) => {
    setSelectedQuadrant(quadrantId);
  };
  
  const handleAddTask = (quadrantId?: string) => {
    if (quadrantId) {
      router.push(`/add?quadrant=${quadrantId}`);
    } else {
      router.push('/add');
    }
  };
  
  const handleTaskPress = (task: Task) => {
    // This is now handled directly in TaskItem component
    // by navigating to the edit-task/[id] route
  };
  
  const renderQuadrantTasks = () => {
    if (!selectedQuadrant) return null;
    
    const quadrant = quadrants.find(q => q.id === selectedQuadrant);
    if (!quadrant) return null;
    
    const tasks = getTasksByQuadrant(selectedQuadrant as QuadrantType);
    
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen 
          options={{ 
            headerShown: false,
          }} 
        />
        
        <View style={[styles.quadrantHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedQuadrant(null)}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.quadrantTitleContainer}>
            <View style={[styles.quadrantIconContainer, { backgroundColor: `${quadrant.color}20` }]}>
              {/* Render the quadrant icon here */}
            </View>
            <Text style={[styles.quadrantTitle, { color: colors.text }]}>{quadrant.title}</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: quadrant.color }]}
            onPress={() => handleAddTask(quadrant.id)}
          >
            <Plus size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem task={item} onPress={handleTaskPress} />
          )}
          contentContainerStyle={styles.taskList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textLight }]}>
                No tasks in this quadrant yet.
              </Text>
              <TouchableOpacity 
                style={[styles.emptyButton, { backgroundColor: quadrant.color }]}
                onPress={() => handleAddTask(quadrant.id)}
              >
                <Text style={styles.emptyButtonText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </SafeAreaView>
    );
  };
  
  if (selectedQuadrant) {
    return renderQuadrantTasks();
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: 'Eisenhower Matrix',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerAddButton}
              onPress={() => handleAddTask()}
            >
              <Plus size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ProgressHeader />
      
      <View style={styles.matrixContainer}>
        <View style={styles.matrixRow}>
          <QuadrantCard 
            quadrant={quadrants[0]} 
            onAddTask={handleAddTask}
            onPress={handleQuadrantPress}
          />
          <QuadrantCard 
            quadrant={quadrants[1]} 
            onAddTask={handleAddTask}
            onPress={handleQuadrantPress}
          />
        </View>
        
        <View style={styles.matrixRow}>
          <QuadrantCard 
            quadrant={quadrants[2]} 
            onAddTask={handleAddTask}
            onPress={handleQuadrantPress}
          />
          <QuadrantCard 
            quadrant={quadrants[3]} 
            onAddTask={handleAddTask}
            onPress={handleQuadrantPress}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  matrixContainer: {
    flex: 1,
    padding: 10,
  },
  matrixRow: {
    flex: 1,
    flexDirection: 'row',
  },
  quadrantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  quadrantTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quadrantIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  quadrantTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAddButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  taskList: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});