import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack } from 'expo-router';
import { useAchievementsStore } from '@/store/achievements-store';
import { useStatsStore } from '@/store/stats-store';
import { useColors } from '@/constants/colors';
import LevelProgressBar from '@/components/LevelProgressBar';
import AchievementCard from '@/components/AchievementCard';
import { Award, Flame, Target, Zap, Users, Filter, Grid, CheckCircle, Trophy } from 'lucide-react-native';

export default function ProgressScreen() {
  const colors = useColors();
  const { 
    achievements, 
    level, 
    experience, 
    experienceToNextLevel,
    getUnlockedAchievements,
    getInProgressAchievements,
    getAchievementsByCategory
  } = useAchievementsStore();
  const { streakDays } = useStatsStore();
  
  const [activeTab, setActiveTab] = useState<'all' | 'unlocked' | 'progress' | 'category'>('all');
  const [activeCategory, setActiveCategory] = useState<'productivity' | 'consistency' | 'balance' | 'mastery' | 'special'>('productivity');
  
  const unlockedAchievements = getUnlockedAchievements();
  const inProgressAchievements = getInProgressAchievements();
  
  const displayedAchievements = activeTab === 'all' 
    ? achievements 
    : activeTab === 'unlocked' 
      ? unlockedAchievements 
      : activeTab === 'progress'
        ? inProgressAchievements
        : getAchievementsByCategory(activeCategory);
  
  const renderTab = (tab: 'all' | 'unlocked' | 'progress' | 'category', label: string) => (
    <TouchableOpacity
      style={[
        styles.tab,
        activeTab === tab && [styles.activeTab, { backgroundColor: colors.primary }]
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Text
        style={[
          styles.tabText,
          { color: activeTab === tab ? colors.white : colors.textLight }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  const renderCategoryTab = (category: 'productivity' | 'consistency' | 'balance' | 'mastery' | 'special', label: string, icon: React.ReactNode) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        activeCategory === category && activeTab === 'category' && 
          [styles.activeCategoryTab, { borderColor: colors.primary }]
      ]}
      onPress={() => {
        setActiveCategory(category);
        setActiveTab('category');
      }}
    >
      <View style={[styles.categoryIconContainer, { 
        backgroundColor: activeCategory === category && activeTab === 'category' 
          ? `${colors.primary}20` 
          : `${colors.textLight}10` 
      }]}>
        {icon}
      </View>
      <Text
        style={[
          styles.categoryTabText,
          { 
            color: activeCategory === category && activeTab === 'category' 
              ? colors.primary 
              : colors.textLight 
          }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  const getMotivationalMessage = () => {
    if (level < 3) {
      return "You're just getting started! Complete tasks to earn XP and unlock achievements.";
    } else if (level < 5) {
      return "You're making great progress! Keep up the momentum to reach new levels.";
    } else if (level < 10) {
      return "Impressive work! You're becoming a productivity master.";
    } else {
      return "Outstanding! Your dedication to productivity is truly remarkable.";
    }
  };
  
  const getNextMilestone = () => {
    // Find the next achievement that's close to being unlocked
    const nextAchievement = inProgressAchievements
      .filter(a => a.progress > 0)
      .sort((a, b) => (b.progress / b.target) - (a.progress / a.target))[0];
    
    if (nextAchievement) {
      const remaining = nextAchievement.target - nextAchievement.progress;
      return `Next milestone: ${remaining} more to unlock "${nextAchievement.title}"`;
    }
    
    return "Complete tasks to progress toward your next achievement!";
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: 'Your Progress',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }} 
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <LevelProgressBar 
          level={level} 
          experience={experience} 
          experienceToNextLevel={experienceToNextLevel} 
        />
        
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
            <Award size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {unlockedAchievements.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>Achievements</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
            <Flame size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.primary }]}>{streakDays}</Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>Day Streak</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
            <Target size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>Completion</Text>
          </View>
        </View>
        
        <View style={styles.motivationContainer}>
          <Text style={[styles.motivationTitle, { color: colors.text }]}>
            Level {level} - {level < 3 ? 'Beginner' : level < 5 ? 'Apprentice' : level < 10 ? 'Expert' : 'Master'}
          </Text>
          <Text style={[styles.motivationText, { color: colors.textLight }]}>
            {getMotivationalMessage()}
          </Text>
          <Text style={[styles.nextMilestone, { color: colors.primary }]}>
            {getNextMilestone()}
          </Text>
        </View>
        
        <View style={styles.tabsContainer}>
          {renderTab('all', 'All')}
          {renderTab('unlocked', `Unlocked (${unlockedAchievements.length})`)}
          {renderTab('progress', `In Progress (${inProgressAchievements.length})`)}
          {renderTab('category', 'Categories')}
        </View>
        
        {activeTab === 'category' && (
          <View style={styles.categoriesContainer}>
            {renderCategoryTab('productivity', 'Productivity', <Zap size={20} color={activeCategory === 'productivity' && activeTab === 'category' ? colors.primary : colors.textLight} />)}
            {renderCategoryTab('consistency', 'Consistency', <Flame size={20} color={activeCategory === 'consistency' && activeTab === 'category' ? colors.primary : colors.textLight} />)}
            {renderCategoryTab('balance', 'Balance', <Grid size={20} color={activeCategory === 'balance' && activeTab === 'category' ? colors.primary : colors.textLight} />)}
            {renderCategoryTab('mastery', 'Mastery', <Target size={20} color={activeCategory === 'mastery' && activeTab === 'category' ? colors.primary : colors.textLight} />)}
            {renderCategoryTab('special', 'Special', <Trophy size={20} color={activeCategory === 'special' && activeTab === 'category' ? colors.primary : colors.textLight} />)}
          </View>
        )}
        
        {displayedAchievements.length > 0 ? (
          displayedAchievements.map(achievement => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textLight }]}>
              {activeTab === 'unlocked' 
                ? "You haven't unlocked any achievements yet. Keep going!" 
                : activeTab === 'progress'
                  ? "You don't have any achievements in progress. Start completing tasks!"
                  : activeTab === 'category'
                    ? `No achievements found in the ${activeCategory} category.`
                    : "No achievements found."}
            </Text>
          </View>
        )}
        
        {unlockedAchievements.length > 0 && (
          <View style={styles.recentAchievementsContainer}>
            <Text style={[styles.recentTitle, { color: colors.text }]}>
              Recently Unlocked
            </Text>
            <View style={styles.recentAchievements}>
              {unlockedAchievements
                .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
                .slice(0, 3)
                .map(achievement => (
                  <AchievementCard key={achievement.id} achievement={achievement} compact />
                ))}
            </View>
          </View>
        )}
        
        <View style={styles.tipsContainer}>
          <Text style={[styles.tipsTitle, { color: colors.text }]}>
            Pro Tips
          </Text>
          <View style={[styles.tipCard, { backgroundColor: colors.cardBackground }]}>
            <CheckCircle size={20} color={colors.primary} />
            <Text style={[styles.tipText, { color: colors.textLight }]}>
              Complete tasks daily to maintain your streak
            </Text>
          </View>
          <View style={[styles.tipCard, { backgroundColor: colors.cardBackground }]}>
            <CheckCircle size={20} color={colors.primary} />
            <Text style={[styles.tipText, { color: colors.textLight }]}>
              Balance tasks across all quadrants for maximum productivity
            </Text>
          </View>
          <View style={[styles.tipCard, { backgroundColor: colors.cardBackground }]}>
            <CheckCircle size={20} color={colors.primary} />
            <Text style={[styles.tipText, { color: colors.textLight }]}>
              Focus on important tasks first to earn more achievements
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  motivationContainer: {
    marginBottom: 20,
    padding: 16,
    alignItems: 'center',
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  nextMilestone: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#00000010',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryTab: {
    width: '48%',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#00000020',
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeCategoryTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  recentAchievementsContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  recentAchievements: {
    gap: 8,
  },
  tipsContainer: {
    marginTop: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
});