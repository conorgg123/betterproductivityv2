import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform, useColorScheme } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { useThemeStore } from "@/store/theme-store";
import { useOnboardingStore } from "@/store/onboarding-store";

export const unstable_settings = {
  // Ensure landing is always the initial route
  initialRouteName: "landing",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  
  const colorScheme = useColorScheme();
  const { theme, setTheme } = useThemeStore();
  
  // Set the initial theme based on system preference if not already set
  useEffect(() => {
    if (colorScheme && !theme) {
      setTheme(colorScheme);
    }
  }, [colorScheme, theme]);

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <RootLayoutNav />
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const { hasCompletedOnboarding } = useOnboardingStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Check if the user has completed onboarding
    const inAuthGroup = segments[0] === "(tabs)";
    
    if (hasCompletedOnboarding && segments[0] === "landing") {
      router.replace("/(tabs)");
    } else if (hasCompletedOnboarding && segments[0] === "welcome") {
      router.replace("/(tabs)");
    } else if (!hasCompletedOnboarding && inAuthGroup) {
      router.replace("/landing");
    }
  }, [hasCompletedOnboarding, segments]);

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      {/* Landing page is first in the stack */}
      <Stack.Screen name="landing" options={{ gestureEnabled: false }} />
      <Stack.Screen name="welcome" options={{ gestureEnabled: false }} />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen 
        name="edit-task/[id]" 
        options={{ 
          headerShown: true, 
          title: "Edit Task",
          animation: 'slide_from_right'
        }} 
      />
      <Stack.Screen 
        name="add" 
        options={{ 
          headerShown: true, 
          title: "Add Task",
          animation: 'slide_from_bottom'
        }} 
      />
    </Stack>
  );
}