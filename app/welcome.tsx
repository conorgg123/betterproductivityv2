import React, { useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColors } from '@/constants/colors';
import { useOnboardingStore } from '@/store/onboarding-store';
import { 
  CheckSquare, 
  Clock, 
  Award, 
  TrendingUp, 
  Grid, 
  ChevronRight,
  ArrowRight
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { setHasCompletedOnboarding } = useOnboardingStore();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  const handleGetStarted = () => {
    try {
      // Mark onboarding as completed
      setHasCompletedOnboarding(true);
      
      // Navigate to the main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation even if store fails
      router.replace('/(tabs)');
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.content, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.logoContainer}>
            <View style={[styles.logoBox, { backgroundColor: colors.urgent_important }]}>
              <CheckSquare size={24} color="#fff" />
            </View>
            <View style={[styles.logoBox, { backgroundColor: colors.not_urgent_important }]}>
              <Clock size={24} color="#fff" />
            </View>
            <View style={[styles.logoBox, { backgroundColor: colors.urgent_not_important }]}>
              <Grid size={24} color="#fff" />
            </View>
            <View style={[styles.logoBox, { backgroundColor: colors.not_urgent_not_important }]}>
              <Award size={24} color="#fff" />
            </View>
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>
            Eisenhower Matrix
          </Text>
          
          <Text style={[styles.subtitle, { color: colors.textLight }]}>
            Prioritize tasks, achieve more, level up your productivity
          </Text>
          
          <View style={styles.featuresContainer}>
            <FeatureItem 
              icon={<Grid size={22} color={colors.primary} />}
              title="Organize by Priority"
              description="Sort tasks into four quadrants based on urgency and importance"
              colors={colors}
            />
            
            <FeatureItem 
              icon={<CheckSquare size={22} color={colors.primary} />}
              title="Complete Tasks"
              description="Track your progress and build productive habits"
              colors={colors}
            />
            
            <FeatureItem 
              icon={<Award size={22} color={colors.primary} />}
              title="Earn Achievements"
              description="Unlock rewards as you improve your productivity"
              colors={colors}
            />
            
            <FeatureItem 
              icon={<TrendingUp size={22} color={colors.primary} />}
              title="Level Up"
              description="Gain experience and track your productivity journey"
              colors={colors}
            />
          </View>
          
          <View style={styles.matrixExplainer}>
            <Text style={[styles.explainerTitle, { color: colors.text }]}>
              What is the Eisenhower Matrix?
            </Text>
            
            <Text style={[styles.explainerText, { color: colors.textLight }]}>
              A productivity framework that helps you prioritize tasks by dividing them into four quadrants:
            </Text>
            
            <View style={styles.quadrantsContainer}>
              <View style={styles.quadrantRow}>
                <View style={[styles.quadrantBox, { backgroundColor: `${colors.urgent_important}20` }]}>
                  <Text style={[styles.quadrantTitle, { color: colors.urgent_important }]}>Do</Text>
                  <Text style={[styles.quadrantDesc, { color: colors.text }]}>Urgent & Important</Text>
                </View>
                
                <View style={[styles.quadrantBox, { backgroundColor: `${colors.not_urgent_important}20` }]}>
                  <Text style={[styles.quadrantTitle, { color: colors.not_urgent_important }]}>Schedule</Text>
                  <Text style={[styles.quadrantDesc, { color: colors.text }]}>Important, Not Urgent</Text>
                </View>
              </View>
              
              <View style={styles.quadrantRow}>
                <View style={[styles.quadrantBox, { backgroundColor: `${colors.urgent_not_important}20` }]}>
                  <Text style={[styles.quadrantTitle, { color: colors.urgent_not_important }]}>Delegate</Text>
                  <Text style={[styles.quadrantDesc, { color: colors.text }]}>Urgent, Not Important</Text>
                </View>
                
                <View style={[styles.quadrantBox, { backgroundColor: `${colors.not_urgent_not_important}20` }]}>
                  <Text style={[styles.quadrantTitle, { color: colors.not_urgent_not_important }]}>Eliminate</Text>
                  <Text style={[styles.quadrantDesc, { color: colors.text }]}>Not Urgent or Important</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
      
      <Animated.View 
        style={[
          styles.buttonContainer, 
          { 
            backgroundColor: colors.background,
            opacity: fadeAnim
          }
        ]}
      >
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  colors: any;
}

function FeatureItem({ icon, title, description, colors }: FeatureItemProps) {
  return (
    <View style={[styles.featureItem, { borderColor: `${colors.border}80` }]}>
      <View style={[styles.featureIconContainer, { backgroundColor: `${colors.primary}15` }]}>
        {icon}
      </View>
      <View style={styles.featureTextContainer}>
        <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.featureDescription, { color: colors.textLight }]}>{description}</Text>
      </View>
      <ChevronRight size={16} color={colors.textLight} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 120,
    height: 120,
    marginTop: 40,
    marginBottom: 24,
  },
  logoBox: {
    width: 56,
    height: 56,
    margin: 2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 24,
    lineHeight: 22,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  matrixExplainer: {
    width: '100%',
    marginBottom: 20,
  },
  explainerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  explainerText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  quadrantsContainer: {
    width: '100%',
  },
  quadrantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quadrantBox: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
  },
  quadrantTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  quadrantDesc: {
    fontSize: 12,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  button: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});