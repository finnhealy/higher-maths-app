import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { useAppTheme } from '@/lib/theme';

type SelectableChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function SelectableChip({ label, selected, onPress }: SelectableChipProps) {
  const { colors, isDark, radii, spacing } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : isDark ? colors.cardAlt : '#F8FAFC',
          borderColor: selected ? colors.primary : colors.border,
          borderRadius: radii.pill,
          paddingHorizontal: spacing.md,
        },
        pressed && styles.pressed,
      ]}
    >
      <AppText color={selected ? '#FFFFFF' : colors.text} variant="label">
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
