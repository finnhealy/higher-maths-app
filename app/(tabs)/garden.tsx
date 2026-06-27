import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CoinBadge } from '@/components/CoinBadge';
import { FeedbackBurst, FeedbackTone } from '@/components/FeedbackBurst';
import { playFeedback } from '@/lib/feedback';
import { buyPlant, getGardenState, plantCatalog, waterPlant } from '@/lib/storage';
import { useAppTheme } from '@/lib/theme';
import { GardenPlant, GardenState } from '@/types/maths';

const TILE_COUNT = 24;

export default function GardenScreen() {
  const { colors } = useAppTheme();
  const [garden, setGarden] = useState<GardenState | null>(null);
  const [pendingPlantId, setPendingPlantId] = useState<string | null>(null);
  const [message, setMessage] = useState('Choose a seed, then tap an empty soil tile to plant it.');
  const [feedbackBurst, setFeedbackBurst] = useState<{ key: number; label: string; icon: string; tone: FeedbackTone }>({
    key: 0,
    label: '',
    icon: '✓',
    tone: 'growth',
  });

  const refreshGarden = useCallback(async () => {
    setGarden(await getGardenState());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshGarden();
    }, [refreshGarden]),
  );

  const coins = garden?.coins ?? 0;
  const plantedByTile = useMemo(() => {
    const map = new Map<number, GardenPlant>();
    garden?.plants.forEach((plant) => {
      if (plant.tileIndex !== undefined) {
        map.set(plant.tileIndex, plant);
      }
    });
    return map;
  }, [garden?.plants]);

  async function handleBuyPlant(plantId: string) {
    const plant = plantCatalog.find((item) => item.id === plantId);
    if (!plant) {
      return;
    }

    if (coins < plant.cost) {
      playFeedback('incorrect');
      setMessage('You need more coins for that seed.');
      setFeedbackBurst((current) => ({
        key: current.key + 1,
        label: 'Need more',
        icon: '!',
        tone: 'error',
      }));
      return;
    }

    playFeedback('select');
    setPendingPlantId(plantId);
    setMessage(`Tap an empty soil tile to plant ${plant.name}.`);
    setFeedbackBurst((current) => ({
      key: current.key + 1,
      label: 'Pick a tile',
      icon: plant.emoji,
      tone: 'growth',
    }));
  }

  async function handleWaterPlant(gardenPlant: GardenPlant) {
    const result = await waterPlant(gardenPlant.id);
    setGarden(result.garden);
    setMessage(result.message);
    playFeedback(result.success ? 'water' : 'incorrect');
    setFeedbackBurst((current) => ({
      key: current.key + 1,
      label: result.success ? 'Growing' : 'Need more coins',
      icon: result.success ? '💧' : '!',
      tone: result.success ? 'growth' : 'error',
    }));
  }

  async function handlePlaceSeed(tileIndex: number) {
    if (!pendingPlantId) {
      playFeedback('select');
      setMessage('Choose a seed from the nursery first.');
      return;
    }

    const result = await buyPlant(pendingPlantId, tileIndex);
    setGarden(result.garden);
    setMessage(result.success ? `${result.message}. Choose another seed or water your plants.` : result.message);
    playFeedback(result.success ? 'plant' : 'incorrect');
    if (result.success) {
      setPendingPlantId(null);
    }
    setFeedbackBurst((current) => ({
      key: current.key + 1,
      label: result.success ? 'Planted' : 'Try again',
      icon: result.success ? '✦' : '!',
      tone: result.success ? 'growth' : 'error',
    }));
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={[]}>
      <FeedbackBurst label={feedbackBurst.label} icon={feedbackBurst.icon} tone={feedbackBurst.tone} animationKey={feedbackBurst.key} />
      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View>
            <Text style={[styles.kicker, { color: colors.muted }]}>Garden</Text>
            <Text style={[styles.title, { color: colors.text }]}>Study plot</Text>
          </View>
          <CoinBadge coins={coins} />
        </View>

        <Text style={[styles.message, { color: colors.muted }]} numberOfLines={2}>{message}</Text>

        <View style={styles.plotGrid}>
          {Array.from({ length: TILE_COUNT }, (_, tileIndex) => {
            const gardenPlant = plantedByTile.get(tileIndex);
            const plant = gardenPlant ? plantCatalog.find((item) => item.id === gardenPlant.plantId) : undefined;
            const stageIndex = plant && gardenPlant ? Math.min(gardenPlant.waterCount, plant.stages.length - 1) : 0;
            const plantSize = plant ? 14 + stageIndex * 5 : 0;

            if (plant && gardenPlant) {
              return (
                <View
                  key={tileIndex}
                  style={[
                    styles.tile,
                    {
                      backgroundColor: '#7C4A24',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.soilSpeckles}>
                    <View style={[styles.soilSpeckle, styles.soilSpeckleOne]} />
                    <View style={[styles.soilSpeckle, styles.soilSpeckleTwo]} />
                    <View style={[styles.soilSpeckle, styles.soilSpeckleThree]} />
                  </View>
                  <Text style={[styles.tilePlant, { fontSize: plantSize }]}>{plant.emoji}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Water ${plant.name}`}
                    disabled={coins < plant.waterCost}
                    onPress={() => handleWaterPlant(gardenPlant)}
                    style={[
                      styles.waterIcon,
                      {
                        opacity: coins < plant.waterCost ? 0.45 : 1,
                      },
                    ]}
                  >
                    <Text style={styles.waterIconText}>💧</Text>
                  </Pressable>
                </View>
              );
            }

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Empty garden tile"
                key={tileIndex}
                onPress={() => handlePlaceSeed(tileIndex)}
                style={[
                  styles.tile,
                  {
                    backgroundColor: '#8B5A2B',
                    borderColor: pendingPlantId ? '#FACC15' : colors.border,
                  },
                  pendingPlantId && styles.readyTile,
                ]}
              >
                <View style={styles.soilSpeckles}>
                  <View style={[styles.soilSpeckle, styles.soilSpeckleOne]} />
                  <View style={[styles.soilSpeckle, styles.soilSpeckleTwo]} />
                  <View style={[styles.soilSpeckle, styles.soilSpeckleThree]} />
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.shop}>
          <Text style={[styles.shopTitle, { color: colors.text }]}>Nursery</Text>
          <View style={styles.shopGrid}>
            {plantCatalog.map((plant) => {
              const disabled = coins < plant.cost;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Buy ${plant.name}`}
                  disabled={disabled}
                  key={plant.id}
                  onPress={() => handleBuyPlant(plant.id)}
                  style={[
                    styles.shopTile,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      opacity: disabled ? 0.55 : 1,
                    },
                  ]}
                >
                  <Text style={styles.shopEmoji}>{plant.emoji}</Text>
                  <Text style={[styles.shopName, { color: colors.text }]} numberOfLines={2}>
                    {plant.name}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.miniCoin}>¤</Text>
                    <Text style={[styles.shopPrice, { color: '#92400E' }]}>{plant.cost}</Text>
                  </View>
                  <Text style={[styles.shopWater, { color: colors.muted }]}>water {plant.waterCost}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    padding: 12,
    paddingBottom: 28,
    gap: 8,
  },
  header: {
    minHeight: 68,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 23,
    fontWeight: '900',
  },
  message: {
    minHeight: 34,
    fontSize: 12,
    fontWeight: '800',
  },
  plotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    justifyContent: 'center',
  },
  tile: {
    width: '15.3%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    overflow: 'hidden',
  },
  readyTile: {
    transform: [{ scale: 0.97 }],
  },
  soilSpeckles: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  soilSpeckle: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#A16207',
    opacity: 0.42,
  },
  soilSpeckleOne: {
    top: '20%',
    left: '24%',
  },
  soilSpeckleTwo: {
    top: '54%',
    right: '22%',
  },
  soilSpeckleThree: {
    bottom: '18%',
    left: '48%',
  },
  tilePlant: {
    minHeight: 26,
    textAlign: 'center',
  },
  waterIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#60A5FA',
  },
  waterIconText: {
    fontSize: 11,
  },
  shop: {
    gap: 6,
  },
  shopTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  shopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  shopTile: {
    width: '18.6%',
    minHeight: 88,
    borderRadius: 10,
    borderWidth: 2,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  shopEmoji: {
    fontSize: 22,
  },
  shopName: {
    minHeight: 24,
    fontSize: 8,
    fontWeight: '900',
    textAlign: 'center',
  },
  priceRow: {
    minHeight: 19,
    borderRadius: 999,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  miniCoin: {
    color: '#78350F',
    fontSize: 10,
    fontWeight: '900',
  },
  shopPrice: {
    fontSize: 9,
    fontWeight: '900',
  },
  shopWater: {
    fontSize: 8,
    fontWeight: '800',
  },
});
