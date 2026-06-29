import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { CoinEarnedPopup } from '@/components/CoinEarnedPopup';
import { EmptyState } from '@/components/EmptyState';
import { PastPaperQuestionCard, PastPaperQuestionCardHandle } from '@/components/PastPaperQuestionCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen, ScreenHandle } from '@/components/Screen';
import { getFullPastPaperDurationMinutes, getFullPastPaperQuestions } from '@/data/pastPaperQuestions';
import { playFeedback } from '@/lib/feedback';
import { getQuestionReward, recordAttempt } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/lib/theme';

export default function FullPastPaperSessionScreen() {
  const router = useRouter();
  const { colors, radii } = useAppTheme();
  const screenRef = useRef<ScreenHandle>(null);
  const questionCardRef = useRef<PastPaperQuestionCardHandle>(null);
  const { year = '', paper = '', timed = 'true' } = useLocalSearchParams<{ year?: string; paper?: string; timed?: string }>();
  const paperNumber = paper === '2' ? 2 : 1;
  const paperYear = Number(year);
  const timedMode = timed === 'true';
  const questions = useMemo(() => (Number.isFinite(paperYear) ? getFullPastPaperQuestions(paperYear, paperNumber) : []), [paperNumber, paperYear]);
  const durationSeconds = getFullPastPaperDurationMinutes(paperNumber) * 60;
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answeredCurrent, setAnsweredCurrent] = useState(false);
  const [mathKeyboardVisible, setMathKeyboardVisible] = useState(false);
  const [coinPopup, setCoinPopup] = useState({ amount: 0, key: 0 });
  const scoreRef = useRef(0);
  const finishedRef = useRef(false);

  const question = questions[index];
  const progress = questions.length === 0 ? 0 : Math.round(((index + (answeredCurrent ? 1 : 0)) / questions.length) * 100);

  const finishPaper = useCallback(
    (finalScore: number) => {
      if (finishedRef.current) {
        return;
      }

      finishedRef.current = true;
      router.replace({
        pathname: '/(tabs)/results',
        params: {
          score: String(finalScore),
          total: String(questions.length),
          topicId: question?.topicId ?? 'differentiation',
        },
      });
    },
    [question?.topicId, questions.length, router],
  );

  useEffect(() => {
    if (!timedMode || questions.length === 0 || finishedRef.current) {
      return undefined;
    }

    const interval = setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          clearInterval(interval);
          finishPaper(scoreRef.current);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [finishPaper, questions.length, timedMode]);

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
      return;
    }

    setAnsweredCurrent(true);
    setScore((value) => {
      const nextScore = value + 1;
      scoreRef.current = nextScore;
      return nextScore;
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

    finishPaper(scoreRef.current);
  }

  if (!question) {
    return (
      <Screen edges={['bottom']} scroll={false} contentContainerStyle={styles.empty}>
        <EmptyState
          title="Paper not found"
          message="Choose another full past paper."
          action={<PrimaryButton title="Back to Full Past Papers" onPress={() => router.replace('/practice/full-past-papers')} />}
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
        <View style={[styles.paperIcon, { backgroundColor: `${colors.primary}1F`, borderRadius: radii.md }]}>
          <Text style={[styles.paperIconText, { color: colors.primary }]}>P{paperNumber}</Text>
        </View>
        <View style={styles.headerCopy}>
          <AppText numberOfLines={1} variant="label">
            {paperYear} Paper {paperNumber}, Q{question.questionNumber}
          </AppText>
          <AppText muted numberOfLines={1} variant="caption">
            {timedMode ? `Time left ${formatTimer(remainingSeconds)}` : 'Untimed full paper'}
          </AppText>
        </View>
        <View style={styles.headerProgress}>
          <ProgressBar progress={progress} colour={colors.primary} />
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
          Score: {score} / {questions.length}
        </AppText>

        <PrimaryButton title={index < questions.length - 1 ? 'Next question' : 'Finish paper'} disabled={!answeredCurrent} onPress={goNext} />
        <PrimaryButton variant="secondary" title="Skip" onPress={goNext} />
      </View>
    </Screen>
  );
}

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  keyboardOpenContainer: {
    paddingBottom: 210,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  paperIcon: {
    alignItems: 'center',
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  paperIconText: {
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
    gap: 16,
    justifyContent: 'center',
    padding: 20,
  },
});
