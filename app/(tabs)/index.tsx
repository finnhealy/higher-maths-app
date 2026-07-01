import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { StatTile } from '@/components/StatTile';
import { TopicCard } from '@/components/TopicCard';
import { topicLessons, topics } from '@/data/lessonContent';
import { sampleQuestions } from '@/data/sampleQuestions';
import { getGardenState, getProgress, getTopicCompletionTarget } from '@/lib/storage';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAppTheme } from '@/lib/theme';
import { GardenState, TopicId, UserProgress } from '@/types/maths';

function getCompletedLessonsForTopic(garden: GardenState | undefined, topicId: TopicId) {
  return garden?.rewardedLessonIds.filter((lessonId) => lessonId.startsWith(`${topicId}:`)).length ?? 0;
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark, radii } = useAppTheme();
  const [progress, setProgress] = useState<UserProgress>();
  const [garden, setGarden] = useState<GardenState>();
  const [signedInAs, setSignedInAs] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        getProgress(),
        getGardenState(),
        isSupabaseConfigured ? supabase.auth.getUser() : Promise.resolve({ data: { user: null } }),
      ]).then(([nextProgress, nextGarden, auth]) => {
        setProgress(nextProgress);
        setGarden(nextGarden);
        const user = auth.data.user;
        setSignedInAs(user?.email?.split('@')[0] ?? user?.email ?? null);
      });
    }, []),
  );

  const completed = progress ? Object.values(progress.topics).reduce((sum, item) => sum + item.completed, 0) : 0;
  const correct = progress ? Object.values(progress.topics).reduce((sum, item) => sum + item.correct, 0) : 0;
  const accuracy = completed === 0 ? 0 : Math.round((correct / completed) * 100);
  const overallProgress = Math.min(100, Math.round((completed / sampleQuestions.length) * 100));
  const firstUnfinishedTopic = topics.find((topic) => {
    const topicProgress = progress?.topics[topic.id]?.completed ?? 0;
    return topicProgress < getTopicCompletionTarget(topic.id);
  }) ?? topics[0];

  return (
    <Screen>
      <View style={[styles.hero, { borderRadius: radii.xl }]}>
        <View>
          <AppText color="#7DD3FC" variant="label" style={styles.eyebrow}>
            Scottish Higher
          </AppText>
          <AppText color="#FFFFFF" variant="title" style={styles.heroTitle}>
            Ready for a sharp maths session?
          </AppText>
          <AppText color="#CBD5E1">Practise topic by topic, keep your streak moving, and spot the areas worth revising next.</AppText>
        </View>
        <PrimaryButton
          title="Continue practice"
          onPress={() =>
            router.push({
              pathname: '/practice/[topicId]',
              params: { topicId: firstUnfinishedTopic.id, seed: String(Date.now()) },
            })
          }
        />
      </View>

      <Card>
        <View style={styles.summaryHeader}>
          <AppText variant="subheading">Progress summary</AppText>
          <AppText color={colors.primary} variant="subheading">
            {overallProgress}%
          </AppText>
        </View>
        <ProgressBar progress={overallProgress} colour="#2563EB" />
        <View style={styles.statsGrid}>
          <StatTile label="Answered" value={completed} style={styles.statBox} />
          <StatTile label="Correct" value={correct} style={styles.statBox} />
          <StatTile label="Accuracy" value={`${accuracy}%`} style={styles.statBox} />
        </View>
      </Card>

      <SectionHeader title="Quick lessons" actionLabel="View all" onAction={() => router.push('/topics')} />

      <View style={styles.topicList}>
        {topicLessons.slice(0, 4).map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            completed={getCompletedLessonsForTopic(garden, topic.id)}
            total={topic.subtopics.length}
            onPress={() =>
              router.push({
                pathname: '/topic/[topicId]',
                params: { topicId: topic.id },
              })
            }
          />
        ))}
      </View>

      <Card style={{ backgroundColor: isDark ? '#0B2532' : '#ECFEFF', borderColor: isDark ? '#155E75' : '#BAE6FD' }}>
        <AppText variant="subheading">{signedInAs ? `Signed in as ${signedInAs}` : 'Guest mode is on'}</AppText>
        <AppText muted>
          {signedInAs ? 'Your progress, coins, lessons, and garden are syncing with your account.' : 'Your progress is saved on this device. Sign in to sync across devices.'}
        </AppText>
        <PrimaryButton title="Account settings" variant="secondary" onPress={() => router.push('/account')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 16,
    backgroundColor: '#0F172A',
    padding: 24,
  },
  eyebrow: {
    textTransform: 'uppercase',
  },
  heroTitle: {
    marginTop: 8,
    marginBottom: 8,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
  },
  topicList: {
    gap: 8,
  },
});
