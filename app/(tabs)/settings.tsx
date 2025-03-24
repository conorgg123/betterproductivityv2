import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useColors } from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';
import { useTaskStore } from '@/store/task-store';
import { useAchievementsStore } from '@/store/achievements-store';
import { useOnboardingStore } from '@/store/onboarding-store';
import { 
  Moon, 
  Sun, 
  Trash2, 
  RefreshCw, 
  Info, 
  Award, 
  HelpCircle,
  ChevronRight,
  LogOut
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { theme, toggleTheme } = useThemeStore();
  const { clearCompletedTasks } = useTaskStore();
  const { resetOnboarding } = useOnboardingStore();
  
  const handleClearCompletedTasks = () => {
    Alert.alert(
      'Clear Completed Tasks',
      'Are you sure you want to remove all completed tasks? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            clearCompletedTasks();
          }
        }
      ]
    );
  };
  
  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will show the welcome screen again the next time you open the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          onPress: () => {
            resetOnboarding();
            Alert.alert('Success', 'Onboarding has been reset. You will see the welcome screen on next app launch.');
          }
        }
      ]
    );
  };
  
  const handleShowAbout = () => {
    Alert.alert(
      'About Eisenhower Matrix',
      'This app helps you prioritize tasks using the Eisenhower Matrix method, dividing tasks into four quadrants based on urgency and importance.\n\nDeveloped with ❤️ using React Native and Expo.',
      [{ text: 'OK' }]
    );
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingInfo}>
            {theme === 'dark' ? (
              <Moon size={22} color={colors.text} />
            ) : (
              <Sun size={22} color={colors.text} />
            )}
            <Text style={[styles.settingText, { color: colors.text }]}>
              Dark Mode
            </Text>
          </View>
          
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: `${colors.primary}80` }}
            thumbColor={theme === 'dark' ? colors.primary : '#f4f3f4'}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Management</Text>
        
        <TouchableOpacity 
          style={[styles.settingItem, { borderBottomColor: colors.border }]}
          onPress={handleClearCompletedTasks}
        >
          <View style={styles.settingInfo}>
            <Trash2 size={22} color={colors.error} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              Clear Completed Tasks
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textLight} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>App</Text>
        
        <TouchableOpacity 
          style={[styles.settingItem, { borderBottomColor: colors.border }]}
          onPress={handleResetOnboarding}
        >
          <View style={styles.settingInfo}>
            <RefreshCw size={22} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              Reset Welcome Screen
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingItem, { borderBottomColor: colors.border }]}
          onPress={handleShowAbout}
        >
          <View style={styles.settingInfo}>
            <Info size={22} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              About
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textLight} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textLight }]}>
          Eisenhower Matrix v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
});