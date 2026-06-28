import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ProgressBar } from '@/components/ProgressBar';
import { useAppTheme } from '@/lib/theme';
import { Topic } from '@/types/maths';

type TopicCardProps = {
  topic: Topic;
  completed: number;
  total: number;
  onPress: () => void;
  metricLabel?: string;
};

export function TopicCard({ topic, completed, total, onPress, metricLabel = 'lessons' }: TopicCardProps) {
  const { colors, isDark, radii, shadows } = useAppTheme();
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

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
      <View style={[styles.icon, { backgroundColor: `${topic.colour}1F` }]}>
        <Text style={[styles.iconText, { color: topic.colour }]}>{topic.icon}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <AppText style={styles.title} variant="subheading">{topic.title}</AppText>
          <AppText muted variant="label">{progress}%</AppText>
        </View>
        <AppText muted>{topic.description}</AppText>
        <ProgressBar progress={progress} colour={topic.colour} />
        <AppText color={isDark ? '#93A4B8' : '#64748B'} variant="caption">
          {completed} of {total} {metricLabel} completed
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  icon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 17,
    fontWeight: '900',
  },
  content: {
    flex: 1,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
  },
});
