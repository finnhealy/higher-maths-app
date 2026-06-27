import { Tabs } from 'expo-router';
import { Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'web' ? 20 : 8);
  const topPadding = Platform.OS === 'web' ? 0 : 6

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
          height: 60 + bottomPadding,
          paddingTop: topPadding,
          paddingBottom: bottomPadding,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          height: 52,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
          lineHeight: 14,
          marginTop: 2,
          marginBottom: 0,
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
