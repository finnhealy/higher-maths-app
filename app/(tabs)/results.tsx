import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { ProgressBar } from '@/components/ProgressBar';
import { topics } from '@/data/lessonContent';
import { getProgress } from '@/lib/storage';
import { useAppTheme } from '@/lib/theme';
import { TopicId, UserProgress } from '@/types/maths';

export default function ResultsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { score = '0', total = '0', topicId } = useLocalSearchParams<{
    score?: string;
    total?: string;
    topicId?: TopicId;
  }>();
  const [progress, setProgress] = useState<UserProgress>();

  useFocusEffect(
    useCallback(() => {
      getProgress().then(setProgress);
    }, []),
  );

  const scoreNumber = Number(score);
  const totalNumber = Number(total);
  const percent = totalNumber === 0 ? 0 : Math.round((scoreNumber / totalNumber) * 100);
  const weakTopics = useMemo(() => {
    if (!progress) {
      return [];
    }

    return topics
      .map((topic) => {
        const topicProgress = progress.topics[topic.id];
        const attempted = topicProgress.correct + topicProgress.incorrect;
        const accuracy = attempted === 0 ? 100 : Math.round((topicProgress.correct / attempted) * 100);
        return { topic, attempted, accuracy };
      })
      .filter((item) => item.attempted > 0 && item.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);
  }, [progress]);

  const recommendedTopic = weakTopics[0]?.topic ?? topics.find((topic) => topic.id !== topicId) ?? topics[0];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Session complete</Text>
          <Text style={styles.title}>
            {scoreNumber} / {totalNumber}
          </Text>
          <Text style={styles.subtitle}>{percent >= 80 ? 'Strong work. Keep the momentum.' : 'Good practice. The next revision target is clearer now.'}</Text>
          <ProgressBar progress={percent} colour={percent >= 70 ? '#16A34A' : '#F97316'} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Weak topics</Text>
          {weakTopics.length === 0 ? (
            <Text style={[styles.body, { color: colors.muted }]}>No weak topics yet. Complete a few more questions to build a useful picture.</Text>
          ) : (
            weakTopics.map(({ topic, accuracy }) => (
              <View key={topic.id} style={styles.weakRow}>
                <View style={[styles.icon, { backgroundColor: `${topic.colour}1F` }]}>
                  <Text style={[styles.iconText, { color: topic.colour }]}>{topic.icon}</Text>
                </View>
                <View style={styles.weakText}>
                  <Text style={[styles.weakTitle, { color: colors.text }]}>{topic.title}</Text>
                  <Text style={[styles.body, { color: colors.muted }]}>{accuracy}% accuracy</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Revise next</Text>
          <Text style={[styles.body, { color: colors.muted }]}>{recommendedTopic.title} is the best next practice target based on your saved progress.</Text>
          <PrimaryButton
            title={`Practise ${recommendedTopic.title}`}
            onPress={() =>
              router.replace({
                pathname: '/practice/[topicId]',
                params: { topicId: recommendedTopic.id, seed: String(Date.now()) },
              })
            }
          />
        </View>

        <PrimaryButton title="Back home" variant="secondary" onPress={() => router.replace('/')} />
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
    gap: 18,
  },
  hero: {
    gap: 14,
    borderRadius: 28,
    backgroundColor: '#111827',
    padding: 22,
  },
  eyebrow: {
    color: '#93C5FD',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 52,
    fontWeight: '900',
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    gap: 14,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  weakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontWeight: '900',
  },
  weakText: {
    flex: 1,
  },
  weakTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
});
