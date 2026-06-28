import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { TopicCard } from '@/components/TopicCard';
import { topicLessons } from '@/data/lessonContent';
import { getQuestionsForTopic } from '@/data/sampleQuestions';

export default function PracticeLauncherScreen() {
  const router = useRouter();
  return (
    <Screen>
        <SectionHeader title="Practice questions" subtitle="Refine your skills with a range of questions." />

        <Card>
          <AppText variant="subheading">Quick start</AppText>
          <AppText muted>Jump into a mixed set from the first available topic.</AppText>
          <PrimaryButton
            title="Start practice"
            onPress={() =>
              router.push({
                pathname: '/practice/[topicId]',
                params: { topicId: topicLessons[0].id, seed: String(Date.now()) },
              })
            }
          />
        </Card>

        <View style={styles.list}>
          {topicLessons.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              completed={0}
              total={getQuestionsForTopic(topic.id).length}
              metricLabel="questions"
              onPress={() =>
                router.push({
                  pathname: '/practice/[topicId]',
                  params: { topicId: topic.id, seed: String(Date.now()) },
                })
              }
            />
          ))}
        </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
});
