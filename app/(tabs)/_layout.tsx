import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useColors } from '@/constants/colors';
import { Grid, ListTodo, BarChart3, Settings, Clock } from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = useColors();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: { 
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
          height: 60, // Reduced height
          paddingBottom: 8, // Add some padding at the bottom
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: -4, // Move label closer to icon
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Matrix',
          tabBarIcon: ({ color }) => <Grid size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="flow"
        options={{
          title: 'Flow',
          tabBarIcon: ({ color }) => <Clock size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ color }) => <ListTodo size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => <BarChart3 size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}