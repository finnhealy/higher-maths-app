import { Fragment, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { BackHandler, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FeedbackBurst, FeedbackTone } from '@/components/FeedbackBurst';
import { MathText } from '@/components/MathText';
import { MathKeyboardOverlay } from '@/components/MathKeyboard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { checkAnswer } from '@/lib/answerChecker';
import { playFeedback } from '@/lib/feedback';
import { cleanMathInput, insertMathToken, moveMathCaret, removeLastMathToken, selectMathBox, selectMathEnd } from '@/lib/mathInput';
import { useAppTheme } from '@/lib/theme';
import { Question } from '@/types/maths';

type QuestionCardProps = {
  question: Question;
  onAnswer: (answer: string, isCorrect: boolean) => void;
};

export type QuestionCardHandle = {
  dismissKeyboard: () => void;
};

function formatTypedMath(value: string) {
  return `$${value}$`;
}

export const QuestionCard = forwardRef<QuestionCardHandle, QuestionCardProps>(function QuestionCard({ question, onAnswer }, ref) {
  const { colors, isDark } = useAppTheme();
  const [selectedChoice, setSelectedChoice] = useState('');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showMathKeyboard, setShowMathKeyboard] = useState(false);
  const inputScrollRef = useRef<ScrollView>(null);
  const cursorDragStepRef = useRef(0);
  const cursorDragResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        cursorDragStepRef.current = 0;
        setShowMathKeyboard(true);
      },
      onPanResponderMove: (_event, gestureState) => {
        const nextDragStep = Math.trunc(gestureState.dx / 18);
        const delta = nextDragStep - cursorDragStepRef.current;

        if (delta === 0) {
          return;
        }

        cursorDragStepRef.current = nextDragStep;
        setTypedAnswer((current) => {
          let next = current;
          const direction = delta > 0 ? 1 : -1;
          for (let index = 0; index < Math.abs(delta); index += 1) {
            next = moveMathCaret(next, direction);
          }
          return next;
        });
      },
      onPanResponderRelease: () => {
        cursorDragStepRef.current = 0;
      },
      onPanResponderTerminate: () => {
        cursorDragStepRef.current = 0;
      },
    }),
  ).current;
  const [feedbackBurst, setFeedbackBurst] = useState<{ key: number; label: string; icon: string; tone: FeedbackTone }>({
    key: 0,
    label: '',
    icon: '✓',
    tone: 'success',
  });

  const answer = question.type === 'multiple-choice' ? selectedChoice : cleanMathInput(typedAnswer);

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
    setTypedAnswer((current) => insertMathToken(current, value));
  }

  function deleteTypedAnswerCharacter() {
    setTypedAnswer(removeLastMathToken);
  }

  function dismissMathKeyboard() {
    setTypedAnswer(cleanMathInput);
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
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              if (submitted) {
                return;
              }
              setTypedAnswer((current) => selectMathEnd(current));
              setShowMathKeyboard(true);
            }}
            style={[styles.input, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
          >
            {typedAnswer ? (
              <View style={styles.inputActiveArea}>
                <ScrollView
                  ref={inputScrollRef}
                  horizontal
                  keyboardShouldPersistTaps="handled"
                  showsHorizontalScrollIndicator={false}
                  onContentSizeChange={() => inputScrollRef.current?.scrollToEnd({ animated: true })}
                  style={styles.inputScroll}
                  contentContainerStyle={styles.inputScrollContent}
                >
                  <MathText
                    content={formatTypedMath(typedAnswer)}
                    size={22}
                    color={colors.text}
                    noWrap
                    onMathBoxPress={(boxIndex) => {
                      setTypedAnswer((current) => selectMathBox(current, boxIndex));
                      setShowMathKeyboard(true);
                    }}
                  />
                </ScrollView>
                {!submitted && (
                  <View
                    accessibilityRole="adjustable"
                    accessibilityLabel="Move cursor"
                    style={[styles.cursorHandle, { backgroundColor: colors.primary }]}
                    {...cursorDragResponder.panHandlers}
                  />
                )}
              </View>
            ) : (
              <View style={styles.emptyInputPressable}>
                <Text style={[styles.inputText, { color: '#94A3B8' }]}>Type your answer</Text>
              </View>
            )}
          </Pressable>
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
      </View>
      <MathKeyboardOverlay
        visible={!submitted && showMathKeyboard}
        onDismiss={dismissMathKeyboard}
        onInsert={insertTypedAnswer}
        onBackspace={deleteTypedAnswerCharacter}
      />
    </Fragment>
  );
});

const styles = StyleSheet.create({
  card: {
    gap: 18,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
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
  choices: {
    gap: 10,
  },
  choice: {
    borderRadius: 16,
    borderWidth: 1,
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
  input: {
    minHeight: 76,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  emptyInputPressable: {
    minHeight: 44,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 19,
    fontWeight: '700',
  },
  inputActiveArea: {
    minHeight: 44,
    justifyContent: 'center',
    paddingRight: 28,
  },
  inputScroll: {
    flexGrow: 0,
  },
  inputScrollContent: {
    alignItems: 'center',
    minHeight: 44,
  },
  cursorHandle: {
    position: 'absolute',
    right: -4,
    bottom: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: '#FFFFFF',
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
