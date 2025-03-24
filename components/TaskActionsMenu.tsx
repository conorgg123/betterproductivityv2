import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useColors } from '@/constants/colors';
import { Task, QuadrantType } from '@/types/task';
import { useTaskStore } from '@/store/task-store';
import { getQuadrantInfo } from '@/constants/quadrants';
import { Edit, Trash2, MoveRight, Check, X, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface TaskActionsMenuProps {
  task: Task;
  isVisible: boolean;
  onClose: () => void;
  position: { top: number; right: number };
}

export default function TaskActionsMenu({ 
  task, 
  isVisible, 
  onClose,
  position 
}: TaskActionsMenuProps) {
  const colors = useColors();
  const { deleteTask, toggleTaskCompletion, moveTask } = useTaskStore();
  const router = useRouter();
  
  const handleDelete = () => {
    deleteTask(task.id);
    onClose();
  };
  
  const handleToggleCompletion = () => {
    toggleTaskCompletion(task.id);
    onClose();
  };
  
  const handleEdit = () => {
    // Navigate to edit task page with task ID
    router.push(`/edit-task/${task.id}`);
    onClose();
  };
  
  const handleMoveTask = (quadrant: QuadrantType) => {
    moveTask(task.id, quadrant);
    onClose();
  };
  
  // Get all quadrants except the current one
  const getOtherQuadrants = () => {
    const quadrantTypes: QuadrantType[] = ['do', 'schedule', 'delegate', 'eliminate'];
    return quadrantTypes.filter(q => q !== task.quadrant);
  };
  
  if (!isVisible) return null;
  
  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View 
          style={[
            styles.menuContainer, 
            { 
              backgroundColor: colors.cardBackground,
              shadowColor: colors.black,
              top: position.top,
              right: position.right,
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={handleEdit}
          >
            <Edit size={18} color={colors.primary} />
            <Text style={[styles.menuText, { color: colors.text }]}>Edit Task</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={handleToggleCompletion}
          >
            {task.completed ? (
              <>
                <X size={18} color={colors.error} />
                <Text style={[styles.menuText, { color: colors.text }]}>Mark Incomplete</Text>
              </>
            ) : (
              <>
                <Check size={18} color={colors.success} />
                <Text style={[styles.menuText, { color: colors.text }]}>Mark Complete</Text>
              </>
            )}
          </TouchableOpacity>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <Text style={[styles.sectionTitle, { color: colors.textLight }]}>Move to:</Text>
          
          {getOtherQuadrants().map((quadrant) => {
            const quadrantInfo = getQuadrantInfo(quadrant);
            return (
              <TouchableOpacity 
                key={quadrant}
                style={styles.menuItem} 
                onPress={() => handleMoveTask(quadrant)}
              >
                <ArrowRight size={18} color={quadrantInfo.color} />
                <Text style={[styles.menuText, { color: colors.text }]}>{quadrantInfo.title}</Text>
              </TouchableOpacity>
            );
          })}
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <TouchableOpacity 
            style={[styles.menuItem, styles.deleteItem]} 
            onPress={handleDelete}
          >
            <Trash2 size={18} color={colors.error} />
            <Text style={[styles.menuText, { color: colors.error }]}>Delete Task</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menuContainer: {
    position: 'absolute',
    width: 200,
    borderRadius: 12,
    padding: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
  divider: {
    height: 1,
    marginVertical: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  deleteItem: {
    marginTop: 4,
  },
});