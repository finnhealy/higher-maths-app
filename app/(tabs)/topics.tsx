import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { TopicCard } from '@/components/TopicCard';
import { topicLessons } from '@/data/lessonContent';
import { getGardenState } from '@/lib/storage';
import { GardenState, TopicId } from '@/types/maths';

function getCompletedLessonsForTopic(garden: GardenState | undefined, topicId: TopicId) {
  return garden?.rewardedLessonIds.filter((lessonId) => lessonId.startsWith(`${topicId}:`)).length ?? 0;
}

export default function TopicsScreen() {
  const router = useRouter();
  const [garden, setGarden] = useState<GardenState>();

  useFocusEffect(
    useCallback(() => {
      getGardenState().then(setGarden);
    }, []),
  );

  return (
    <Screen>
        <SectionHeader
          title="Start Learning"
          subtitle="Use these lessons to revise your knowledge of Higher Maths topics."
        />

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
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
});
