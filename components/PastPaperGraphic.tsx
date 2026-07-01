import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';

import { useAppTheme } from '@/lib/theme';

type PastPaperGraphicProps = {
  questionId: string;
};

const graphicIds = new Set([
  'H-2025-P1-05',
  'H-2025-P1-06',
  'H-2025-P2-01',
  'H-2025-P2-03',
  'H-2025-P2-08',
  'H-2025-P2-14',
]);

export function hasPastPaperGraphic(questionId: string) {
  return graphicIds.has(questionId);
}

export function PastPaperGraphic({ questionId }: PastPaperGraphicProps) {
  const { colors, isDark } = useAppTheme();
  const stroke = isDark ? '#E5E7EB' : '#111827';
  const muted = isDark ? '#CBD5E1' : '#334155';
  const shade = isDark ? '#64748B' : '#D1D5DB';
  const bg = isDark ? '#111827' : '#FFFFFF';

  if (!hasPastPaperGraphic(questionId)) {
    return null;
  }

  return (
    <View style={[styles.frame, { backgroundColor: bg, borderColor: colors.border }]}>
      {questionId === 'H-2025-P1-05' ? <FunctionTransform stroke={stroke} muted={muted} /> : null}
      {questionId === 'H-2025-P1-06' ? <RightTriangles stroke={stroke} muted={muted} /> : null}
      {questionId === 'H-2025-P2-01' ? <TriangleLines stroke={stroke} muted={muted} /> : null}
      {questionId === 'H-2025-P2-03' ? <ParabolaArea stroke={stroke} muted={muted} shade={shade} /> : null}
      {questionId === 'H-2025-P2-08' ? <PyramidVectors stroke={stroke} muted={muted} /> : null}
      {questionId === 'H-2025-P2-14' ? <TouchingCircles stroke={stroke} muted={muted} /> : null}
    </View>
  );
}

function AxisArrow({ x1, y1, x2, y2, stroke }: { x1: number; y1: number; x2: number; y2: number; stroke: string }) {
  const isVertical = x1 === x2;
  const points = isVertical
    ? `${x2},${y2 - 12} ${x2 - 7},${y2 + 5} ${x2 + 7},${y2 + 5}`
    : `${x2 + 12},${y2} ${x2 - 5},${y2 - 7} ${x2 - 5},${y2 + 7}`;

  return (
    <G>
      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={2.4} />
      <Polygon points={points} fill={stroke} />
    </G>
  );
}

function FunctionTransform({ stroke, muted }: { stroke: string; muted: string }) {
  return (
    <Svg viewBox="0 0 360 230" style={styles.svg}>
      <AxisArrow x1={35} y1={165} x2={320} y2={165} stroke={stroke} />
      <AxisArrow x1={125} y1={214} x2={125} y2={28} stroke={stroke} />
      <Path
        d="M35 222 C47 153 63 92 125 90 C158 91 194 143 225 160 C238 167 250 167 260 160 C278 145 291 91 315 24"
        fill="none"
        stroke={stroke}
        strokeLinecap="round"
        strokeWidth={2.6}
      />
      <Circle cx={48
      } cy={165} r={3.8} fill={stroke} />
      <Circle cx={125} cy={90} r={3.8} fill={stroke} />
      <Circle cx={245} cy={165} r={3.8} fill={stroke} />
      <SvgText x={45} y={181} fill={muted} fontSize={13}>-2</SvgText>
      <SvgText x={111} y={181} fill={muted} fontSize={13}>O</SvgText>
      <SvgText x={240} y={181} fill={muted} fontSize={13}>4</SvgText>
      <SvgText x={94} y={84} fill={muted} fontSize={13}>(0, 3)</SvgText>
      <SvgText x={328} y={173} fill={muted} fontSize={14}>x</SvgText>
      <SvgText x={113} y={25} fill={muted} fontSize={14}>y</SvgText>
      <SvgText x={260} y={40} fill={muted} fontSize={14}>y = f(x)</SvgText>
    </Svg>
  );
}

function RightTriangles({ stroke, muted }: { stroke: string; muted: string }) {
  return (
    <Svg viewBox="0 0 360 250" style={styles.svg}>
      <G transform="translate(30 8)">
        <Polygon points="24,92 260,92 260,12" fill="none" stroke={stroke} strokeWidth={2.8} />
        <Path d="M98 92 A43 43 0 0 0 91 68" fill="none" stroke={stroke} strokeWidth={1.7} />
        <Rect x={242} y={74} width={18} height={18} fill="none" stroke={muted} strokeWidth={1.4} />
        <SvgText x={78} y={84} fill={muted} fontSize={18} fontWeight="800">q</SvgText>
        <SvgText x={140} y={117} fill={muted} fontSize={18} fontWeight="800">5</SvgText>
        <SvgText x={269} y={55} fill={muted} fontSize={18} fontWeight="800">1</SvgText>
      </G>
      <G transform="translate(48 135)">
        <Polygon points="24,78 236,78 236,6" fill="none" stroke={stroke} strokeWidth={2.8} />
        <Path d="M96 78 A42 42 0 0 0 89 55" fill="none" stroke={stroke} strokeWidth={1.7} />
        <Rect x={218} y={60} width={18} height={18} fill="none" stroke={muted} strokeWidth={1.4} />
        <SvgText x={78} y={72} fill={muted} fontSize={18} fontWeight="800">r</SvgText>
        <SvgText x={121} y={104} fill={muted} fontSize={18} fontWeight="800">4</SvgText>
        <SvgText x={246} y={45} fill={muted} fontSize={18} fontWeight="800">1</SvgText>
        <SvgText x={119} y={24} fill={muted} fontSize={20} fontWeight="800">√17</SvgText>
      </G>
    </Svg>
  );
}

function CubicSketch({ stroke, muted }: { stroke: string; muted: string }) {
  return (
    <Svg viewBox="0 0 360 210" style={styles.svg}>
      <AxisArrow x1={40} y1={98} x2={320} y2={98} stroke={stroke} />
      <AxisArrow x1={185} y1={178} x2={185} y2={34} stroke={stroke} />
      <Line x1={82} y1={34} x2={82} y2={178} stroke={muted} strokeDasharray="6 5" strokeWidth={1.5} />
      <Line x1={214} y1={34} x2={214} y2={178} stroke={muted} strokeDasharray="6 5" strokeWidth={1.5} />
      <Path
        d="M48 24 C58 86 70 159 82 158 C111 157 130 124 156 124 C177 124 192 142 214 130 C239 116 258 63 298 182"
        fill="none"
        stroke={stroke}
        strokeLinecap="round"
        strokeWidth={2.3}
      />
      <Line x1={48} y1={91} x2={48} y2={105} stroke={stroke} strokeWidth={1.6} />
      <Line x1={304} y1={91} x2={304} y2={105} stroke={stroke} strokeWidth={1.6} />
      <SvgText x={36} y={119} fill={muted} fontSize={13}>-10</SvgText>
      <SvgText x={291} y={119} fill={muted} fontSize={13}>10</SvgText>
      <SvgText x={191} y={115} fill={muted} fontSize={13}>O</SvgText>
      <SvgText x={327} y={106} fill={muted} fontSize={13}>x</SvgText>
      <SvgText x={174} y={31} fill={muted} fontSize={13}>y</SvgText>
    </Svg>
  );
}

function TriangleLines({ stroke, muted }: { stroke: string; muted: string }) {
  return (
    <Svg viewBox="0 0 360 250" style={styles.svg}>
      <Polygon points="120,142 188,36 236,183" fill="none" stroke={stroke} strokeLinejoin="round" strokeWidth={3} />
      <Line x1={36} y1={184} x2={315} y2={60} stroke={stroke} strokeDasharray="8 8" strokeWidth={2.5} />
      <Line x1={122} y1={224} x2={198} y2={15} stroke={stroke} strokeDasharray="8 8" strokeWidth={2.5} />
      <Circle cx={120} cy={142} r={2.8} fill={stroke} />
      <SvgText x={40} y={139} fill={muted} fontSize={15}>A (-9, -14)</SvgText>
      <SvgText x={205} y={43} fill={muted} fontSize={15}>B (9, 20)</SvgText>
      <SvgText x={236} y={202} fill={muted} fontSize={15}>C (21, -24)</SvgText>
    </Svg>
  );
}

function ParabolaArea({ stroke, muted, shade }: { stroke: string; muted: string; shade: string }) {
  return (
    <Svg viewBox="0 0 360 245" style={styles.svg}>
      <AxisArrow x1={46} y1={205} x2={324} y2={205} stroke={stroke} />
      <AxisArrow x1={132} y1={225} x2={132} y2={30} stroke={stroke} />
      <Path
        d="M180 140 C204 125 223 73 240 44 L240 205 L180 205 Z"
        fill={shade}
        opacity={0.78}
      />
      <Path
        d="M72 24 C92 144 122 164 154 158 C185 152 212 103 240 44 C249 24 253 15 256 9"
        fill="none"
        stroke={stroke}
        strokeLinecap="round"
        strokeWidth={3}
      />
      <Line x1={180} y1={205} x2={180} y2={140} stroke={stroke} strokeWidth={2.1} />
      <Line x1={240} y1={205} x2={240} y2={44} stroke={stroke} strokeWidth={2.1} />
      <SvgText x={117} y={222} fill={muted} fontSize={14}>O</SvgText>
      <SvgText x={174} y={222} fill={muted} fontSize={14}>2</SvgText>
      <SvgText x={234} y={222} fill={muted} fontSize={14}>4</SvgText>
      <SvgText x={330} y={213} fill={muted} fontSize={14}>x</SvgText>
      <SvgText x={119} y={27} fill={muted} fontSize={14}>y</SvgText>
      <SvgText x={260} y={48} fill={muted} fontSize={13}>y = x² - 2x + 3</SvgText>
    </Svg>
  );
}

function ArrowedLine({ x1, y1, x2, y2, stroke }: { x1: number; y1: number; x2: number; y2: number; stroke: string }) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const size = 7;
  const p1 = `${cx + Math.cos(angle) * size},${cy + Math.sin(angle) * size}`;
  const p2 = `${cx + Math.cos(angle + 2.35) * size},${cy + Math.sin(angle + 2.35) * size}`;
  const p3 = `${cx + Math.cos(angle - 2.35) * size},${cy + Math.sin(angle - 2.35) * size}`;

  return (
    <G>
      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={2.6} />
      <Polygon points={`${p1} ${p2} ${p3}`} fill={stroke} />
    </G>
  );
}

function PyramidVectors({ stroke, muted }: { stroke: string; muted: string }) {
  return (
    <Svg viewBox="0 0 360 250" style={styles.svg}>
      <Line x1={80} y1={176} x2={128} y2={126} stroke={stroke} strokeDasharray="5 5" strokeWidth={1.8} />
      <Line x1={128} y1={126} x2={266} y2={157} stroke={stroke} strokeDasharray="5 5" strokeWidth={1.8} />
      <Line x1={128} y1={126} x2={184} y2={42} stroke={stroke} strokeDasharray="5 5" strokeWidth={1.8} />
      <Line x1={80} y1={176} x2={184} y2={42} stroke={stroke} strokeWidth={2.7} />
      <Line x1={184} y1={42} x2={266} y2={157} stroke={stroke} strokeWidth={2.7} />
      <Line x1={184} y1={42} x2={210} y2={199} stroke={stroke} strokeWidth={2.7} />
      <ArrowedLine x1={80} y1={176} x2={210} y2={199} stroke={stroke} />
      <ArrowedLine x1={210} y1={199} x2={266} y2={157} stroke={stroke} />
      <ArrowedLine x1={184} y1={42} x2={210} y2={199} stroke={stroke} />
      <SvgText x={65} y={178} fill={muted} fontSize={15}>A</SvgText>
      <SvgText x={110} y={126} fill={muted} fontSize={15}>B</SvgText>
      <SvgText x={270} y={160} fill={muted} fontSize={15}>C</SvgText>
      <SvgText x={208} y={218} fill={muted} fontSize={15}>D</SvgText>
      <SvgText x={181} y={34} fill={muted} fontSize={15}>E</SvgText>
    </Svg>
  );
}

function TouchingCircles({ stroke, muted }: { stroke: string; muted: string }) {

  return (

    <Svg viewBox="0 0 360 245" width="100%" height="100%">

      {/* Large circle C3 */}

      <Circle

        cx={150}

        cy={122}

        r={110}

        fill="none"

        stroke={stroke}

        strokeWidth={3}

      />

      {/* Circle C1 */}

      <Circle

        cx={95}

        cy={83}

        r={43}

        fill="white"

        stroke={stroke}

        strokeWidth={3}

      />

      {/* Circle C2 */}

      <Circle

        cx={278}

        cy={193}

        r={37}

        fill="white"

        stroke={stroke}

        strokeWidth={3}

      />

      {/* Line through centres */}

      <Line

        x1={95}

        y1={83}

        x2={278}

        y2={193}

        stroke={stroke}

        strokeWidth={3}

        strokeLinecap="round"

      />

      {/* Centre points */}

      <Circle cx={95} cy={83} r={6} fill={stroke} />

      <Circle cx={150} cy={114} r={6} fill={stroke} />

      <Circle cx={278} cy={193} r={6} fill={stroke} />

      {/* Labels */}

      <SvgText x={140} y={85} fontSize={22} fill={stroke}>

        C₁

      </SvgText>

      <SvgText x={290} y={155} fontSize={22} fill={stroke}>

        C₂

      </SvgText>

      <SvgText x={222} y={35} fontSize={22} fill={stroke}>

        C₃

      </SvgText>

    </Svg>

  );
}

const styles = StyleSheet.create({
  frame: {
    alignSelf: 'stretch',
    aspectRatio: 1.55,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 8,
  },
  svg: {
    height: '100%',
    width: '100%',
  },
});
