import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '@/components/ProgressBar';
import { useAppTheme } from '@/lib/theme';
import { Topic } from '@/types/maths';

type TopicCardProps = {
  topic: Topic;
  completed: number;
  total: number;
  onPress: () => void;
};

export function TopicCard({ topic, completed, total, onPress }: TopicCardProps) {
  const { colors, isDark } = useAppTheme();
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.icon, { backgroundColor: `${topic.colour}1F` }]}>
        <Text style={[styles.iconText, { color: topic.colour }]}>{topic.icon}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.title, { color: colors.text }]}>{topic.title}</Text>
          <Text style={[styles.percent, { color: colors.muted }]}>{progress}%</Text>
        </View>
        <Text style={[styles.description, { color: colors.muted }]}>{topic.description}</Text>
        <ProgressBar progress={progress} colour={topic.colour} />
        <Text style={[styles.meta, { color: isDark ? '#93A4B8' : '#64748B' }]}>
          {completed} of {total} questions completed
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
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
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
  },
  percent: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '800',
  },
  description: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
  },
  meta: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
});
