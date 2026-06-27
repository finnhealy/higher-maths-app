import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { CoinBadge } from '@/components/CoinBadge';
import { useAppTheme } from '@/lib/theme';

const icons = {
  index: '⌂',
  topics: '≡',
  practice: '✎',
  garden: '♧',
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
          borderTopWidth: 0,
          elevation: 0,
          paddingTop: 6,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
          lineHeight: 14,
          marginTop: 1,
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
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
      <Tabs.Screen name="results" options={{ href: null, title: 'Results' }} />
      <Tabs.Screen name="account" options={{ title: 'Account' }} />
    </Tabs>
  );
}
