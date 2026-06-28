import { Fragment, forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { FeedbackBurst, FeedbackTone } from '@/components/FeedbackBurst';
import { MathText } from '@/components/MathText';
import { MathKeyboardOverlay } from '@/components/MathKeyboard';
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
import { Question } from '@/types/maths';

type QuestionCardProps = {
  question: Question;
  onAnswer: (answer: string, isCorrect: boolean) => void;
};

export type QuestionCardHandle = {
  dismissKeyboard: () => void;
};

export const QuestionCard = forwardRef<QuestionCardHandle, QuestionCardProps>(function QuestionCard({ question, onAnswer }, ref) {
  const { colors, isDark } = useAppTheme();
  const [selectedChoice, setSelectedChoice] = useState('');
  const [typedAnswer, setTypedAnswer] = useState(createExpressionEditorState);
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showMathKeyboard, setShowMathKeyboard] = useState(false);
  const [feedbackBurst, setFeedbackBurst] = useState<{ key: number; label: string; icon: string; tone: FeedbackTone }>({
    key: 0,
    label: '',
    icon: '✓',
    tone: 'success',
  });

  const answer = question.type === 'multiple-choice' ? selectedChoice : expressionToString(typedAnswer);

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

  function dismissMathKeyboard() {
    setShowMathKeyboard(false);
  }

  function submitAnswer() {
    if (!answer.trim()) {
      return;
    }

    dismissMathKeyboard();

    const correct = checkAnswer({
      given: answer,
      expected: question.answer,
      acceptedAnswers: question.acceptedAnswers,
      answerType: question.answerType,
    });
    setIsCorrect(correct);
    setSubmitted(correct);
    if (!correct) {
      setShowHint(true);
    }
    playFeedback(correct ? 'correct' : 'incorrect');
    setFeedbackBurst((current) => ({
      key: current.key + 1,
      label: correct ? 'Nice work' : 'Try the hint',
      icon: correct ? '✓' : '!',
      tone: correct ? 'success' : 'error',
    }));
    onAnswer(answer, correct);
  }

  return (
    <Fragment>
      <FeedbackBurst label={feedbackBurst.label} icon={feedbackBurst.icon} tone={feedbackBurst.tone} animationKey={feedbackBurst.key} />
      <Card padding="lg" gap="md">
        <Text style={styles.badge}>
          {question.type === 'multiple-choice' ? 'Multiple choice' : 'Typed answer'}
        </Text>
        <MathText content={question.prompt} size={21} />

        {question.type === 'multiple-choice' ? (
          <View style={styles.choices}>
            {question.choices?.map((choice) => {
              const isSelected = selectedChoice === choice;
              const isCorrectChoice = checkAnswer({
                given: choice,
                expected: question.answer,
                acceptedAnswers: question.acceptedAnswers,
                answerType: question.answerType,
              });
              return (
                <Pressable
                  accessibilityRole="button"
                  disabled={submitted}
                  key={choice}
                  onPress={() => setSelectedChoice(choice)}
                  style={[
                    styles.choice,
                    { backgroundColor: colors.cardAlt, borderColor: colors.border },
                    isSelected && styles.choiceSelected,
                    submitted && isCorrectChoice && styles.choiceCorrect,
                    submitted && isSelected && !isCorrect && styles.choiceWrong,
                  ]}
                >
                  <MathText content={choice} size={16} color={isSelected ? '#1D4ED8' : colors.text} />
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.typedAnswer}>
            <StructuredMathInput
              state={typedAnswer}
              onChange={setTypedAnswer}
              onFocus={() => setShowMathKeyboard(true)}
              editable={!submitted}
              size={22}
              color={colors.text}
            />
          </View>
        )}

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
          <PrimaryButton title="Check answer" disabled={submitted || !answer.trim()} onPress={submitAnswer} />
        </View>

        {showHint && (
          <View style={[styles.note, { backgroundColor: isDark ? '#372A16' : '#FFF7ED' }]}>
            <Text style={[styles.noteTitle, { color: colors.text }]}>Hint</Text>
            <ScrollView style={styles.noteScroll} contentContainerStyle={styles.noteScrollContent} nestedScrollEnabled>
              <MathText content={question.hint} size={14} color={colors.muted} />
            </ScrollView>
          </View>
        )}

        {submitted && (
          <View style={[styles.solution, isCorrect ? styles.correctBox : styles.wrongBox]}>
            <Text style={[styles.result, { color: '#0F172A' }]}>{isCorrect ? 'Correct' : 'Not quite'}</Text>
            <Text style={[styles.noteTitle, { color: '#0F172A' }]}>Worked solution</Text>
            <ScrollView style={styles.solutionScroll} contentContainerStyle={styles.noteScrollContent} nestedScrollEnabled>
              <MathText content={question.workedSolution} size={14} color="#334155" />
            </ScrollView>
          </View>
        )}
      </Card>
      <MathKeyboardOverlay
        visible={!submitted && showMathKeyboard}
        onDismiss={dismissMathKeyboard}
        onInsert={insertTypedAnswer}
        onBackspace={deleteTypedAnswerCharacter}
        onNavigate={(action) => setTypedAnswer((current) => navigateExpression(current, action))}
      />
    </Fragment>
  );
});

const styles = StyleSheet.create({
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
  choices: {
    gap: 10,
  },
  choice: {
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: 'center',
    padding: 14,
  },
  choiceSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#DBEAFE',
  },
  choiceCorrect: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  choiceWrong: {
    borderColor: '#DC2626',
    backgroundColor: '#FEE2E2',
  },
  typedAnswer: {
    gap: 8,
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
    paddingBottom: 2,
  },
  solution: {
    borderRadius: 16,
    padding: 12,
    gap: 6,
  },
  solutionScroll: {
    maxHeight: 130,
  },
  correctBox: {
    backgroundColor: '#DCFCE7',
  },
  wrongBox: {
    backgroundColor: '#FEE2E2',
  },
  result: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
  },
  noteTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '900',
  },
});
