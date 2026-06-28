import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/lib/theme';

type ProgressBarProps = {
  progress: number;
  colour?: string;
};

export function ProgressBar({ progress, colour = '#2563EB' }: ProgressBarProps) {
  const { colors } = useAppTheme();
  const width = `${Math.max(0, Math.min(100, progress))}%` as const;

  return (
    <View style={[styles.track, { backgroundColor: colors.border }]}>
      <View style={[styles.fill, { width, backgroundColor: colour }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
