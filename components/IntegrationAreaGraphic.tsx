import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

import { useAppTheme } from '@/lib/theme';

export function IntegrationAreaGraphic() {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
      <Svg height={150} viewBox="0 0 280 150" width="100%">
        <Defs>
          <LinearGradient id="integralArea" x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0" stopColor="#22C55E" stopOpacity="0.72" />
            <Stop offset="1" stopColor="#22C55E" stopOpacity="0.16" />
          </LinearGradient>
        </Defs>

        <Line stroke="#64748B" strokeLinecap="round" strokeWidth="2.5" x1="30" x2="256" y1="124" y2="124" />
        <Line stroke="#64748B" strokeLinecap="round" strokeWidth="2.5" x1="34" x2="34" y1="18" y2="132" />

        <Path d="M70 124 L70 88 C92 65 112 52 134 56 C158 60 170 82 192 66 C204 57 212 42 218 26 L218 124 Z" fill="url(#integralArea)" />
        <Path d="M54 108 C78 88 92 63 118 56 C148 48 163 82 190 66 C205 57 213 40 228 18" fill="none" stroke="#16A34A" strokeLinecap="round" strokeWidth="4" />

        <Line stroke="#0F766E" strokeDasharray="5 5" strokeLinecap="round" strokeWidth="2" x1="70" x2="70" y1="88" y2="124" />
        <Line stroke="#0F766E" strokeDasharray="5 5" strokeLinecap="round" strokeWidth="2" x1="218" x2="218" y1="26" y2="124" />
        <Circle cx="70" cy="124" fill="#0F766E" r="3" />
        <Circle cx="218" cy="124" fill="#0F766E" r="3" />

        <SvgText fill="#0F172A" fontSize="14" fontWeight="700" x="65" y="143">a</SvgText>
        <SvgText fill="#0F172A" fontSize="14" fontWeight="700" x="213" y="143">b</SvgText>
        <SvgText fill="#0F172A" fontSize="15" fontWeight="700" x="142" y="98">∫ area</SvgText>
      </Svg>
      <Text style={[styles.caption, { color: colors.muted }]}>The shaded area is found by integrating between the limits.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    gap: 4,
  },
  caption: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
});
