import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { CoinEarnedPopup } from '@/components/CoinEarnedPopup';
import { EmptyState } from '@/components/EmptyState';
import { PastPaperQuestionCard, PastPaperQuestionCardHandle } from '@/components/PastPaperQuestionCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen, ScreenHandle } from '@/components/Screen';
import { getTopic, topicLessons } from '@/data/lessonContent';
import { getPracticePastPaperQuestions } from '@/data/pastPaperQuestions';
import { playFeedback } from '@/lib/feedback';
import { getQuestionReward, recordAttempt } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/lib/theme';
import { Question, TopicId } from '@/types/maths';

type SearchParamValue = string | string[];

export default function PastPaperSessionScreen() {
  const router = useRouter();
  const { radii } = useAppTheme();
  const screenRef = useRef<ScreenHandle>(null);
  const questionCardRef = useRef<PastPaperQuestionCardHandle>(null);
  const { topicIds = '', years = '', papers = '', count = '10', seed = topicIds } = useLocalSearchParams<{
    topicIds?: SearchParamValue;
    years?: SearchParamValue;
    papers?: SearchParamValue;
    count?: SearchParamValue;
    seed?: SearchParamValue;
  }>();
  const selectedTopicIds = useMemo(() => parseTopicIds(topicIds), [topicIds]);
  const selectedYears = useMemo(() => parseNumbers(years), [years]);
  const selectedPapers = useMemo(() => parsePapers(papers), [papers]);
  const questionCount = getSearchParamString(count);
  const limit = questionCount === 'Unlimited' ? undefined : Number(questionCount);
  const questions = useMemo(
    () =>
      seededShuffle(
        getPracticePastPaperQuestions({
          topicIds: selectedTopicIds,
          years: selectedYears,
          papers: selectedPapers,
          limit: Number.isFinite(limit) ? limit : undefined,
        }),
        getSearchParamString(seed),
      ),
    [limit, seed, selectedPapers, selectedTopicIds, selectedYears],
  );
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answeredCurrent, setAnsweredCurrent] = useState(false);
  const [mathKeyboardVisible, setMathKeyboardVisible] = useState(false);
  const [coinPopup, setCoinPopup] = useState({ amount: 0, key: 0 });

  const question = questions[index];
  const topic = question ? getTopic(question.topicId) : undefined;
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
        <EmptyState
          title="No past paper questions found"
          message="Try changing the selected topics, year, paper, or question count."
          action={<PrimaryButton title="Back to Setup" onPress={() => router.replace('/practice/past-paper-setup')} />}
        />
      </Screen>
    );
  }

  return (
    <Screen
      edges={['bottom']}
      overlay={<CoinEarnedPopup amount={coinPopup.amount} animationKey={coinPopup.key} />}
      ref={screenRef}
      contentContainerStyle={[styles.container, mathKeyboardVisible && styles.keyboardOpenContainer]}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
      onScrollBeginDrag={() => questionCardRef.current?.dismissKeyboard()}
    >
      <Card padding="sm" gap="sm" style={styles.header}>
        <View style={[styles.topicIcon, { backgroundColor: `${topic.colour}1F`, borderRadius: radii.md }]}>
          <Text style={[styles.topicIconText, { color: topic.colour }]}>P{question.paper}</Text>
        </View>
        <View style={styles.headerCopy}>
          <AppText numberOfLines={1} variant="label">
            {question.year} Paper {question.paper}, Q{question.questionNumber}
          </AppText>
          <AppText muted numberOfLines={1} variant="caption">
            {question.sourceTopic} · {question.subtopic}
          </AppText>
        </View>
        <View style={styles.headerProgress}>
          <ProgressBar progress={progress} colour={topic.colour} />
        </View>
      </Card>

      <PastPaperQuestionCard
        ref={questionCardRef}
        key={question.id}
        question={question}
        onAnswer={handleAnswer}
        onMathKeyboardShow={() => screenRef.current?.scrollToEnd()}
        onMathKeyboardVisibilityChange={setMathKeyboardVisible}
      />

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

function parseTopicIds(topicIds: SearchParamValue): TopicId[] {
  const validIds = new Set(topicLessons.map((topic) => topic.id));

  return getSearchParamString(topicIds)
    .split(',')
    .filter((id): id is TopicId => validIds.has(id as TopicId));
}

function parseNumbers(value: SearchParamValue) {
  return getSearchParamString(value)
    .split(',')
    .filter((item) => item.trim().length > 0)
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));
}

function parsePapers(value: SearchParamValue): (1 | 2)[] {
  return parseNumbers(value).filter((paper): paper is 1 | 2 => paper === 1 || paper === 2);
}

function getSearchParamString(value: SearchParamValue) {
  return Array.isArray(value) ? value.join(',') : value;
}

function seededShuffle<TQuestion extends Question>(questions: TQuestion[], seedValue: string) {
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
  keyboardOpenContainer: {
    paddingBottom: 210,
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
