import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { getGardenState } from '@/lib/storage';
import { useAppTheme } from '@/lib/theme';

type CoinBadgeProps = {
  coins?: number;
};

export function CoinBadge({ coins: providedCoins }: CoinBadgeProps) {
  const { isDark } = useAppTheme();
  const [storedCoins, setStoredCoins] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadCoins() {
        const garden = await getGardenState();
        if (isActive) {
          setStoredCoins(garden.coins);
        }
      }

      if (providedCoins === undefined) {
        loadCoins();
      }

      return () => {
        isActive = false;
      };
    }, [providedCoins]),
  );

  const coins = providedCoins ?? storedCoins;
  const palette = isDark
    ? {
        badgeBackground: '#422006',
        badgeBorder: '#B45309',
        text: '#FEF3C7',
        iconBackground: '#F59E0B',
        iconBorder: '#FDE68A',
        iconText: '#451A03',
      }
    : {
        badgeBackground: '#FEF3C7',
        badgeBorder: '#F59E0B',
        text: '#78350F',
        iconBackground: '#FACC15',
        iconBorder: '#CA8A04',
        iconText: '#78350F',
      };

  return (
    <View style={[styles.badge, { backgroundColor: palette.badgeBackground, borderColor: palette.badgeBorder }]}>
      <View style={[styles.coinIcon, { backgroundColor: palette.iconBackground, borderColor: palette.iconBorder }]}>
        <Text style={[styles.coinIconText, { color: palette.iconText }]}>¤</Text>
      </View>
      <Text style={[styles.coinText, { color: palette.text }]}>{coins}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingLeft: 5,
    paddingRight: 12,
  },
  coinIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinIconText: {
    fontSize: 18,
    fontWeight: '900',
  },
  coinText: {
    fontSize: 14,
    fontWeight: '900',
  },
});
