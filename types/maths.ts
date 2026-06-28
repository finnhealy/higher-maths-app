export type TopicId =
  | 'differentiation'
  | 'integration'
  | 'logs-exponentials'
  | 'recurrence-relations'
  | 'straight-line'
  | 'polynomials'
  | 'functions';

export type Topic = {
  id: TopicId;
  title: string;
  icon: string;
  colour: string;
  description: string;
};

export type AnswerType = 'number' | 'coordinate' | 'expression' | 'equation' | 'text';

export type LessonBlock =
  | {
      type: 'text';
      content: string;
    }
  | {
      type: 'math';
      latex: string;
    }
  | {
      type: 'area-graphic';
    }
  | {
      type: 'straight-line-graphic';
      variant: 'perpendicular' | 'angle' | 'altitude' | 'median' | 'bisector';
    }
  | {
      type: 'example';
      title: string;
      question: string;
      solution: string[];
    };

export type SubtopicLesson = {
  id: string;
  title: string;
  summary: string;
  intro?: string[];
  blocks: LessonBlock[];
  example?: {
    question: string;
    solution: string[];
  };
  check?: {
    question: string;
    graphic?: StraightLineQuestionGraphic;
    answer: string;
    answerType?: AnswerType;
    acceptedAnswers?: string[];
    solution: string[];
  };
};

export type TopicLesson = Topic & {
  subtopics: SubtopicLesson[];
};

export type QuestionType = 'multiple-choice' | 'typed-answer';

export type CoordinatePoint = {
  label: string;
  x: number;
  y: number;
};

export type StraightLineQuestionGraphic = {
  type: 'straight-line-coordinate';
  kind: 'line-through-points' | 'altitude' | 'median' | 'perpendicular-bisector';
  points: CoordinatePoint[];
};

export type Question = {
  id: string;
  topicId: TopicId;
  type: QuestionType;
  prompt: string;
  graphic?: StraightLineQuestionGraphic;
  choices?: string[];
  answer: string;
  answerType?: AnswerType;
  acceptedAnswers?: string[];
  hint: string;
  workedSolution: string;
};

export type TopicProgress = {
  topicId: TopicId;
  completed: number;
  correct: number;
  incorrect: number;
  lastPractisedAt?: string;
};

export type UserProgress = {
  userId?: string;
  topics: Record<TopicId, TopicProgress>;
  updatedAt: string;
};

export type PracticeAttempt = {
  id: string;
  userId?: string;
  topicId: TopicId;
  questionId: string;
  answerGiven: string;
  isCorrect: boolean;
  answeredAt: string;
};

export type PlantDefinition = {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  waterCost: number;
  colour: string;
  stages: string[];
};

export type GardenPlant = {
  id: string;
  plantId: string;
  tileIndex?: number;
  waterCount: number;
  boughtAt: string;
  updatedAt: string;
};

export type GardenState = {
  coins: number;
  plants: GardenPlant[];
  rewardedLessonIds: string[];
  startingCoinsGranted?: boolean;
  updatedAt: string;
};
