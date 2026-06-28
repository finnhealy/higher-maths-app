import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { CoinEarnedPopup } from '@/components/CoinEarnedPopup';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProgressBar } from '@/components/ProgressBar';
import { QuestionCard, QuestionCardHandle } from '@/components/QuestionCard';
import { Screen } from '@/components/Screen';
import { getQuestionsForTopic, getTopic } from '@/data/sampleQuestions';
import { topicLessons } from '@/data/lessonContent';
import { playFeedback } from '@/lib/feedback';
import { getQuestionReward, recordAttempt } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/lib/theme';
import { Question, TopicId } from '@/types/maths';

export default function TopicBankSessionScreen() {
  const router = useRouter();
  const { colors, radii } = useAppTheme();
  const questionCardRef = useRef<QuestionCardHandle>(null);
  const { topicIds = '', seed = topicIds } = useLocalSearchParams<{ topicIds?: string; seed?: string }>();
  const selectedTopicIds = useMemo(() => parseTopicIds(topicIds), [topicIds]);
  const questions = useMemo(
    () => seededShuffle(selectedTopicIds.flatMap((topicId) => getQuestionsForTopic(topicId)), String(seed)),
    [seed, selectedTopicIds],
  );
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answeredCurrent, setAnsweredCurrent] = useState(false);
  const [coinPopup, setCoinPopup] = useState({ amount: 0, key: 0 });

  const question = questions[index];
  const topic = question ? getTopic(question.topicId) : undefined;
  const isMixed = selectedTopicIds.length > 1;
  const title = isMixed ? 'Mixed Topic Practice' : topic?.title ?? 'Topic Practice';
  const progress = questions.length === 0 ? 0 : Math.round(((index + (answeredCurrent ? 1 : 0)) / questions.length) * 100);

  async function handleAnswer(answerGiven: string, isCorrect: boolean) {
    if ((answeredCurrent && isCorrect) || !question) {
      return;
    }

    const { data } = await supabase.auth.getUser();
    await recordAttempt({
      id: `${Date.now()}-${question.id}`,
      userId: data.user?.id,
      topicId: question.topicId,
      questionId: question.id,
      answerGiven,
      isCorrect,
      answeredAt: new Date().toISOString(),
    });

    if (!isCorrect) {
      setStreak(0);
      return;
    }

    setAnsweredCurrent(true);
    setScore((value) => value + 1);
    setStreak((value) => {
      const next = value + 1;
      setBestStreak((best) => Math.max(best, next));
      return next;
    });
    playFeedback('coin');
    setCoinPopup({ amount: getQuestionReward(), key: Date.now() });
  }

  function goNext() {
    if (index < questions.length - 1) {
      setIndex((value) => value + 1);
      setAnsweredCurrent(false);
      return;
    }

    router.replace({
      pathname: '/(tabs)/results',
      params: {
        score: String(score),
        total: String(questions.length),
        topicId: selectedTopicIds[0] ?? question?.topicId,
      },
    });
  }

  if (!question || !topic) {
    return (
      <Screen edges={['bottom']} scroll={false} contentContainerStyle={styles.empty}>
        <EmptyState title="No questions found" action={<PrimaryButton title="Back to Topic Bank" onPress={() => router.replace('/practice/topic-bank')} />} />
      </Screen>
    );
  }

  return (
    <Screen
      edges={['bottom']}
      overlay={<CoinEarnedPopup amount={coinPopup.amount} animationKey={coinPopup.key} />}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
      onScrollBeginDrag={() => questionCardRef.current?.dismissKeyboard()}
    >
      <Card padding="sm" gap="sm" style={styles.header}>
        <View style={[styles.topicIcon, { backgroundColor: `${topic.colour}1F`, borderRadius: radii.md }]}>
          <Text style={[styles.topicIconText, { color: topic.colour }]}>{isMixed ? 'M' : topic.icon}</Text>
        </View>
        <View style={styles.headerCopy}>
          <AppText numberOfLines={1} variant="label">
            {title}
          </AppText>
          {isMixed ? (
            <AppText muted numberOfLines={1} variant="caption">
              Current: {topic.title}
            </AppText>
          ) : null}
        </View>
        <View style={styles.headerProgress}>
          <ProgressBar progress={progress} colour={isMixed ? colors.primary : topic.colour} />
        </View>
      </Card>

      <QuestionCard ref={questionCardRef} key={question.id} question={question} onAnswer={handleAnswer} />

      <View style={styles.footer}>
        <AppText align="center" muted variant="label">
          Score: {score} / {questions.length} · Best streak {bestStreak}
        </AppText>

        <PrimaryButton title={index < questions.length - 1 ? 'Next question' : 'Finish practice'} disabled={!answeredCurrent} onPress={goNext} />
        <PrimaryButton variant="secondary" title="Skip" onPress={goNext} />
      </View>
    </Screen>
  );
}

function parseTopicIds(topicIds: string): TopicId[] {
  const validIds = new Set(topicLessons.map((topic) => topic.id));

  return topicIds
    .split(',')
    .filter((id): id is TopicId => validIds.has(id as TopicId));
}

function seededShuffle(questions: Question[], seedValue: string) {
  const shuffled = [...questions];
  let seed = Array.from(seedValue).reduce((total, char) => total + char.charCodeAt(0), 0) || 1;

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = seed % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicIconText: {
    fontSize: 15,
    fontWeight: '900',
  },
  headerCopy: {
    flex: 1,
  },
  headerProgress: {
    width: 96,
  },
  footer: {
    gap: 8,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 16,
  },
});
