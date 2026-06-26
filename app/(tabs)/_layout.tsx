import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { CoinBadge } from '@/components/CoinBadge';
import { useAppTheme } from '@/lib/theme';

const icons = {
  index: '⌂',
  topics: '≡',
  practice: '✎',
  garden: '♧',
  results: '✓',
  account: '◐',
};

export default function TabLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text, fontWeight: '900' },
        headerRight: () => <CoinBadge />,
        headerRightContainerStyle: {
          paddingRight: 14,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          height: 68,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
        },
        tabBarIcon: ({ color }) => (
          <Text style={{ color, fontSize: 19, fontWeight: '900' }}>
            {icons[route.name as keyof typeof icons]}
          </Text>
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="topics" options={{ title: 'Lessons' }} />
      <Tabs.Screen name="practice" options={{ title: 'Practice' }} />
      <Tabs.Screen name="garden" options={{ title: 'Garden' }} />
      <Tabs.Screen name="results" options={{ title: 'Results' }} />
      <Tabs.Screen name="account" options={{ title: 'Account' }} />
    </Tabs>
  );
}
