import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { useAppTheme } from '@/lib/theme';
import { CoordinatePoint, StraightLineQuestionGraphic as StraightLineQuestionGraphicData } from '@/types/maths';

type Point = {
  label?: string;
  x: number;
  y: number;
};

type ScreenPoint = Point & {
  sx: number;
  sy: number;
};

const VIEW_WIDTH = 280;
const VIEW_HEIGHT = 170;
const PADDING = 28;

const captions: Record<StraightLineQuestionGraphicData['kind'], string> = {
  'line-through-points': 'Use the change in y over the change in x.',
  altitude: 'Use the side BC to work out the gradient of the altitude from A.',
  median: 'Find the midpoint of BC, then join it to A.',
  'perpendicular-bisector': 'Find the midpoint of AB, then use the perpendicular gradient.',
};

function midpoint(first: Point, second: Point): Point {
  return {
    label: 'M',
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  };
}

function projectPointToLine(point: Point, lineStart: Point, lineEnd: Point): Point {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lengthSquared = dx * dx + dy * dy || 1;
  const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSquared;

  return {
    x: lineStart.x + t * dx,
    y: lineStart.y + t * dy,
  };
}

function getPoint(points: CoordinatePoint[], label: string) {
  return points.find((point) => point.label === label);
}

function getBounds(points: Point[]) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const xSpan = Math.max(1, maxX - minX);
  const ySpan = Math.max(1, maxY - minY);

  return {
    minX: minX - xSpan * 0.16,
    maxX: maxX + xSpan * 0.16,
    minY: minY - ySpan * 0.2,
    maxY: maxY + ySpan * 0.2,
  };
}

function createMapper(points: Point[]) {
  const bounds = getBounds(points);
  const scaleX = (VIEW_WIDTH - PADDING * 2) / (bounds.maxX - bounds.minX || 1);
  const scaleY = (VIEW_HEIGHT - PADDING * 2) / (bounds.maxY - bounds.minY || 1);
  const scale = Math.min(scaleX, scaleY);
  const drawingWidth = (bounds.maxX - bounds.minX) * scale;
  const drawingHeight = (bounds.maxY - bounds.minY) * scale;
  const offsetX = (VIEW_WIDTH - drawingWidth) / 2;
  const offsetY = (VIEW_HEIGHT - drawingHeight) / 2;

  return (point: Point): ScreenPoint => ({
    ...point,
    sx: offsetX + (point.x - bounds.minX) * scale,
    sy: offsetY + (bounds.maxY - point.y) * scale,
  });
}

function RightAngleMarker({ origin, along, across, color }: { origin: ScreenPoint; along: Point; across: Point; color: string }) {
  const lengthA = Math.hypot(along.x, along.y) || 1;
  const lengthB = Math.hypot(across.x, across.y) || 1;
  const size = 13;
  const a = { x: along.x / lengthA, y: -along.y / lengthA };
  const b = { x: across.x / lengthB, y: -across.y / lengthB };
  const p1 = { x: origin.sx + a.x * size, y: origin.sy + a.y * size };
  const p2 = { x: p1.x + b.x * size, y: p1.y + b.y * size };
  const p3 = { x: origin.sx + b.x * size, y: origin.sy + b.y * size };

  return <Path d={`M${p1.x} ${p1.y} L${p2.x} ${p2.y} L${p3.x} ${p3.y}`} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />;
}

function PointDot({ point, color, labelColor, showCoordinates = true }: { point: ScreenPoint; color: string; labelColor: string; showCoordinates?: boolean }) {
  return (
    <>
      <Circle cx={point.sx} cy={point.sy} fill={color} r="4" />
      {point.label ? (
        <SvgText fill={labelColor} fontSize="12" fontWeight="800" x={point.sx + 7} y={point.sy - 7}>
          {showCoordinates ? `${point.label}(${point.x},${point.y})` : point.label}
        </SvgText>
      ) : null}
    </>
  );
}

export function StraightLineQuestionGraphic({ graphic }: { graphic: StraightLineQuestionGraphicData }) {
  const { colors, isDark } = useAppTheme();
  const basePoints = graphic.points;
  const pointA = getPoint(basePoints, 'A') ?? basePoints[0];
  const pointB = getPoint(basePoints, 'B') ?? basePoints[1];
  const pointC = getPoint(basePoints, 'C') ?? basePoints[2];
  const derivedPoints: Point[] = [];
  const blue = isDark ? '#67E8F9' : '#0F766E';
  const accent = isDark ? '#FB7185' : '#E11D48';
  const highlight = isDark ? '#FBBF24' : '#F59E0B';
  const labelColor = colors.text;
  const gridColor = isDark ? '#334155' : '#CBD5E1';

  if (graphic.kind === 'altitude' && pointA && pointB && pointC) {
    derivedPoints.push(projectPointToLine(pointA, pointB, pointC));
  }
  if (graphic.kind === 'median' && pointB && pointC) {
    derivedPoints.push(midpoint(pointB, pointC));
  }
  if (graphic.kind === 'perpendicular-bisector' && pointA && pointB) {
    derivedPoints.push(midpoint(pointA, pointB));
  }

  const map = createMapper([...basePoints, ...derivedPoints]);
  const mappedPoints = basePoints.map(map);
  const a = pointA ? map(pointA) : undefined;
  const b = pointB ? map(pointB) : undefined;
  const c = pointC ? map(pointC) : undefined;

  return (
    <View style={[styles.card, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
      <Svg height={170} viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} width="100%">
        <Rect fill="transparent" height={VIEW_HEIGHT} width={VIEW_WIDTH} x="0" y="0" />
        {[0, 1, 2, 3].map((index) => (
          <Line key={`grid-h-${index}`} stroke={gridColor} strokeOpacity="0.38" strokeWidth="1" x1="20" x2="260" y1={34 + index * 32} y2={34 + index * 32} />
        ))}
        {[0, 1, 2, 3, 4].map((index) => (
          <Line key={`grid-v-${index}`} stroke={gridColor} strokeOpacity="0.28" strokeWidth="1" x1={36 + index * 48} x2={36 + index * 48} y1="18" y2="150" />
        ))}

        {graphic.kind === 'line-through-points' && a && b ? <Line stroke={blue} strokeLinecap="round" strokeWidth="3.5" x1={a.sx} x2={b.sx} y1={a.sy} y2={b.sy} /> : null}

        {(graphic.kind === 'altitude' || graphic.kind === 'median') && a && b && c ? (
          <Path d={`M${a.sx} ${a.sy} L${b.sx} ${b.sy} L${c.sx} ${c.sy} Z`} fill={isDark ? '#0F2F3A' : '#ECFEFF'} stroke={blue} strokeLinejoin="round" strokeWidth="2.3" />
        ) : null}

        {graphic.kind === 'altitude' && pointA && pointB && pointC && a ? (() => {
          const foot = projectPointToLine(pointA, pointB, pointC);
          const mappedFoot = map(foot);
          return (
            <>
              <Line stroke={accent} strokeDasharray="6 5" strokeLinecap="round" strokeOpacity="0.75" strokeWidth="2.5" x1={a.sx} x2={mappedFoot.sx} y1={a.sy} y2={mappedFoot.sy} />
            </>
          );
        })() : null}

        {graphic.kind === 'median' && pointA && pointB && pointC && a ? (() => {
          const mid = midpoint(pointB, pointC);
          const mappedMid = map(mid);
          return (
            <>
              <Line stroke={accent} strokeLinecap="round" strokeWidth="3" x1={a.sx} x2={mappedMid.sx} y1={a.sy} y2={mappedMid.sy} />
            </>
          );
        })() : null}

        {graphic.kind === 'perpendicular-bisector' && pointA && pointB && a && b ? (() => {
          const mid = midpoint(pointA, pointB);
          const mappedMid = map(mid);
          const direction = { x: -(pointB.y - pointA.y), y: pointB.x - pointA.x };
          const screenDx = b.sx - a.sx;
          const screenDy = b.sy - a.sy;
          const screenLength = Math.hypot(screenDx, screenDy) || 1;
          const ux = -screenDy / screenLength;
          const uy = screenDx / screenLength;
          const guideLength = Math.max(54, Math.min(82, screenLength * 0.8));
          return (
            <>
              <Line stroke={blue} strokeLinecap="round" strokeWidth="3.2" x1={a.sx} x2={b.sx} y1={a.sy} y2={b.sy} />
              <Line
                stroke={accent}
                strokeDasharray="7 5"
                strokeLinecap="round"
                strokeOpacity="0.75"
                strokeWidth="2.6"
                x1={mappedMid.sx - ux * guideLength}
                x2={mappedMid.sx + ux * guideLength}
                y1={mappedMid.sy - uy * guideLength}
                y2={mappedMid.sy + uy * guideLength}
              />
              <RightAngleMarker color={highlight} origin={mappedMid} along={{ x: pointB.x - pointA.x, y: pointB.y - pointA.y }} across={direction} />
            </>
          );
        })() : null}

        {mappedPoints.map((point) => (
          <PointDot color={blue} key={point.label ?? `${point.x}:${point.y}`} labelColor={labelColor} point={point} />
        ))}
      </Svg>
      <Text style={[styles.caption, { color: colors.muted }]}>{captions[graphic.kind]}</Text>
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
