import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { topicLessons } from '@/data/lessonContent';
import { useAppTheme } from '@/lib/theme';
import { TopicId } from '@/types/maths';

export default function PastPaperTopicSelectionScreen() {
  const router = useRouter();
  const { colors, radii, shadows } = useAppTheme();
  const [selectedTopicIds, setSelectedTopicIds] = useState<TopicId[]>([]);

  const hasSelection = selectedTopicIds.length > 0;

  function toggleTopic(topicId: TopicId) {
    setSelectedTopicIds((current) =>
      current.includes(topicId) ? current.filter((id) => id !== topicId) : [...current, topicId],
    );
  }

  function continueToSetup() {
    router.push(`/practice/past-paper-setup?topicIds=${encodeURIComponent(selectedTopicIds.join(','))}`);
  }

  return (
    <Screen>
      <SectionHeader title="Past Paper Question Bank" subtitle="Choose one or more topics for your custom paper question set." />

      <Card padding="sm" gap="sm">
        <View style={styles.actionRow}>
          <PrimaryButton
            title="Select All"
            variant="secondary"
            style={styles.actionButton}
            onPress={() => setSelectedTopicIds(topicLessons.map((topic) => topic.id))}
          />
          <PrimaryButton
            title="Clear"
            variant="ghost"
            style={styles.actionButton}
            onPress={() => setSelectedTopicIds([])}
          />
        </View>
        <AppText muted variant="caption">
          {selectedTopicIds.length} of {topicLessons.length} topics selected
        </AppText>
      </Card>

      <View style={styles.list}>
        {topicLessons.map((topic) => {
          const selected = selectedTopicIds.includes(topic.id);

          return (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              key={topic.id}
              onPress={() => toggleTopic(topic.id)}
              style={({ pressed }) => [
                styles.topicCard,
                { backgroundColor: colors.card, borderColor: selected ? topic.colour : colors.border, borderRadius: radii.xl },
                shadows.card,
                selected && { borderWidth: 2 },
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.topicIcon, { backgroundColor: `${topic.colour}1F`, borderRadius: radii.lg }]}>
                <Text style={[styles.topicIconText, { color: topic.colour }]}>{topic.icon}</Text>
              </View>
              <View style={styles.topicCopy}>
                <AppText variant="subheading">{topic.title}</AppText>
                <AppText muted>{topic.description}</AppText>
              </View>
              <View
                style={[
                  styles.check,
                  {
                    backgroundColor: selected ? topic.colour : 'transparent',
                    borderColor: selected ? topic.colour : colors.border,
                    borderRadius: radii.pill,
                  },
                ]}
              >
                {selected ? <Text style={styles.checkText}>✓</Text> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <PrimaryButton disabled={!hasSelection} title="Continue" onPress={continueToSetup} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  list: {
    gap: 8,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderWidth: 1,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  topicIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicIconText: {
    fontSize: 16,
    fontWeight: '900',
  },
  topicCopy: {
    flex: 1,
    gap: 4,
  },
  check: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
