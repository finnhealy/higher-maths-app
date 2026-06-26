import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TopicCard } from '@/components/TopicCard';
import { topicLessons } from '@/data/lessonContent';
import { useAppTheme } from '@/lib/theme';

export default function TopicsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['bottom']}>
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
