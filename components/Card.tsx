import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useAppTheme } from '@/lib/theme';

type CardProps = {
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  gap?: 'none' | 'sm' | 'md' | 'lg';
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
};

const paddingBySize = {
  sm: 12,
  md: 16,
  lg: 24,
} as const;

const gapBySize = {
  none: 0,
  sm: 8,
  md: 16,
  lg: 24,
} as const;

export function Card({ children, padding = 'md', gap = 'md', elevated = false, style }: CardProps) {
  const { colors, radii, shadows } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radii.xl,
          gap: gapBySize[gap],
          padding: paddingBySize[padding],
        },
        elevated && shadows.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
});
