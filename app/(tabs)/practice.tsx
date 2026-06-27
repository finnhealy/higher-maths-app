import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { TopicCard } from '@/components/TopicCard';
import { topicLessons } from '@/data/lessonContent';
import { getQuestionsForTopic } from '@/data/sampleQuestions';
import { useAppTheme } from '@/lib/theme';

export default function PracticeLauncherScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Practice questions</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
          Refine your skills with a range of questions.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Quick start</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Jump into a mixed set from the first available topic.</Text>
          <PrimaryButton
            title="Start practice"
            onPress={() =>
              router.push({
                pathname: '/practice/[topicId]',
                params: { topicId: topicLessons[0].id, seed: String(Date.now()) },
              })
            }
          />
        </View>

        <View style={styles.list}>
          {topicLessons.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              completed={0}
              total={getQuestionsForTopic(topic.id).length}
              onPress={() =>
                router.push({
                  pathname: '/practice/[topicId]',
                  params: { topicId: topic.id, seed: String(Date.now()) },
                })
              }
            />
          ))}
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
    gap: 18,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    gap: 12,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  list: {
    gap: 12,
  },
});
