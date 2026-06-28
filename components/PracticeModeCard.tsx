import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useAppTheme } from '@/lib/theme';

type PracticeModeCardProps = {
  title: string;
  description: string;
  icon: string;
  accentColor: string;
  meta?: string;
  onPress: () => void;
};

export function PracticeModeCard({ title, description, icon, accentColor, meta, onPress }: PracticeModeCardProps) {
  const { colors, radii, shadows } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.xl },
        shadows.card,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.icon, { backgroundColor: `${accentColor}1F`, borderRadius: radii.lg }]}>
        <Text style={[styles.iconText, { color: accentColor }]}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.headingRow}>
          <AppText style={styles.title} variant="subheading">
            {title}
          </AppText>
          <Text style={[styles.chevron, { color: colors.muted }]}>›</Text>
        </View>
        <AppText muted>{description}</AppText>
        {meta ? (
          <AppText color={colors.muted} variant="caption">
            {meta}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    borderWidth: 1,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  icon: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
    fontWeight: '900',
  },
  content: {
    flex: 1,
    gap: 8,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    flex: 1,
  },
  chevron: {
    fontSize: 30,
    lineHeight: 30,
    fontWeight: '500',
  },
});
