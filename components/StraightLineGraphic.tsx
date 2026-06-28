import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { useAppTheme } from '@/lib/theme';

type StraightLineGraphicProps = {
  variant: 'perpendicular' | 'angle' | 'altitude' | 'median' | 'bisector';
};

type LinePoint = {
  x: number;
  y: number;
  label?: string;
};

type Vector = {
  x: number;
  y: number;
};

const captions: Record<StraightLineGraphicProps['variant'], string> = {
  perpendicular: 'Perpendicular lines meet at 90 degrees. Their gradients multiply to -1.',
  angle: 'The gradient is linked to the angle from the positive x-axis by m = tan a.',
  altitude: 'An altitude runs from a vertex and meets the opposite side at 90 degrees.',
  median: 'A median joins a vertex to the midpoint of the opposite side.',
  bisector: 'A perpendicular bisector passes through the midpoint at 90 degrees.',
};

function Axes({ axisColor }: { axisColor: string }) {
  return (
    <>
      <Line stroke={axisColor} strokeLinecap="round" strokeWidth="2.4" x1="28" x2="258" y1="122" y2="122" />
      <Line stroke={axisColor} strokeLinecap="round" strokeWidth="2.4" x1="42" x2="42" y1="18" y2="132" />
      <SvgText fill={axisColor} fontSize="12" fontWeight="700" x="248" y="139">x</SvgText>
      <SvgText fill={axisColor} fontSize="12" fontWeight="700" x="26" y="28">y</SvgText>
    </>
  );
}

function Point({ point, color }: { point: LinePoint; color: string }) {
  return (
    <>
      <Circle cx={point.x} cy={point.y} fill={color} r="4" />
      {point.label ? (
        <SvgText fill={color} fontSize="12" fontWeight="800" x={point.x + 6} y={point.y - 6}>
          {point.label}
        </SvgText>
      ) : null}
    </>
  );
}

function RightAngle({ x, y, color, first, second, size = 15 }: { x: number; y: number; color: string; first: Vector; second: Vector; size?: number }) {
  return (
    <Path
      d={`M${x + first.x * size} ${y + first.y * size} L${x + (first.x + second.x) * size} ${y + (first.y + second.y) * size} L${x + second.x * size} ${y + second.y * size}`}
      fill="none"
      strokeLinecap="round"
      stroke={color}
      strokeLinejoin="round"
      strokeWidth="2"
    />
  );
}

export function StraightLineGraphic({ variant }: StraightLineGraphicProps) {
  const { colors, isDark } = useAppTheme();
  const axisColor = isDark ? '#94A3B8' : '#64748B';
  const teal = '#14B8A6';
  const blue = '#2563EB';
  const amber = '#F59E0B';
  const rose = '#E11D48';
  const labelColor = isDark ? '#F8FAFC' : '#0F172A';

  return (
    <View style={[styles.card, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
      <Svg height={156} viewBox="0 0 280 156" width="100%">
        <Rect fill="transparent" height="156" width="280" x="0" y="0" />
        {variant === 'angle' ? <Axes axisColor={axisColor} /> : null}

        {variant === 'perpendicular' ? (
          <>
            <Line stroke={blue} strokeLinecap="round" strokeWidth="4" x1="48" x2="232" y1="112" y2="42" />
            <Line stroke={rose} strokeLinecap="round" strokeWidth="4" x1="111" x2="161" y1="13" y2="144" />
            <RightAngle color={amber} first={{ x: 0.93, y: -0.36 }} second={{ x: 0.36, y: 0.93 }} x={136} y={78.5} />
            <SvgText fill={labelColor} fontSize="13" fontWeight="800" x="205" y="46">L1</SvgText>
            <SvgText fill={labelColor} fontSize="13" fontWeight="800" x="177" y="128">L2</SvgText>
          </>
        ) : null}

        {variant === 'angle' ? (
          <>
            <Line stroke={teal} strokeLinecap="round" strokeWidth="4" x1="76" x2="178" y1="122" y2="34" />
            <Path d="M108 122
C107 105 102 98 100 100" fill="none" stroke={amber} strokeLinecap="round" strokeWidth="3" />
            <SvgText fill={amber} fontSize="15" fontWeight="800" x="95" y="117">a</SvgText>
            <SvgText fill={teal} fontSize="14" fontWeight="800" x="150" y="112">m = tan a</SvgText>
          </>
        ) : null}

        {variant === 'altitude' ? (
          <>
            <Path d="M56 118 L214 108 L98 34 Z" fill={isDark ? '#0F2F3A' : '#ECFEFF'} stroke={axisColor} strokeLinejoin="round" strokeWidth="2.5" />
            <Line stroke={rose} strokeDasharray="6 5" strokeLinecap="round" strokeWidth="3.5" x1="98" x2="103.1" y1="34" y2="115" />
            <RightAngle color={amber} first={{ x: -1, y: 0.06 }} second={{ x: -0.06, y: -1 }} size={13} x={103.1} y={115} />
            <Point color={blue} point={{ x: 98, y: 34, label: 'A' }} />
            <Point color={blue} point={{ x: 56, y: 118, label: 'B' }} />
            <Point color={blue} point={{ x: 214, y: 108, label: 'C' }} />
            <SvgText fill={rose} fontSize="13" fontWeight="800" x="142" y="80">altitude</SvgText>
          </>
        ) : null}

        {variant === 'median' ? (
          <>
            <Path d="M58 120 L218 106 L94 32 Z" fill={isDark ? '#102A43' : '#EFF6FF'} stroke={axisColor} strokeLinejoin="round" strokeWidth="2.5" />
            <Line stroke={teal} strokeLinecap="round" strokeWidth="3.5" x1="94" x2="138" y1="32" y2="113" />
            <Line stroke={amber} strokeLinecap="round" strokeWidth="3" x1="58" x2="138" y1="120" y2="113" />
            <Line stroke={amber} strokeLinecap="round" strokeWidth="3" x1="138" x2="218" y1="113" y2="106" />
            <Point color={blue} point={{ x: 94, y: 32, label: 'A' }} />
            <Point color={blue} point={{ x: 58, y: 120, label: 'B' }} />
            <Point color={blue} point={{ x: 218, y: 106, label: 'C' }} />
            <Point color={teal} point={{ x: 138, y: 113, label: 'M' }} />
            <SvgText fill={teal} fontSize="13" fontWeight="800" x="146" y="74">median</SvgText>
          </>
        ) : null}

        {variant === 'bisector' ? (
          <>
            <Line stroke={blue} strokeLinecap="round" strokeWidth="4" x1="56" x2="224" y1="112" y2="62" />
            <Line stroke={rose} strokeLinecap="round" strokeWidth="4" x1="123" x2="157" y1="30" y2="144" />
            <RightAngle color={amber} first={{ x: -0.96, y: 0.29 }} second={{ x: 0.29, y: 0.96 }} size={14} x={140} y={87} />
            <Line stroke={amber} strokeLinecap="round" strokeWidth="3" x1="56" x2="140" y1="112" y2="87" />
            <Line stroke={amber} strokeLinecap="round" strokeWidth="3" x1="140" x2="224" y1="87" y2="62" />
            <Point color={blue} point={{ x: 56, y: 112, label: 'A' }} />
            <Point color={blue} point={{ x: 224, y: 62, label: 'B' }} />
            <Point color={teal} point={{ x: 140, y: 87, label: 'M' }} />
            <SvgText fill={rose} fontSize="13" fontWeight="800" x="156" y="46">bisector</SvgText>
          </>
        ) : null}
      </Svg>
      <Text style={[styles.caption, { color: colors.muted }]}>{captions[variant]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    padding: 10,
  },
  caption: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
});
