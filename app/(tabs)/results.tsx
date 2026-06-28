import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { topics } from '@/data/lessonContent';
import { getProgress } from '@/lib/storage';
import { useAppTheme } from '@/lib/theme';
import { TopicId, UserProgress } from '@/types/maths';

export default function ResultsScreen() {
  const router = useRouter();
  const { colors, radii } = useAppTheme();
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
    <Screen>
        <Card>
          <AppText variant="title">Results</AppText>
          <AppText muted>
            {total > 0 ? `You scored ${score} out of ${total}.` : 'Complete a practice round to see your latest score.'}
          </AppText>
          <AppText color={colors.primary} style={styles.score}>{percentage}%</AppText>
        </Card>

        <Card>
          <AppText variant="subheading">Revise next</AppText>
          <AppText muted>
            {weakTopics.length > 0 ? 'These topics are worth another look.' : 'No weak topics yet. Keep practising to build a clearer picture.'}
          </AppText>
          <View style={styles.topicList}>
            {(weakTopics.length > 0 ? weakTopics : [{ topic: nextTopic, attempts: 0, accuracy: 0 }]).map((item) => (
              <View key={item.topic.id} style={[styles.topicRow, { backgroundColor: colors.cardAlt, borderRadius: radii.lg }]}>
                <AppText variant="label">{item.topic.title}</AppText>
                <AppText muted variant="caption">
                  {item.attempts > 0 ? `${item.accuracy}% accuracy` : 'Recommended start'}
                </AppText>
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
        </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  score: {
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '800',
  },
  topicList: {
    gap: 8,
  },
  topicRow: {
    padding: 16,
    gap: 4,
  },
});
