import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { getTopic } from '@/data/lessonContent';
import { useAppTheme } from '@/lib/theme';
import { TopicId } from '@/types/maths';

export default function TopicSubtopicsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { topicId } = useLocalSearchParams<{ topicId: TopicId }>();
  const topic = getTopic(topicId);

  if (!topic) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['bottom']}>
        <View style={styles.empty}>
          <Text style={[styles.title, { color: colors.text }]}>Topic not found</Text>
          <PrimaryButton title="Back to lessons" onPress={() => router.replace('/topics')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: topic.title }} />
      <ScrollView contentContainerStyle={styles.container}>
        <PrimaryButton title="Back to topics" variant="secondary" onPress={() => router.back()} />

        <View style={[styles.hero, { backgroundColor: topic.colour }]}>
          <Text style={styles.icon}>{topic.icon}</Text>
          <Text style={styles.heroTitle}>{topic.title}</Text>
          <Text style={styles.heroSubtitle}>{topic.description}</Text>
        </View>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Subtopics</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Choose a mini lesson to open the introduction, example, and check question.</Text>
        </View>

        <View style={styles.list}>
          {topic.subtopics.map((subtopic, index) => (
            <Pressable
              accessibilityRole="button"
              key={subtopic.id}
              onPress={() =>
                router.push({
                  pathname: '/topic/[topicId]/[subtopicId]',
                  params: { topicId: topic.id, subtopicId: subtopic.id },
                })
              }
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.numberBadge, { backgroundColor: `${topic.colour}24` }]}>
                <Text style={[styles.numberText, { color: topic.colour }]}>{index + 1}</Text>
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{subtopic.title}</Text>
              </View>
              <Text style={[styles.chevron, { color: colors.muted }]}>›</Text>
            </Pressable>
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
  hero: {
    borderRadius: 26,
    padding: 22,
    gap: 8,
  },
  icon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
  },
  heroSubtitle: {
    color: '#E0F2FE',
    fontSize: 15,
    lineHeight: 22,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  numberBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 16,
    fontWeight: '900',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  chevron: {
    fontSize: 30,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 16,
  },
});
