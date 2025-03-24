import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useColors } from '@/constants/colors';
import { Achievement } from '@/store/achievements-store';
import { 
  Award, 
  CheckCircle, 
  Target, 
  Zap, 
  Flame, 
  Grid, 
  Users, 
  Calendar, 
  AlarmClock,
  CheckSquare,
  Trash,
  Scale,
  Sun,
  Moon,
  Star,
  Palette,
  Trophy,
  TrendingUp
} from 'lucide-react-native';

interface AchievementCardProps {
  achievement: Achievement;
  compact?: boolean;
}

export default function AchievementCard({ achievement, compact = false }: AchievementCardProps) {
  const colors = useColors();
  const isUnlocked = achievement.unlockedAt !== null;
  const progressPercent = (achievement.progress / achievement.target) * 100;
  
  const renderIcon = () => {
    const iconSize = compact ? 20 : 24;
    const iconColor = isUnlocked ? colors.primary : colors.textLight;
    
    switch (achievement.icon) {
      case 'check-circle':
        return <CheckCircle size={iconSize} color={iconColor} />;
      case 'target':
        return <Target size={iconSize} color={iconColor} />;
      case 'zap':
        return <Zap size={iconSize} color={iconColor} />;
      case 'flame':
        return <Flame size={iconSize} color={iconColor} />;
      case 'grid':
        return <Grid size={iconSize} color={iconColor} />;
      case 'users':
        return <Users size={iconSize} color={iconColor} />;
      case 'calendar':
        return <Calendar size={iconSize} color={iconColor} />;
      case 'alarm-clock':
        return <AlarmClock size={iconSize} color={iconColor} />;
      case 'check-square':
        return <CheckSquare size={iconSize} color={iconColor} />;
      case 'trash':
        return <Trash size={iconSize} color={iconColor} />;
      case 'scale':
        return <Scale size={iconSize} color={iconColor} />;
      case 'sun':
        return <Sun size={iconSize} color={iconColor} />;
      case 'moon':
        return <Moon size={iconSize} color={iconColor} />;
      case 'star':
        return <Star size={iconSize} color={iconColor} />;
      case 'palette':
        return <Palette size={iconSize} color={iconColor} />;
      case 'trophy':
        return <Trophy size={iconSize} color={iconColor} />;
      case 'trending-up':
        return <TrendingUp size={iconSize} color={iconColor} />;
      default:
        return <Award size={iconSize} color={iconColor} />;
    }
  };
  
  if (compact) {
    return (
      <View style={[styles.compactContainer, { 
        backgroundColor: isUnlocked ? `${colors.primary}15` : colors.cardBackground,
        borderColor: isUnlocked ? colors.primary : colors.border
      }]}>
        <View style={styles.compactIconContainer}>
          {renderIcon()}
        </View>
        <View style={styles.compactContent}>
          <Text style={[styles.compactTitle, { color: colors.text }]}>
            {achievement.title}
          </Text>
          {!isUnlocked && (
            <View style={[styles.compactProgressBar, { backgroundColor: colors.inputBackground }]}>
              <View 
                style={[
                  styles.compactProgressFill, 
                  { width: `${progressPercent}%`, backgroundColor: colors.primary }
                ]} 
              />
            </View>
          )}
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { 
      backgroundColor: colors.cardBackground,
      borderColor: isUnlocked ? colors.primary : colors.border,
      shadowColor: colors.black
    }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { 
          backgroundColor: isUnlocked ? `${colors.primary}20` : `${colors.textLight}20` 
        }]}>
          {renderIcon()}
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{achievement.title}</Text>
          {isUnlocked && (
            <Text style={[styles.unlockDate, { color: colors.textLight }]}>
              Unlocked {new Date(achievement.unlockedAt!).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
      
      <Text style={[styles.description, { color: colors.textLight }]}>
        {achievement.description}
      </Text>
      
      {!isUnlocked && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.inputBackground }]}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercent}%`, backgroundColor: colors.primary }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textLight }]}>
            {achievement.progress} / {achievement.target}
          </Text>
        </View>
      )}
      
      {isUnlocked && (
        <View style={styles.rewardContainer}>
          <Text style={[styles.rewardText, { color: colors.success }]}>
            +{achievement.experienceReward} XP
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  unlockDate: {
    fontSize: 12,
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
  },
  rewardContainer: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  compactIconContainer: {
    marginRight: 10,
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  compactProgressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
});