import { Tabs } from 'expo-router';
import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import { Text } from 'react-native';

import { CoinBadge } from '@/components/CoinBadge';
import { useAppTheme } from '@/lib/theme';

type TabIcon = {
  name: {
    ios: SFSymbol;
    android: AndroidSymbol;
    web: AndroidSymbol;
  };
  fallback: string;
};

const icons: Record<string, TabIcon> = {
  index: { name: { ios: 'house.fill', android: 'home', web: 'home' }, fallback: 'Home' },
  topics: { name: { ios: 'book.closed.fill', android: 'menu_book', web: 'menu_book' }, fallback: 'Lessons' },
  practice: { name: { ios: 'pencil', android: 'edit_square', web: 'edit_square' }, fallback: 'Practice' },
  garden: { name: { ios: 'leaf.fill', android: 'local_florist', web: 'local_florist' }, fallback: 'Garden' },
  results: { name: { ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' }, fallback: 'Results' },
  account: { name: { ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' }, fallback: 'Account' },
};

export default function TabLayout() {
  const { colors, typography } = useAppTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: true,
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text, ...typography.subheading },
        headerRight: () => <CoinBadge />,
        headerRightContainerStyle: {
          paddingRight: 14,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          elevation: 0,
          minHeight: 64,
          paddingTop: 8,
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
        tabBarIcon: ({ color }) => {
          const icon = icons[route.name];

          return (
            <SymbolView
              fallback={<Text style={{ color, fontSize: 12, fontWeight: '700' }}>{icon?.fallback ?? route.name}</Text>}
              name={icon?.name}
              size={22}
              tintColor={color}
              weight="semibold"
            />
          );
        },
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
