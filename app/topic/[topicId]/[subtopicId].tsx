import { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { CoinEarnedPopup } from '@/components/CoinEarnedPopup';
import { EmptyState } from '@/components/EmptyState';
import { FeedbackBurst, FeedbackTone } from '@/components/FeedbackBurst';
import { IntegrationAreaGraphic } from '@/components/IntegrationAreaGraphic';
import { MathText } from '@/components/MathText';
import { MathKeyboard } from '@/components/MathKeyboard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { StraightLineGraphic } from '@/components/StraightLineGraphic';
import { StraightLineQuestionGraphic } from '@/components/StraightLineQuestionGraphic';
import { StructuredMathInput } from '@/components/StructuredMathInput';
import { getSubtopic, getTopic } from '@/data/lessonContent';
import { checkAnswer } from '@/lib/answerChecker';
import {
  backspaceExpression,
  createExpressionEditorState,
  expressionToString,
  insertExpressionToken,
  navigateExpression,
} from '@/lib/expressionEditor';
import { playFeedback } from '@/lib/feedback';
import { rewardLessonCompletion } from '@/lib/storage';
import { useAppTheme } from '@/lib/theme';
import { LessonBlock, TopicId } from '@/types/maths';

type LessonSection = 'intro' | 'formula' | 'example' | 'try';

function getFirstExample(blocks: LessonBlock[]) {
  return blocks.find((block) => block.type === 'example');
}

export default function SubtopicLessonScreen() {
  const router = useRouter();
  const { colors, spacing } = useAppTheme();
  const { height } = useWindowDimensions();
  const cardScrollRef = useRef<ScrollView>(null);
  const { topicId, subtopicId } = useLocalSearchParams<{ topicId: TopicId; subtopicId: string }>();
  const topic = getTopic(topicId);
  const subtopic = getSubtopic(topicId, subtopicId);
  const returnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [answer, setAnswer] = useState(createExpressionEditorState);
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
  const cleanAnswer = expressionToString(answer);
  const keyboardVisible = activeSection === 'try' && showMathKeyboard && !submitted;
  const keyboardHeight = Math.min(352, Math.max(288, height * 0.42));
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

  useEffect(
    () => () => {
      if (returnTimerRef.current) {
        clearTimeout(returnTimerRef.current);
      }
    },
    [],
  );

  if (!topic || !subtopic) {
    return (
      <Screen edges={['bottom']} scroll={false} contentContainerStyle={styles.empty}>
        <EmptyState title="Lesson not found" action={<PrimaryButton title="Back to subtopics" onPress={() => router.replace('/topics')} />} />
      </Screen>
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
    setAnswer((current) => insertExpressionToken(current, value));
    playFeedback('type');
  }

  function deleteAnswerCharacter() {
    setAnswer(backspaceExpression);
    playFeedback('type');
  }

  function dismissMathKeyboard() {
    setShowMathKeyboard(false);
  }

  function focusLessonAnswer() {
    if (submitted && !isCorrect) {
      setSubmitted(false);
    }
    setShowMathKeyboard(true);
    requestAnimationFrame(() => {
      cardScrollRef.current?.scrollToEnd({ animated: true });
    });
  }

  function retryLessonCheck() {
    if (returnTimerRef.current) {
      clearTimeout(returnTimerRef.current);
    }
    setSubmitted(false);
    focusLessonAnswer();
  }

  function returnToTopic() {
    router.dismissTo({
      pathname: '/topic/[topicId]',
      params: { topicId },
    });
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
      label: correct ? 'Lesson completed' : 'Review the steps',
      icon: correct ? '★' : '!',
      tone: correct ? 'success' : 'error',
    }));
    if (correct) {
      const result = await rewardLessonCompletion(`${topicId}:${subtopicId}`);
      if (result.coinsAwarded > 0) {
        playFeedback('lessonComplete');
        setCoinPopup({ amount: result.coinsAwarded, key: Date.now() });
      }
      returnTimerRef.current = setTimeout(returnToTopic, 650);
    }
  }

  return (
    <Screen
      edges={[]}
      scroll={false}
      contentContainerStyle={styles.screen}
      overlay={
        <>
          <CoinEarnedPopup amount={coinPopup.amount} animationKey={coinPopup.key} />
          <FeedbackBurst label={feedbackBurst.label} icon={feedbackBurst.icon} tone={feedbackBurst.tone} animationKey={feedbackBurst.key} />
        </>
      }
    >
      <Stack.Screen
        options={{
          title: subtopic.title,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.shell}
      >
        <View style={[styles.lessonContent, keyboardVisible && { paddingBottom: keyboardHeight + spacing.sm }]}>
          <View style={styles.progressRow}>
            <AppText muted variant="caption">
              {topic.title} · {sectionIndex + 1} of {sections.length}
            </AppText>
          </View>

          <Card padding="lg" style={styles.card}>
            <ScrollView ref={cardScrollRef} contentContainerStyle={styles.cardScrollContent} showsVerticalScrollIndicator={false}>
              {activeSection === 'intro' && (
                <View style={styles.sectionContent}>
                  <AppText variant="title">Introduction</AppText>
                  {(subtopic.intro ?? [subtopic.summary]).map((paragraph) => (
                    <MathText key={paragraph} content={paragraph} size={20} color={colors.muted} />
                  ))}
                </View>
              )}

              {activeSection === 'formula' && (
                <View style={styles.sectionContent}>
                  <AppText variant="title">Key method</AppText>
                  {contentBlocks.map((block, index) => {
                    if (block.type === 'math') {
                      return <MathText key={`${subtopic.id}-block-${index}`} content={block.latex} displayMode size={24} />;
                    }
                    if (block.type === 'area-graphic') {
                      return <IntegrationAreaGraphic key={`${subtopic.id}-block-${index}`} />;
                    }
                    if (block.type === 'straight-line-graphic') {
                      return <StraightLineGraphic key={`${subtopic.id}-block-${index}`} variant={block.variant} />;
                    }

                    return <MathText key={`${subtopic.id}-block-${index}`} content={block.content} size={20} color={colors.muted} />;
                  })}
                </View>
              )}

              {activeSection === 'example' && example && (
                <View style={styles.sectionContent}>
                  <AppText variant="title">Example</AppText>
                  <View style={[styles.questionBox, { backgroundColor: colors.cardAlt }]}>
                    <MathText content={example.question} size={21} color={colors.text} />
                  </View>
                  <AppText variant="subheading">Worked solution</AppText>
                  {example.solution.map((step) => (
                    <MathText key={step} content={step} size={19} color={colors.muted} />
                  ))}
                </View>
              )}

              {activeSection === 'try' && (
                <View style={styles.sectionContent}>
                  <AppText variant="title">Try it</AppText>
                  <View style={[styles.questionBox, { backgroundColor: colors.cardAlt }]}>
                    <MathText content={check.question} size={21} color={colors.text} />
                  </View>
                  {check.graphic ? <StraightLineQuestionGraphic graphic={check.graphic} /> : null}
                  <StructuredMathInput
                    state={answer}
                    onChange={setAnswer}
                    onFocus={focusLessonAnswer}
                    editable={!submitted || !isCorrect}
                    size={21}
                    color={colors.text}
                  />
                  {submitted && (
                    <View style={[styles.feedback, { backgroundColor: isCorrect ? '#DCFCE7' : '#FEE2E2' }]}>
                      <AppText color="#0F172A" variant="subheading">{isCorrect ? 'Correct' : 'Check your working'}</AppText>
                      {check.solution.map((step) => (
                        <MathText key={step} content={step} size={17} color="#334155" />
                      ))}
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </Card>

          <View style={styles.controls}>
            <PrimaryButton title="Back" variant="secondary" disabled={isFirst} onPress={goBack} style={styles.controlButton} />
            {activeSection === 'try' ? (
              <PrimaryButton
                title={submitted ? (isCorrect ? 'Returning...' : 'Try again') : 'Submit'}
                disabled={!submitted && !cleanAnswer.trim()}
                onPress={submitted ? (isCorrect ? returnToTopic : retryLessonCheck) : submitLessonCheck}
                style={styles.controlButton}
              />
            ) : (
              <PrimaryButton title={isLast ? 'Done' : 'Next'} onPress={isLast ? () => router.back() : goNext} style={styles.controlButton} />
            )}
          </View>
        </View>

        {keyboardVisible && (
          <View
            style={[
              styles.keyboardDock,
              {
                backgroundColor: colors.cardAlt,
                borderColor: colors.border,
                height: keyboardHeight,
              },
            ]}
          >
            <MathKeyboard
              fill
              onEnter={dismissMathKeyboard}
              onInsert={insertAnswer}
              onBackspace={deleteAnswerCharacter}
              onNavigate={(action) => setAnswer((current) => navigateExpression(current, action))}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 0,
    gap: 0,
  },
  shell: {
    flex: 1,
    position: 'relative',
  },
  lessonContent: {
    flex: 1,
    gap: 10,
    padding: 16,
  },
  progressRow: {
    minHeight: 20,
    justifyContent: 'center',
  },
  card: {
    flex: 1,
  },
  cardScrollContent: {
    flexGrow: 1,
    paddingVertical: 6,
  },
  sectionContent: {
    gap: 18,
  },
  questionBox: {
    borderRadius: 16,
    padding: 16,
  },
  feedback: {
    gap: 8,
    borderRadius: 16,
    padding: 16,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
  },
  keyboardDock: {
    position: 'absolute',
    right: 16,
    bottom: 0,
    left: 16,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 16,
  },
});
