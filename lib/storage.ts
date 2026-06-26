import AsyncStorage from '@react-native-async-storage/async-storage';

import { topics } from '@/data/lessonContent';
import { sampleQuestions } from '@/data/sampleQuestions';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { GardenState, PlantDefinition, PracticeAttempt, TopicId, TopicProgress, UserProgress } from '@/types/maths';

const PROGRESS_KEY = 'higher-maths-progress';
const ATTEMPTS_KEY = 'higher-maths-attempts';
const GARDEN_KEY = 'higher-maths-garden';
const QUESTION_REWARD = 5;
const LESSON_REWARD = 15;
const STARTING_COINS = 1000;

export const plantCatalog: PlantDefinition[] = [
  {
    id: 'heather',
    name: 'Highland Heather',
    emoji: '🌿',
    cost: 20,
    waterCost: 3,
    colour: '#A855F7',
    stages: ['Seedling', 'Sprouting', 'Blooming', 'Full bloom'],
  },
  {
    id: 'daisy',
    name: 'Exam Daisy',
    emoji: '🌼',
    cost: 15,
    waterCost: 2,
    colour: '#FACC15',
    stages: ['Seed', 'Stem', 'Petals', 'Bright bloom'],
  },
  {
    id: 'thistle',
    name: 'Blue Thistle',
    emoji: '🌱',
    cost: 35,
    waterCost: 5,
    colour: '#2563EB',
    stages: ['Seedling', 'Leafy', 'Budding', 'Flowering'],
  },
  {
    id: 'fern',
    name: 'Forest Fern',
    emoji: '🪴',
    cost: 50,
    waterCost: 7,
    colour: '#16A34A',
    stages: ['Tiny frond', 'Unfurling', 'Lush', 'Towering'],
  },
  {
    id: 'pine',
    name: 'Pine Tree',
    emoji: '🌲',
    cost: 75,
    waterCost: 10,
    colour: '#15803D',
    stages: ['Cone', 'Sapling', 'Young tree', 'Tall pine'],
  },
  {
    id: 'maple',
    name: 'Maple Tree',
    emoji: '🌳',
    cost: 90,
    waterCost: 12,
    colour: '#DC2626',
    stages: ['Seed', 'Sapling', 'Leafy tree', 'Canopy'],
  },
  {
    id: 'sunflower',
    name: 'Sunflower',
    emoji: '🌻',
    cost: 60,
    waterCost: 8,
    colour: '#EAB308',
    stages: ['Seed', 'Shoot', 'Bud', 'Sun face'],
  },
  {
    id: 'cactus',
    name: 'Cactus',
    emoji: '🌵',
    cost: 45,
    waterCost: 4,
    colour: '#65A30D',
    stages: ['Cutting', 'Rooted', 'Spiky', 'Flowering'],
  },
];

function createEmptyProgress(userId?: string): UserProgress {
  const topicProgress = topics.reduce(
    (acc, topic) => {
      acc[topic.id] = {
        topicId: topic.id,
        completed: 0,
        correct: 0,
        incorrect: 0,
      };
      return acc;
    },
    {} as Record<TopicId, TopicProgress>,
  );

  return {
    userId,
    topics: topicProgress,
    updatedAt: new Date().toISOString(),
  };
}

function createEmptyGarden(): GardenState {
  return {
    coins: STARTING_COINS,
    plants: [],
    rewardedLessonIds: [],
    startingCoinsGranted: true,
    updatedAt: new Date().toISOString(),
  };
}

export async function getProgress(userId?: string): Promise<UserProgress> {
  const stored = await AsyncStorage.getItem(PROGRESS_KEY);
  if (!stored) {
    return createEmptyProgress(userId);
  }

  const parsed = JSON.parse(stored) as UserProgress;
  const base = createEmptyProgress(userId ?? parsed.userId);

  return {
    ...base,
    ...parsed,
    userId: userId ?? parsed.userId,
    topics: {
      ...base.topics,
      ...parsed.topics,
    },
  };
}

export async function saveProgress(progress: UserProgress) {
  const updated = {
    ...progress,
    updatedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));

  if (isSupabaseConfigured && updated.userId) {
    await supabase.from('user_progress').upsert({
      user_id: updated.userId,
      progress: updated,
      updated_at: updated.updatedAt,
    });
  }

  return updated;
}

export async function recordAttempt(attempt: PracticeAttempt) {
  const attempts = await getAttempts();
  const nextAttempts = [attempt, ...attempts].slice(0, 200);
  await AsyncStorage.setItem(ATTEMPTS_KEY, JSON.stringify(nextAttempts));

  const progress = await getProgress(attempt.userId);
  const current = progress.topics[attempt.topicId];

  progress.topics[attempt.topicId] = {
    ...current,
    completed: current.completed + 1,
    correct: current.correct + (attempt.isCorrect ? 1 : 0),
    incorrect: current.incorrect + (attempt.isCorrect ? 0 : 1),
    lastPractisedAt: attempt.answeredAt,
  };

  await saveProgress(progress);

  if (isSupabaseConfigured && attempt.userId) {
    await supabase.from('practice_attempts').insert({
      id: attempt.id,
      user_id: attempt.userId,
      topic_id: attempt.topicId,
      question_id: attempt.questionId,
      answer_given: attempt.answerGiven,
      is_correct: attempt.isCorrect,
      answered_at: attempt.answeredAt,
    });
  }

  await awardCoins(QUESTION_REWARD);
}

export async function getAttempts(): Promise<PracticeAttempt[]> {
  const stored = await AsyncStorage.getItem(ATTEMPTS_KEY);
  return stored ? (JSON.parse(stored) as PracticeAttempt[]) : [];
}

export function getTopicCompletionTarget(topicId: TopicId) {
  return sampleQuestions.filter((question) => question.topicId === topicId).length;
}

export async function getGardenState(): Promise<GardenState> {
  const stored = await AsyncStorage.getItem(GARDEN_KEY);
  if (!stored) {
    return createEmptyGarden();
  }

  const parsed = JSON.parse(stored) as GardenState;
  const base = createEmptyGarden();
  const migratedGarden = {
    ...base,
    ...parsed,
    coins: parsed.startingCoinsGranted ? parsed.coins : Math.max(parsed.coins ?? 0, STARTING_COINS),
    plants: parsed.plants ?? [],
    rewardedLessonIds: parsed.rewardedLessonIds ?? [],
    startingCoinsGranted: true,
  };

  if (!parsed.startingCoinsGranted) {
    await AsyncStorage.setItem(GARDEN_KEY, JSON.stringify(migratedGarden));
  }

  return migratedGarden;
}

export async function saveGardenState(garden: GardenState) {
  const updated = {
    ...garden,
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(GARDEN_KEY, JSON.stringify(updated));
  return updated;
}

export async function awardCoins(amount: number) {
  const garden = await getGardenState();
  const updated = await saveGardenState({
    ...garden,
    coins: garden.coins + amount,
  });

  return updated;
}

export async function rewardLessonCompletion(lessonId: string) {
  const garden = await getGardenState();
  if (garden.rewardedLessonIds.includes(lessonId)) {
    return { garden, coinsAwarded: 0 };
  }

  const updated = await saveGardenState({
    ...garden,
    coins: garden.coins + LESSON_REWARD,
    rewardedLessonIds: [...garden.rewardedLessonIds, lessonId],
  });

  return { garden: updated, coinsAwarded: LESSON_REWARD };
}

export async function buyPlant(plantId: string, tileIndex: number) {
  const plant = plantCatalog.find((item) => item.id === plantId);
  if (!plant) {
    throw new Error('Plant not found');
  }

  const garden = await getGardenState();
  if (garden.coins < plant.cost) {
    return { garden, success: false, message: 'Not enough coins' };
  }
  if (garden.plants.some((item) => item.tileIndex === tileIndex)) {
    return { garden, success: false, message: 'That tile is already planted' };
  }

  const now = new Date().toISOString();
  const updated = await saveGardenState({
    ...garden,
    coins: garden.coins - plant.cost,
    plants: [
      ...garden.plants,
      {
        id: `${plant.id}-${Date.now()}`,
        plantId: plant.id,
        tileIndex,
        waterCount: 0,
        boughtAt: now,
        updatedAt: now,
      },
    ],
  });

  return { garden: updated, success: true, message: `${plant.name} planted` };
}

export async function waterPlant(gardenPlantId: string) {
  const garden = await getGardenState();
  const gardenPlant = garden.plants.find((plant) => plant.id === gardenPlantId);
  const plant = plantCatalog.find((item) => item.id === gardenPlant?.plantId);

  if (!gardenPlant || !plant) {
    throw new Error('Plant not found');
  }

  if (garden.coins < plant.waterCost) {
    return { garden, success: false, message: 'Not enough coins' };
  }

  const now = new Date().toISOString();
  const updated = await saveGardenState({
    ...garden,
    coins: garden.coins - plant.waterCost,
    plants: garden.plants.map((item) =>
      item.id === gardenPlantId
        ? {
            ...item,
            waterCount: item.waterCount + 1,
            updatedAt: now,
          }
        : item,
    ),
  });

  return { garden: updated, success: true, message: `${plant.name} watered` };
}

export function getQuestionReward() {
  return QUESTION_REWARD;
}

export function getLessonReward() {
  return LESSON_REWARD;
}
