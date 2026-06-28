import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '@/global.css';
import { useStudyReminderNotifications } from '@/lib/studyReminderNotifications';
import { AppThemeProvider, useAppTheme } from '@/lib/theme';

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <ThemedRootLayout />
    </AppThemeProvider>
  );
}

function ThemedRootLayout() {
  const { colors, isDark, typography } = useAppTheme();
  useStudyReminderNotifications();

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: true,
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text, ...typography.subheading },
          headerBackTitle: 'Back',
          headerBackButtonDisplayMode: 'generic',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="topic/[topicId]" options={{ title: 'Topic' }} />
        <Stack.Screen name="topic/[topicId]/[subtopicId]" options={{ title: 'Lesson' }} />
        <Stack.Screen name="practice/[topicId]" options={{ title: 'Practice' }} />
        <Stack.Screen name="privacy-policy" options={{ title: 'Privacy Policy' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
