import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { getFullPastPaperOptions } from '@/data/pastPaperQuestions';
import { useAppTheme } from '@/lib/theme';

export default function FullPastPapersScreen() {
  const router = useRouter();
  const { colors, radii, shadows } = useAppTheme();
  const paperOptions = useMemo(() => getFullPastPaperOptions(), []);
  const [selectedPaperId, setSelectedPaperId] = useState(paperOptions[0]?.id ?? '');
  const [timed, setTimed] = useState(true);
  const selectedPaper = paperOptions.find((paper) => paper.id === selectedPaperId);

  function startPaper() {
    if (!selectedPaper) {
      return;
    }

    router.push({
      pathname: '/practice/full-past-paper-session',
      params: {
        year: String(selectedPaper.year),
        paper: String(selectedPaper.paper),
        timed: timed ? 'true' : 'false',
      },
    });
  }

  if (paperOptions.length === 0) {
    return (
      <Screen edges={['bottom']} scroll={false} contentContainerStyle={styles.empty}>
        <EmptyState
          title="No full papers found"
          message="Add past paper questions before starting a full paper."
          action={<PrimaryButton title="Back to Practice" onPress={() => router.replace('/practice')} />}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={['bottom']} contentContainerStyle={styles.container}>
      <SectionHeader title="Full Past Papers" subtitle="Choose a paper and sit the questions in order." />

      <View style={styles.paperList}>
        {paperOptions.map((paper) => {
          const selected = paper.id === selectedPaperId;

          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              key={paper.id}
              onPress={() => setSelectedPaperId(paper.id)}
              style={({ pressed }) => [
                styles.paperCard,
                {
                  backgroundColor: colors.card,
                  borderColor: selected ? colors.primary : colors.border,
                  borderRadius: radii.lg,
                },
                shadows.card,
                selected && styles.paperCardSelected,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.paperCopy}>
                <AppText variant="subheading">
                  {paper.year} Paper {paper.paper}
                </AppText>
                <AppText muted>
                  {paper.questionCount} questions · {formatDuration(paper.durationMinutes)}
                </AppText>
              </View>
              <View
                style={[
                  styles.radio,
                  {
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? colors.primary : 'transparent',
                    borderRadius: radii.pill,
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      <Card padding="sm" gap="sm">
        <View style={styles.settingRow}>
          <View style={styles.settingCopy}>
            <AppText variant="label">Timed paper</AppText>
            <AppText muted variant="caption">
              {selectedPaper ? formatDuration(selectedPaper.durationMinutes) : 'Official Higher Maths timing'}
            </AppText>
          </View>
          <Switch value={timed} onValueChange={setTimed} trackColor={{ false: colors.border, true: colors.primary }} />
        </View>
      </Card>

      <PrimaryButton title={selectedPaper ? `Start ${selectedPaper.year} Paper ${selectedPaper.paper}` : 'Select a paper'} disabled={!selectedPaper} onPress={startPaper} />
    </Screen>
  );
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} minutes`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  paperList: {
    gap: 10,
  },
  paperCard: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  paperCardSelected: {
    borderWidth: 2,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  paperCopy: {
    flex: 1,
    gap: 4,
  },
  radio: {
    borderWidth: 1,
    height: 24,
    width: 24,
  },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  settingCopy: {
    flex: 1,
    gap: 2,
  },
});
