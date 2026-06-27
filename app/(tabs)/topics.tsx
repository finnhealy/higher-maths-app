import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TopicCard } from '@/components/TopicCard';
import { topicLessons } from '@/data/lessonContent';
import { getGardenState } from '@/lib/storage';
import { useAppTheme } from '@/lib/theme';
import { GardenState, TopicId } from '@/types/maths';

function getCompletedLessonsForTopic(garden: GardenState | undefined, topicId: TopicId) {
  return garden?.rewardedLessonIds.filter((lessonId) => lessonId.startsWith(`${topicId}:`)).length ?? 0;
}

export default function TopicsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [garden, setGarden] = useState<GardenState>();

  useFocusEffect(
    useCallback(() => {
      getGardenState().then(setGarden);
    }, []),
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Start Learning</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Use these lessons to revise your knowledge of Higher Maths topics.
          </Text>
        </View>

       

        <View style={styles.list}>
          {topicLessons.map((topic) => (
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
  tipCard: {
    gap: 8,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  list: {
    gap: 12,
  },
});
