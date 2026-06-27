import { useEffect, useMemo, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CoinEarnedPopup } from '@/components/CoinEarnedPopup';
import { FeedbackBurst, FeedbackTone } from '@/components/FeedbackBurst';
import { IntegrationAreaGraphic } from '@/components/IntegrationAreaGraphic';
import { MathText } from '@/components/MathText';
import { MathKeyboardOverlay } from '@/components/MathKeyboard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { getSubtopic, getTopic } from '@/data/lessonContent';
import { checkAnswer } from '@/lib/answerChecker';
import { playFeedback } from '@/lib/feedback';
import { cleanMathInput, insertMathToken, removeLastMathToken, selectMathBox, selectMathEnd } from '@/lib/mathInput';
import { rewardLessonCompletion } from '@/lib/storage';
import { useAppTheme } from '@/lib/theme';
import { LessonBlock, TopicId } from '@/types/maths';

type LessonSection = 'intro' | 'formula' | 'example' | 'try';

function getFirstExample(blocks: LessonBlock[]) {
  return blocks.find((block) => block.type === 'example');
}

function formatTypedMath(value: string) {
  return `$${value}$`;
}

export default function SubtopicLessonScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { topicId, subtopicId } = useLocalSearchParams<{ topicId: TopicId; subtopicId: string }>();
  const topic = getTopic(topicId);
  const subtopic = getSubtopic(topicId, subtopicId);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [showMathKeyboard, setShowMathKeyboard] = useState(false);
  const [coinPopup, setCoinPopup] = useState({ amount: 0, key: 0 });
  const [feedbackBurst, setFeedbackBurst] = useState<{ key: number; label: string; icon: string; tone: FeedbackTone }>({
    key: 0,
    label: '',
    icon: '✓',
    tone: 'success',
  });

  const fallbackExample = useMemo(() => (subtopic ? getFirstExample(subtopic.blocks) : undefined), [subtopic]);
  const example = useMemo(
    () =>
      subtopic?.example ??
      (fallbackExample?.type === 'example'
        ? { question: fallbackExample.question, solution: fallbackExample.solution }
        : undefined),
    [fallbackExample, subtopic?.example],
  );
  const check = subtopic?.check ?? {
    question: 'Write one key fact from this lesson.',
    answer: '',
    acceptedAnswers: [''],
    solution: ['Compare your response with the introduction and worked example.'],
  };
  const contentBlocks = subtopic?.blocks.filter((block) => block.type !== 'example') ?? [];
  const sections = useMemo<LessonSection[]>(
    () => ['intro', ...(contentBlocks.length > 0 ? (['formula'] as const) : []), ...(example ? (['example'] as const) : []), 'try'],
    [contentBlocks.length, example],
  );
  const activeSection = sections[sectionIndex];
  const isFirst = sectionIndex === 0;
  const isLast = sectionIndex === sections.length - 1;
  const cleanAnswer = cleanMathInput(answer);
  const isCorrect = submitted
    ? checkAnswer({
        given: cleanAnswer,
        expected: check.answer,
        acceptedAnswers: check.acceptedAnswers,
        answerType: check.answerType,
      })
    : false;

  useEffect(() => {
    if (!showMathKeyboard) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      dismissMathKeyboard();
      return true;
    });

    return () => subscription.remove();
  }, [showMathKeyboard]);

  if (!topic || !subtopic) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['bottom']}>
        <View style={styles.empty}>
          <Text style={[styles.title, { color: colors.text }]}>Lesson not found</Text>
          <PrimaryButton title="Back to subtopics" onPress={() => router.replace('/topics')} />
        </View>
      </SafeAreaView>
    );
  }

  function goNext() {
    setSubmitted(false);
    setShowMathKeyboard(false);
    setSectionIndex((value) => Math.min(value + 1, sections.length - 1));
  }

  function goBack() {
    setSubmitted(false);
    setShowMathKeyboard(false);
    setSectionIndex((value) => Math.max(value - 1, 0));
  }

  function insertAnswer(value: string) {
    setAnswer((current) => insertMathToken(current, value));
  }

  function deleteAnswerCharacter() {
    setAnswer(removeLastMathToken);
  }

  function dismissMathKeyboard() {
    setAnswer(cleanMathInput);
    setShowMathKeyboard(false);
  }

  async function submitLessonCheck() {
    if (!cleanAnswer.trim() || submitted) {
      return;
    }

    const correct = checkAnswer({
      given: cleanAnswer,
      expected: check.answer,
      acceptedAnswers: check.acceptedAnswers,
      answerType: check.answerType,
    });

    setSubmitted(true);
    dismissMathKeyboard();
    playFeedback(correct ? 'correct' : 'incorrect');
    setFeedbackBurst((current) => ({
      key: current.key + 1,
      label: correct ? 'Lesson locked in' : 'Review the steps',
      icon: correct ? '★' : '!',
      tone: correct ? 'success' : 'error',
    }));
    const result = await rewardLessonCompletion(`${topicId}:${subtopicId}`);
    if (result.coinsAwarded > 0) {
      playFeedback('lessonComplete');
      setCoinPopup({ amount: result.coinsAwarded, key: Date.now() });
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: subtopic.title,
        }}
      />
      <CoinEarnedPopup amount={coinPopup.amount} animationKey={coinPopup.key} />
      <FeedbackBurst label={feedbackBurst.label} icon={feedbackBurst.icon} tone={feedbackBurst.tone} animationKey={feedbackBurst.key} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.shell}>
        <View style={styles.progressRow}>
          <Text style={[styles.stepText, { color: colors.muted }]}>
            {topic.title} · {sectionIndex + 1} of {sections.length}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ScrollView contentContainerStyle={styles.cardScrollContent} showsVerticalScrollIndicator={false}>
            {activeSection === 'intro' && (
              <View style={styles.sectionContent}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Introduction</Text>
                {(subtopic.intro ?? [subtopic.summary]).map((paragraph) => (
                  <MathText key={paragraph} content={paragraph} size={20} color={colors.muted} />
                ))}
              </View>
            )}

            {activeSection === 'formula' && (
              <View style={styles.sectionContent}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Key method</Text>
                {contentBlocks.map((block, index) => {
                  if (block.type === 'math') {
                    return <MathText key={`${subtopic.id}-block-${index}`} content={block.latex} displayMode size={24} />;
                  }
                  if (block.type === 'area-graphic') {
                    return <IntegrationAreaGraphic key={`${subtopic.id}-block-${index}`} />;
                  }

                  return <MathText key={`${subtopic.id}-block-${index}`} content={block.content} size={20} color={colors.muted} />;
                })}
              </View>
            )}

            {activeSection === 'example' && example && (
              <View style={styles.sectionContent}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Example</Text>
                <View style={[styles.questionBox, { backgroundColor: colors.cardAlt }]}>
                  <MathText content={example.question} size={21} color={colors.text} />
                </View>
                <Text style={[styles.smallTitle, { color: colors.text }]}>Worked solution</Text>
                {example.solution.map((step) => (
                  <MathText key={step} content={step} size={19} color={colors.muted} />
                ))}
              </View>
            )}

            {activeSection === 'try' && (
              <View style={styles.sectionContent}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Try it</Text>
                <View style={[styles.questionBox, { backgroundColor: colors.cardAlt }]}>
                  <MathText content={check.question} size={21} color={colors.text} />
                </View>
                <View
                  onTouchEnd={() => {
                    setAnswer((current) => selectMathEnd(current));
                    setShowMathKeyboard(true);
                  }}
                  style={[styles.input, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
                >
                  {answer ? (
                    <MathText
                      content={formatTypedMath(answer)}
                      size={21}
                      color={colors.text}
                      onMathBoxPress={(boxIndex) => {
                        setAnswer((current) => selectMathBox(current, boxIndex));
                        setShowMathKeyboard(true);
                      }}
                    />
                  ) : (
                    <View style={styles.emptyInputPressable}>
                      <Text style={[styles.inputText, { color: '#94A3B8' }]}>Type your answer</Text>
                    </View>
                  )}
                </View>
                {submitted && (
                  <View style={[styles.feedback, { backgroundColor: isCorrect ? '#DCFCE7' : '#FEE2E2' }]}>
                    <Text style={styles.feedbackTitle}>{isCorrect ? 'Correct' : 'Check your working'}</Text>
                    {check.solution.map((step) => (
                      <MathText key={step} content={step} size={17} color="#334155" />
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>

        <View style={styles.controls}>
          <PrimaryButton title="Back" variant="secondary" disabled={isFirst} onPress={goBack} style={styles.controlButton} />
          {activeSection === 'try' ? (
            <PrimaryButton title={submitted ? 'Submitted' : 'Submit'} disabled={!cleanAnswer.trim() || submitted} onPress={submitLessonCheck} style={styles.controlButton} />
          ) : (
            <PrimaryButton title={isLast ? 'Done' : 'Next'} onPress={isLast ? () => router.back() : goNext} style={styles.controlButton} />
          )}
        </View>

        <MathKeyboardOverlay
          visible={activeSection === 'try' && showMathKeyboard && !submitted}
          onDismiss={dismissMathKeyboard}
          onInsert={insertAnswer}
          onBackspace={deleteAnswerCharacter}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  shell: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  progressRow: {
    minHeight: 20,
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 13,
    fontWeight: '800',
  },
  card: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
  },
  cardScrollContent: {
    flexGrow: 1,
    paddingVertical: 6,
  },
  sectionContent: {
    gap: 18,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: '900',
  },
  smallTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  questionBox: {
    borderRadius: 16,
    padding: 16,
  },
  input: {
    minHeight: 62,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  emptyInputPressable: {
    minHeight: 62,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 19,
    fontWeight: '700',
  },
  feedback: {
    gap: 8,
    borderRadius: 16,
    padding: 16,
  },
  feedbackTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
  },
});
