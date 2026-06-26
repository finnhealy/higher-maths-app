import { StyleSheet, View } from 'react-native';

type ProgressBarProps = {
  progress: number;
  colour?: string;
};

export function ProgressBar({ progress, colour = '#2563EB' }: ProgressBarProps) {
  const width = `${Math.max(0, Math.min(100, progress))}%` as const;

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width, backgroundColor: colour }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
