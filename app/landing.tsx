import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useColors } from '@/constants/colors';
import { useOnboardingStore } from '@/store/onboarding-store';
import { ArrowRight, CheckSquare, Clock, Target, Zap } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();
  const colors = useColors();
  const { setHasCompletedOnboarding } = useOnboardingStore();
  
  const handleGetStarted = () => {
    try {
      // Navigate to welcome screen
      router.replace('/welcome');
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      router.replace('/welcome');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: `${colors.primary}20` }]}>
            <Target size={40} color={colors.primary} />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>Eisenhower Matrix</Text>
          <Text style={[styles.tagline, { color: colors.textLight }]}>
            Prioritize tasks that matter most
          </Text>
        </View>
        
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: `${colors.urgent_important}20` }]}>
              <CheckSquare size={24} color={colors.urgent_important} />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Task Prioritization</Text>
              <Text style={[styles.featureDescription, { color: colors.textLight }]}>
                Organize tasks by urgency and importance
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: `${colors.not_urgent_important}20` }]}>
              <Clock size={24} color={colors.not_urgent_important} />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Time Management</Text>
              <Text style={[styles.featureDescription, { color: colors.textLight }]}>
                Focus on what matters, eliminate what doesn't
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: `${colors.primary}20` }]}>
              <Zap size={24} color={colors.primary} />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Achievement System</Text>
              <Text style={[styles.featureDescription, { color: colors.textLight }]}>
                Earn XP and unlock achievements as you complete tasks
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.illustration}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZHVjdGl2aXR5fGVufDB8fDB8fHww' }}
            style={styles.illustrationImage}
            resizeMode="cover"
          />
        </View>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleGetStarted}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <ArrowRight size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  features: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
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
  illustration: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  illustrationImage: {
    width: width - 48,
    height: 200,
    borderRadius: 16,
  },
  footer: {
    padding: 24,
    paddingBottom: 36,
  },
  button: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});