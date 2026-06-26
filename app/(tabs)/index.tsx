import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { ProgressBar } from '@/components/ProgressBar';
import { TopicCard } from '@/components/TopicCard';
import { topicLessons, topics } from '@/data/lessonContent';
import { sampleQuestions } from '@/data/sampleQuestions';
import { getProgress, getTopicCompletionTarget } from '@/lib/storage';
import { useAppTheme } from '@/lib/theme';
import { UserProgress } from '@/types/maths';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const [progress, setProgress] = useState<UserProgress>();

  useFocusEffect(
    useCallback(() => {
      getProgress().then(setProgress);
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <View>
            <Text style={styles.eyebrow}>Scottish Higher</Text>
            <Text style={styles.title}>Ready for a sharp maths session?</Text>
            <Text style={styles.subtitle}>Practise topic by topic, keep your streak moving, and spot the areas worth revising next.</Text>
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

        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.summaryHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Progress summary</Text>
            <Text style={[styles.summaryPercent, { color: colors.primary }]}>{overallProgress}%</Text>
          </View>
          <ProgressBar progress={overallProgress} colour="#2563EB" />
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: colors.cardAlt }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>{completed}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Answered</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.cardAlt }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>{correct}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Correct</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.cardAlt }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>{accuracy}%</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Accuracy</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick lessons</Text>
          <Text style={[styles.link, { color: colors.primary }]} onPress={() => router.push('/topics')}>
            View all
          </Text>
        </View>

        <View style={styles.topicList}>
          {topicLessons.slice(0, 4).map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              completed={topic.subtopics.length}
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

        <View style={[styles.authCard, { backgroundColor: isDark ? '#0B2532' : '#ECFEFF', borderColor: isDark ? '#155E75' : '#BAE6FD' }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Guest mode is on</Text>
          <Text style={[styles.muted, { color: colors.muted }]}>Your progress is saved on this device. Sign in to sync with Supabase.</Text>
          <PrimaryButton title="Account settings" variant="secondary" onPress={() => router.push('/account')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
    gap: 20,
  },
  hero: {
    gap: 18,
    borderRadius: 28,
    backgroundColor: '#0F172A',
    padding: 22,
  },
  eyebrow: {
    color: '#7DD3FC',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    marginTop: 8,
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  summaryCard: {
    gap: 16,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '900',
  },
  summaryPercent: {
    fontSize: 20,
    fontWeight: '900',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  link: {
    fontSize: 14,
    fontWeight: '900',
  },
  topicList: {
    gap: 12,
  },
  authCard: {
    gap: 12,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
  },
  muted: {
    fontSize: 14,
    lineHeight: 20,
  },
});
