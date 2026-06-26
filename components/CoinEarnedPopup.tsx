import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

type CoinEarnedPopupProps = {
  amount: number;
  animationKey: number;
};

export function CoinEarnedPopup({ amount, animationKey }: CoinEarnedPopupProps) {
  const [opacity] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(0.75));
  const [translateY] = useState(() => new Animated.Value(8));

  useEffect(() => {
    if (amount <= 0) {
      return;
    }

    opacity.setValue(0);
    scale.setValue(0.75);
    translateY.setValue(8);

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
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(420),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 280,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -18,
          duration: 280,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [amount, animationKey, opacity, scale, translateY]);

  if (amount <= 0) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.popup,
        {
          opacity,
          transform: [{ scale }, { translateY }],
        },
      ]}
    >
      <View style={styles.coin}>
        <Text style={styles.coinText}>¤</Text>
      </View>
      <Text style={styles.amount}>+{amount}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  popup: {
    position: 'absolute',
    top: 78,
    alignSelf: 'center',
    zIndex: 300,
    minHeight: 38,
    borderRadius: 999,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingLeft: 6,
    paddingRight: 12,
    shadowColor: '#92400E',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  coin: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FACC15',
    borderWidth: 2,
    borderColor: '#CA8A04',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinText: {
    color: '#78350F',
    fontSize: 17,
    fontWeight: '900',
  },
  amount: {
    color: '#78350F',
    fontSize: 14,
    fontWeight: '900',
  },
});
