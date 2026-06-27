import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { topics } from '@/data/lessonContent';
import { getProgress } from '@/lib/storage';
import { useAppTheme } from '@/lib/theme';
import { TopicId, UserProgress } from '@/types/maths';

export default function ResultsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ score?: string; total?: string; topicId?: TopicId }>();
  const [progress, setProgress] = useState<UserProgress>();

  useFocusEffect(
    useCallback(() => {
      getProgress().then(setProgress);
    }, []),
  );

  const score = Number(params.score ?? 0);
  const total = Number(params.total ?? 0);
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const weakTopics = progress
    ? topics
        .map((topic) => {
          const topicProgress = progress.topics[topic.id];
          const attempts = topicProgress.correct + topicProgress.incorrect;
          const accuracy = attempts > 0 ? Math.round((topicProgress.correct / attempts) * 100) : 100;
          return { topic, attempts, accuracy };
        })
        .filter((item) => item.attempts > 0 && item.accuracy < 70)
        .sort((first, second) => first.accuracy - second.accuracy)
        .slice(0, 3)
    : [];
  const nextTopic = weakTopics[0]?.topic ?? topics.find((topic) => topic.id === params.topicId) ?? topics[0];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={[]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Results</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {total > 0 ? `You scored ${score} out of ${total}.` : 'Complete a practice round to see your latest score.'}
          </Text>
          <Text style={[styles.score, { color: colors.primary }]}>{percentage}%</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Revise next</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {weakTopics.length > 0 ? 'These topics are worth another look.' : 'No weak topics yet. Keep practising to build a clearer picture.'}
          </Text>
          <View style={styles.topicList}>
            {(weakTopics.length > 0 ? weakTopics : [{ topic: nextTopic, attempts: 0, accuracy: 0 }]).map((item) => (
              <View key={item.topic.id} style={[styles.topicRow, { backgroundColor: colors.cardAlt }]}>
                <Text style={[styles.topicName, { color: colors.text }]}>{item.topic.title}</Text>
                <Text style={[styles.topicMeta, { color: colors.muted }]}>
                  {item.attempts > 0 ? `${item.accuracy}% accuracy` : 'Recommended start'}
                </Text>
              </View>
            ))}
          </View>
          <PrimaryButton
            title={`Practise ${nextTopic.title}`}
            onPress={() =>
              router.push({
                pathname: '/practice/[topicId]',
                params: { topicId: nextTopic.id, seed: String(Date.now()) },
              })
            }
          />
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
    gap: 16,
  },
  card: {
    gap: 14,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  score: {
    fontSize: 42,
    fontWeight: '900',
  },
  topicList: {
    gap: 8,
  },
  topicRow: {
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  topicName: {
    fontSize: 16,
    fontWeight: '900',
  },
  topicMeta: {
    fontSize: 13,
    fontWeight: '800',
  },
});
