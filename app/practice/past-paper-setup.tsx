import { useLocalSearchParams, useRouter } from 'expo-router';
import { ReactNode, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { SelectableChip } from '@/components/SelectableChip';
import { topicLessons } from '@/data/lessonContent';
import { TopicId } from '@/types/maths';

const years = ['2025', '2024', '2023', '2022', '2021'] as const;
const papers = ['Paper 1', 'Paper 2'] as const;
const questionCounts = ['10', '25', '50', 'Unlimited'] as const;

type YearOption = (typeof years)[number];
type PaperOption = (typeof papers)[number];
type QuestionCountOption = (typeof questionCounts)[number];

export default function PastPaperSetupScreen() {
  const router = useRouter();
  const { topicIds = '' } = useLocalSearchParams<{ topicIds?: string }>();
  const selectedTopics = useMemo(() => parseTopicIds(topicIds), [topicIds]);
  const [selectedYears, setSelectedYears] = useState<YearOption[]>([]);
  const [selectedPapers, setSelectedPapers] = useState<PaperOption[]>([]);
  const [questionCount, setQuestionCount] = useState<QuestionCountOption>('10');

  const topicSummary = selectedTopics.length
    ? topicLessons
        .filter((topic) => selectedTopics.includes(topic.id))
        .map((topic) => topic.title)
        .join(', ')
    : 'No topics selected';

  function toggleYear(year: YearOption) {
    setSelectedYears((current) => toggleValue(current, year));
  }

  function togglePaper(paper: PaperOption) {
    setSelectedPapers((current) => toggleValue(current, paper));
  }

  return (
    <Screen>
      <SectionHeader title="Set up question bank" subtitle="Add optional filters before starting your past paper practice." />

      <Card gap="sm">
        <AppText variant="label">Selected topics</AppText>
        <AppText muted>{topicSummary}</AppText>
      </Card>

      <FilterSection title="Years">
        {years.map((year) => (
          <SelectableChip key={year} label={year} selected={selectedYears.includes(year)} onPress={() => toggleYear(year)} />
        ))}
      </FilterSection>

      <FilterSection title="Paper">
        {papers.map((paper) => (
          <SelectableChip key={paper} label={paper} selected={selectedPapers.includes(paper)} onPress={() => togglePaper(paper)} />
        ))}
      </FilterSection>

      <FilterSection title="Question Count">
        {questionCounts.map((count) => (
          <SelectableChip key={count} label={count} selected={questionCount === count} onPress={() => setQuestionCount(count)} />
        ))}
      </FilterSection>

      <PrimaryButton title="Start" onPress={() => router.push('/practice/past-paper-empty')} />
    </Screen>
  );
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card gap="sm">
      <AppText variant="subheading">{title}</AppText>
      <View style={styles.chips}>{children}</View>
    </Card>
  );
}

function parseTopicIds(topicIds: string): TopicId[] {
  const validIds = new Set(topicLessons.map((topic) => topic.id));

  return topicIds
    .split(',')
    .filter((id): id is TopicId => validIds.has(id as TopicId));
}

function toggleValue<T extends string>(values: T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
