import { Fragment, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { FeedbackBurst, FeedbackTone } from '@/components/FeedbackBurst';
import { MathKeyboardOverlay } from '@/components/MathKeyboard';
import { MathText } from '@/components/MathText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StructuredMathInput } from '@/components/StructuredMathInput';
import { checkAnswer } from '@/lib/answerChecker';
import {
  backspaceExpression,
  createExpressionEditorState,
  expressionToString,
  insertExpressionToken,
  navigateExpression,
} from '@/lib/expressionEditor';
import { playFeedback } from '@/lib/feedback';
import { useAppTheme } from '@/lib/theme';
import { PastPaperQuestion, QuestionPart } from '@/types/maths';

type PastPaperQuestionCardProps = {
  question: PastPaperQuestion;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  onMathKeyboardVisibilityChange?: (visible: boolean) => void;
  onMathKeyboardShow?: () => void;
};

export type PastPaperQuestionCardHandle = {
  dismissKeyboard: () => void;
};

export const PastPaperQuestionCard = forwardRef<PastPaperQuestionCardHandle, PastPaperQuestionCardProps>(function PastPaperQuestionCard(
  { question, onAnswer, onMathKeyboardShow, onMathKeyboardVisibilityChange },
  ref,
) {
  const { colors, isDark } = useAppTheme();
  const parts = useMemo(() => (question.parts.length > 0 ? question.parts : fallbackParts(question)), [question]);
  const [partIndex, setPartIndex] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState(createExpressionEditorState);
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showMathKeyboard, setShowMathKeyboard] = useState(false);
  const [completedAnswers, setCompletedAnswers] = useState<string[]>([]);
  const [feedbackBurst, setFeedbackBurst] = useState<{ key: number; label: string; icon: string; tone: FeedbackTone }>({
    key: 0,
    label: '',
    icon: '✓',
    tone: 'success',
  });
  const currentPart = parts[partIndex];
  const answer = expressionToString(typedAnswer);
  const currentPartAnswerable = currentPart.answerable;
  const isLastPart = partIndex === parts.length - 1;
  const allPartsComplete = submitted && isCorrect && isLastPart;

  const dismissMathKeyboard = useCallback(() => {
    setShowMathKeyboard(false);
    onMathKeyboardVisibilityChange?.(false);
  }, [onMathKeyboardVisibilityChange]);

  useEffect(() => {
    if (!showMathKeyboard) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      dismissMathKeyboard();
      return true;
    });

    return () => subscription.remove();
  }, [dismissMathKeyboard, showMathKeyboard]);

  useImperativeHandle(ref, () => ({
    dismissKeyboard: dismissMathKeyboard,
  }));

  function insertTypedAnswer(value: string) {
    setTypedAnswer((current) => insertExpressionToken(current, value));
    playFeedback('type');
  }

  function deleteTypedAnswerCharacter() {
    setTypedAnswer(backspaceExpression);
    playFeedback('type');
  }

  function focusTypedAnswer() {
    if (submitted && !isCorrect) {
      setSubmitted(false);
    }
    setShowMathKeyboard(true);
    onMathKeyboardVisibilityChange?.(true);
    setTimeout(() => onMathKeyboardShow?.(), 120);
  }

  function submitAnswer() {
    if (!currentPartAnswerable) {
      return;
    }

    if (!answer.trim()) {
      return;
    }

    dismissMathKeyboard();

    const correct = checkAnswer({
      given: answer,
      expected: currentPart.answer,
      acceptedAnswers: currentPart.acceptedAnswers,
      answerType: currentPart.answerType,
    });

    setIsCorrect(correct);
    setSubmitted(correct);
    if (!correct) {
      setShowHint(true);
      onAnswer(partAnswerLabel(currentPart, answer), false);
    }

    playFeedback(correct ? 'correct' : 'incorrect');
    setFeedbackBurst((current) => ({
      key: current.key + 1,
      label: correct ? 'Nice work' : 'Try the hint',
      icon: correct ? '✓' : '!',
      tone: correct ? 'success' : 'error',
    }));

    if (correct && isLastPart) {
      onAnswer([...completedAnswers, partAnswerLabel(currentPart, answer)].join('\n'), true);
    }
  }

  function markCurrentPartDone() {
    dismissMathKeyboard();
    setSubmitted(true);
    setIsCorrect(true);
    setShowHint(false);
    playFeedback('correct');
    setFeedbackBurst((current) => ({
      key: current.key + 1,
      label: 'Marked done',
      icon: '✓',
      tone: 'success',
    }));

    if (isLastPart) {
      onAnswer([...completedAnswers, partAnswerLabel(currentPart, 'marked done')].join('\n'), true);
    }
  }

  function goNextPart() {
    setCompletedAnswers((current) => [...current, partAnswerLabel(currentPart, currentPartAnswerable ? answer : 'marked done')]);
    setPartIndex((value) => value + 1);
    setTypedAnswer(createExpressionEditorState());
    setShowHint(false);
    setSubmitted(false);
    setIsCorrect(false);
  }

  return (
    <Fragment>
      <FeedbackBurst label={feedbackBurst.label} icon={feedbackBurst.icon} tone={feedbackBurst.tone} animationKey={feedbackBurst.key} />
      <Card padding="lg" gap="md">
        <View style={styles.badgeRow}>
          <Text style={styles.badge}>Past paper</Text>
          <Text style={styles.partBadge}>
            {parts.length === 1 ? 'Single answer' : `Part ${partIndex + 1} of ${parts.length}`}
          </Text>
        </View>

        <MathText content={question.prompt} size={21} />

        <View style={[styles.partPanel, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
          <Text style={[styles.partTitle, { color: colors.text }]}>
            {currentPart.label === 'Answer' ? 'Answer' : `Answer ${currentPart.label}`}
          </Text>
          {currentPartAnswerable ? (
            <StructuredMathInput
              state={typedAnswer}
              onChange={setTypedAnswer}
              onFocus={focusTypedAnswer}
              editable={!submitted || !isCorrect}
              size={22}
              color={colors.text}
            />
          ) : (
            <Text style={[styles.nonAnswerableText, { color: colors.muted }]}>Complete this part outside the app.</Text>
          )}
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            title={showHint ? 'Hide hint' : 'Show hint'}
            variant="secondary"
            onPress={() => {
              setShowHint((value) => {
                if (!value) {
                  dismissMathKeyboard();
                }
                return !value;
              });
            }}
          />
          {currentPartAnswerable ? (
            <PrimaryButton title="Check answer" disabled={submitted || !answer.trim()} onPress={submitAnswer} />
          ) : (
            <PrimaryButton title="Mark as done" disabled={submitted} onPress={markCurrentPartDone} />
          )}
        </View>

        {showHint && (
          <View style={[styles.note, { backgroundColor: isDark ? '#372A16' : '#FFF7ED' }]}>
            <Text style={[styles.noteTitle, { color: colors.text }]}>Hint</Text>
            <ScrollView style={styles.noteScroll} contentContainerStyle={styles.noteScrollContent} nestedScrollEnabled>
              <MathText content={question.hint} size={14} color={colors.muted} />
            </ScrollView>
          </View>
        )}

        {submitted && isCorrect ? (
          <View style={styles.correctBox}>
            <Text style={styles.result}>{allPartsComplete ? 'Question complete' : 'Correct'}</Text>
            <Text style={styles.noteTitle}>Expected answer</Text>
            <MathText content={currentPart.answer} size={14} color="#334155" />
            {!isLastPart ? <PrimaryButton title="Next part" onPress={goNextPart} /> : null}
          </View>
        ) : null}
      </Card>
      <MathKeyboardOverlay
        visible={currentPartAnswerable && !submitted && showMathKeyboard}
        onDismiss={dismissMathKeyboard}
        onInsert={insertTypedAnswer}
        onBackspace={deleteTypedAnswerCharacter}
        onNavigate={(action) => setTypedAnswer((current) => navigateExpression(current, action))}
      />
    </Fragment>
  );
});

function fallbackParts(question: PastPaperQuestion) {
  return [
    {
      id: `${question.id}-part-1`,
      label: 'Answer',
      answerable: true,
      answer: question.answer,
      answerType: question.answerType,
      acceptedAnswers: question.acceptedAnswers,
    },
  ];
}

function partAnswerLabel(part: QuestionPart, answer: string) {
  return part.label === 'Answer' ? answer : `${part.label} ${answer}`;
}

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    color: '#2563EB',
    backgroundColor: '#DBEAFE',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '900',
  },
  partBadge: {
    alignSelf: 'flex-start',
    color: '#047857',
    backgroundColor: '#D1FAE5',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '900',
  },
  partPanel: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  nonAnswerableText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  partTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  actions: {
    gap: 10,
  },
  note: {
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    padding: 12,
    gap: 4,
  },
  noteScroll: {
    maxHeight: 96,
  },
  noteScrollContent: {
    gap: 4,
  },
  noteTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
  },
  correctBox: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  result: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
  },
});
