import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CoinEarnedPopup } from '@/components/CoinEarnedPopup';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProgressBar } from '@/components/ProgressBar';
import { QuestionCard, QuestionCardHandle } from '@/components/QuestionCard';
import { getQuestionsForTopic, getTopic } from '@/data/sampleQuestions';
import { playFeedback } from '@/lib/feedback';
import { getQuestionReward, recordAttempt } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/lib/theme';
import { Question, TopicId } from '@/types/maths';

export default function PracticeScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const questionCardRef = useRef<QuestionCardHandle>(null);
  const { topicId, seed = topicId } = useLocalSearchParams<{ topicId: TopicId; seed?: string }>();
  const topic = getTopic(topicId);
  const questions = useMemo(() => seededShuffle(getQuestionsForTopic(topicId), String(seed)), [seed, topicId]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answeredCurrent, setAnsweredCurrent] = useState(false);
  const [coinPopup, setCoinPopup] = useState({ amount: 0, key: 0 });

  const question = questions[index];
  const progress = questions.length === 0 ? 0 : Math.round(((index + (answeredCurrent ? 1 : 0)) / questions.length) * 100);

  async function handleAnswer(answerGiven: string, isCorrect: boolean) {
    if ((answeredCurrent && isCorrect) || !question) {
      return;
    }

    const { data } = await supabase.auth.getUser();
    await recordAttempt({
      id: `${Date.now()}-${question.id}`,
      userId: data.user?.id,
      topicId,
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
        topicId,
      },
    });
  }

  if (!topic || !question) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['bottom']}>
        <View style={styles.empty}>
          <Text style={[styles.title, { color: colors.text }]}>Topic not found</Text>
          <PrimaryButton title="Back to practice" onPress={() => router.replace('/practice')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['bottom']}>
      <CoinEarnedPopup amount={coinPopup.amount} animationKey={coinPopup.key} />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        onTouchEnd={() => questionCardRef.current?.dismissKeyboard()}
        onScrollBeginDrag={() => questionCardRef.current?.dismissKeyboard()}
        style={styles.scroll}
      >
        <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.topicIcon, { backgroundColor: `${topic.colour}1F` }]}>
            <Text style={[styles.topicIconText, { color: topic.colour }]}>{topic.icon}</Text>
          </View>
          <Text style={[styles.topicTitle, { color: colors.text }]} numberOfLines={1}>
            {topic.title}
          </Text>
          <View style={styles.headerProgress}>
            <ProgressBar progress={progress} colour={topic.colour} />
          </View>
        </View>

        <QuestionCard ref={questionCardRef} key={question.id} question={question} onAnswer={handleAnswer} />

        <View style={styles.footer}>
          <Text style={[styles.score, { color: colors.muted }]}>
            Score: {score} / {questions.length} · Best streak {bestStreak}
          </Text>

          <PrimaryButton title={index < questions.length - 1 ? 'Next question' : 'Finish practice'} disabled={!answeredCurrent} onPress={goNext} />
          <PrimaryButton variant="secondary" title="Skip" onPress={goNext} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
    flexGrow: 1,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  topicIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicIconText: {
    fontSize: 15,
    fontWeight: '900',
  },
  topicTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
  },
  headerProgress: {
    width: 96,
  },
  footer: {
    gap: 12,
  },
  score: {
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 16,
  },
});
