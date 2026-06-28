import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { AppText } from '@/components/AppText';
import { useAppTheme } from '@/lib/theme';

type StatTileProps = {
  label: string;
  value: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function StatTile({ label, value, style }: StatTileProps) {
  const { colors, radii } = useAppTheme();

  return (
    <View
      style={[
        styles.tile,
        {
          backgroundColor: colors.cardAlt,
          borderColor: colors.border,
          borderRadius: radii.lg,
        },
        style,
      ]}
    >
      <AppText numberOfLines={1} adjustsFontSizeToFit variant="heading">
        {value}
      </AppText>
      <AppText muted variant="caption">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderWidth: 1,
    gap: 4,
    minHeight: 76,
    padding: 12,
  },
});
