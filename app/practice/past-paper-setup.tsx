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
import { getAvailablePastPaperPapers, getAvailablePastPaperYears, getPastPaperQuestions } from '@/data/pastPaperQuestions';
import { TopicId } from '@/types/maths';

const questionCounts = ['10', '25', '50', 'Unlimited'] as const;

type QuestionCountOption = (typeof questionCounts)[number];

export default function PastPaperSetupScreen() {
  const router = useRouter();
  const { topicIds = '' } = useLocalSearchParams<{ topicIds?: string }>();
  const selectedTopics = useMemo(() => parseTopicIds(topicIds), [topicIds]);
  const years = useMemo(() => getAvailablePastPaperYears(), []);
  const papers = useMemo(() => getAvailablePastPaperPapers(), []);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedPapers, setSelectedPapers] = useState<(1 | 2)[]>([]);
  const [questionCount, setQuestionCount] = useState<QuestionCountOption>('10');
  const matchingQuestionCount = getPastPaperQuestions({
    topicIds: selectedTopics,
    years: selectedYears,
    papers: selectedPapers,
    limit: getQuestionLimit(questionCount),
  }).length;

  const topicSummary = selectedTopics.length
    ? topicLessons
        .filter((topic) => selectedTopics.includes(topic.id))
        .map((topic) => topic.title)
        .join(', ')
    : 'No topics selected';

  function toggleYear(year: number) {
    setSelectedYears((current) => toggleValue(current, year));
  }

  function togglePaper(paper: 1 | 2) {
    setSelectedPapers((current) => toggleValue(current, paper));
  }

  function startPractice() {
    router.push({
      pathname: '/practice/past-paper-session',
      params: {
        topicIds: selectedTopics.join(','),
        years: selectedYears.join(','),
        papers: selectedPapers.join(','),
        count: questionCount,
        seed: String(Date.now()),
      },
    });
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
          <SelectableChip key={year} label={String(year)} selected={selectedYears.includes(year)} onPress={() => toggleYear(year)} />
        ))}
      </FilterSection>

      <FilterSection title="Paper">
        {papers.map((paper) => (
          <SelectableChip key={paper} label={`Paper ${paper}`} selected={selectedPapers.includes(paper)} onPress={() => togglePaper(paper)} />
        ))}
      </FilterSection>

      <FilterSection title="Question Count">
        {questionCounts.map((count) => (
          <SelectableChip key={count} label={count} selected={questionCount === count} onPress={() => setQuestionCount(count)} />
        ))}
      </FilterSection>

      <PrimaryButton
        disabled={matchingQuestionCount === 0}
        title={matchingQuestionCount === 0 ? 'No matching questions' : `Start ${matchingQuestionCount} questions`}
        onPress={startPractice}
      />
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

function toggleValue<T extends number | string>(values: T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function getQuestionLimit(questionCount: QuestionCountOption) {
  return questionCount === 'Unlimited' ? undefined : Number(questionCount);
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
