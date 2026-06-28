import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { getTopic } from '@/data/lessonContent';
import { getGardenState } from '@/lib/storage';
import { useAppTheme } from '@/lib/theme';
import { GardenState, TopicId } from '@/types/maths';

export default function TopicSubtopicsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { topicId } = useLocalSearchParams<{ topicId: TopicId }>();
  const topic = getTopic(topicId);
  const [garden, setGarden] = useState<GardenState>();
  const completedLessonIds = useMemo(() => new Set(garden?.rewardedLessonIds ?? []), [garden?.rewardedLessonIds]);

  useFocusEffect(
    useCallback(() => {
      getGardenState().then(setGarden);
    }, []),
  );

  if (!topic) {
    return (
      <Screen edges={['bottom']} scroll={false} contentContainerStyle={styles.empty}>
        <EmptyState title="Topic not found" action={<PrimaryButton title="Back to lessons" onPress={() => router.replace('/topics')} />} />
      </Screen>
    );
  }

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: topic.title }} />
        <PrimaryButton title="Back to topics" variant="secondary" onPress={() => router.back()} />

        <View style={[styles.hero, { backgroundColor: topic.colour }]}>
          <Text style={styles.icon}>{topic.icon}</Text>
          <AppText color="#FFFFFF" variant="title">{topic.title}</AppText>
          <AppText color="#E0F2FE">{topic.description}</AppText>
        </View>

        <SectionHeader title="Subtopics" subtitle="Completed lessons are marked so you can pick up where you left off." />

        <View style={styles.list}>
          {topic.subtopics.map((subtopic, index) => {
            const isCompleted = completedLessonIds.has(`${topic.id}:${subtopic.id}`);

            return (
              <Pressable
                accessibilityLabel={`${subtopic.title}, ${isCompleted ? 'completed' : 'not completed'}`}
                accessibilityRole="button"
                key={subtopic.id}
                onPress={() =>
                  router.push({
                    pathname: '/topic/[topicId]/[subtopicId]',
                    params: { topicId: topic.id, subtopicId: subtopic.id },
                  })
                }
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: isCompleted ? '#F0FDF4' : colors.card,
                    borderColor: isCompleted ? '#22C55E' : colors.border,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.numberBadge, { backgroundColor: isCompleted ? '#22C55E' : `${topic.colour}24` }]}>
                  <Text style={[styles.numberText, { color: isCompleted ? '#FFFFFF' : topic.colour }]}>{isCompleted ? '✓' : index + 1}</Text>
                </View>
                <View style={styles.cardText}>
                  <AppText variant="label">{subtopic.title}</AppText>
                  <AppText muted variant="caption">
                    {isCompleted ? 'Completed' : 'Not completed yet'}
                  </AppText>
                </View>
                <View style={[styles.statusPill, { backgroundColor: isCompleted ? '#DCFCE7' : colors.cardAlt }]}>
                  <AppText color={isCompleted ? '#166534' : colors.muted} variant="caption">
                    {isCompleted ? 'Done' : 'To do'}
                  </AppText>
                </View>
                <Text style={[styles.chevron, { color: colors.muted }]}>›</Text>
              </Pressable>
            );
          })}
        </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 20,
    padding: 24,
    gap: 8,
  },
  icon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  list: {
    gap: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  numberBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 16,
    fontWeight: '900',
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  statusPill: {
    minWidth: 52,
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chevron: {
    fontSize: 30,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 16,
  },
});
