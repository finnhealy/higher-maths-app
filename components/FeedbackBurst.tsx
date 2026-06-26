import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';

export type FeedbackTone = 'success' | 'error' | 'growth';

type FeedbackBurstProps = {
  label: string;
  icon: string;
  animationKey: number;
  tone?: FeedbackTone;
};

const toneStyles: Record<FeedbackTone, { backgroundColor: string; borderColor: string; color: string }> = {
  success: { backgroundColor: '#DCFCE7', borderColor: '#22C55E', color: '#14532D' },
  error: { backgroundColor: '#FEE2E2', borderColor: '#EF4444', color: '#7F1D1D' },
  growth: { backgroundColor: '#ECFDF5', borderColor: '#10B981', color: '#064E3B' },
};

export function FeedbackBurst({ label, icon, animationKey, tone = 'success' }: FeedbackBurstProps) {
  const [opacity] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(0.8));
  const [translateY] = useState(() => new Animated.Value(10));

  useEffect(() => {
    if (!animationKey) {
      return;
    }

    opacity.setValue(0);
    scale.setValue(0.8);
    translateY.setValue(10);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          tension: 160,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 140,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(520),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 260,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -18,
          duration: 260,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [animationKey, opacity, scale, translateY]);

  if (!animationKey) {
    return null;
  }

  const palette = toneStyles[tone];

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.burst,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
          opacity,
          transform: [{ scale }, { translateY }],
        },
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, { color: palette.color }]}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  burst: {
    position: 'absolute',
    top: 126,
    alignSelf: 'center',
    zIndex: 320,
    borderRadius: 999,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: '#0F172A',
    shadowOpacity: 0.16,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '900',
  },
});
