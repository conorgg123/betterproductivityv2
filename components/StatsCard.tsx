import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/constants/colors';

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
}

export default function StatsCard({ icon, title, value, subtitle }: StatsCardProps) {
  const colors = useColors();
  
  return (
    <View style={[styles.container, { 
      backgroundColor: colors.cardBackground,
      shadowColor: colors.black
    }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}10` }]}>
          {icon}
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>
      
      <Text style={[styles.value, { color: colors.primary }]}>{value}</Text>
      
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textLight }]}>{subtitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
});