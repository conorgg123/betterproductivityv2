import React from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { useColors } from '@/constants/colors';

interface LevelProgressBarProps {
  level: number;
  experience: number;
  experienceToNextLevel: number;
}

export default function LevelProgressBar({ 
  level, 
  experience, 
  experienceToNextLevel 
}: LevelProgressBarProps) {
  const colors = useColors();
  const progressPercent = (experience / experienceToNextLevel) * 100;
  
  // Get level title based on level
  const getLevelTitle = (level: number) => {
    if (level < 3) return 'Beginner';
    if (level < 5) return 'Apprentice';
    if (level < 10) return 'Expert';
    if (level < 15) return 'Master';
    if (level < 20) return 'Grandmaster';
    return 'Legend';
  };
  
  return (
    <View style={[styles.container, { 
      backgroundColor: colors.cardBackground,
      shadowColor: colors.black
    }]}>
      <View style={styles.header}>
        <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.levelText, { color: colors.white }]}>{level}</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            Level {level} - {getLevelTitle(level)}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textLight }]}>
            {experience} / {experienceToNextLevel} XP
          </Text>
        </View>
      </View>
      
      <View style={[styles.progressBarContainer, { backgroundColor: colors.inputBackground }]}>
        <Animated.View 
          style={[
            styles.progressBar, 
            { width: `${progressPercent}%`, backgroundColor: colors.primary }
          ]} 
        />
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.nextLevelText, { color: colors.textLight }]}>
          {Math.round(experienceToNextLevel - experience)} XP to Level {level + 1}
        </Text>
        
        <Text style={[styles.xpPerTaskText, { color: colors.primary }]}>
          +10 XP per task completed
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
  levelBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  levelText: {
    fontSize: 18,
    fontWeight: '700',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextLevelText: {
    fontSize: 14,
  },
  xpPerTaskText: {
    fontSize: 14,
    fontWeight: '500',
  },
});