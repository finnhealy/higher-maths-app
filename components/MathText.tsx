import { ReactNode, useEffect, useState } from 'react';
import { GestureResponderEvent, Platform, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { MATH_INPUT_CARET, MATH_INPUT_CURSOR } from '@/lib/mathInput';
import { useAppTheme } from '@/lib/theme';

type MathTextProps = {
  content: string;
  displayMode?: boolean;
  size?: number;
  color?: string;
  onMathBoxPress?: (boxIndex: number) => void;
  noWrap?: boolean;
};

const symbolMap: Record<string, string> = {
  '\\sin': 'sin',
  '\\cos': 'cos',
  '\\tan': 'tan',
  '\\log': 'log',
  '\\mathbb': '',
  '\\int': '∫',
  '\\in': '∈',
  '\\le': '≤',
  '\\ge': '≥',
  '\\times': '×',
  '\\cdot': '·',
  '\\prime': '′',
  '\\circ': '°',
  '\\iff': '⇔',
  '\\text': '',
  '\\quad': ' ',
  '\\,': ' ',
  '\\ ': ' ',
};

const editableMathRole = Platform.OS === 'web' ? undefined : 'button';

const superscriptMap: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
  '=': '⁼',
  a: 'ᵃ',
  b: 'ᵇ',
  c: 'ᶜ',
  d: 'ᵈ',
  e: 'ᵉ',
  f: 'ᶠ',
  g: 'ᵍ',
  h: 'ʰ',
  i: 'ⁱ',
  j: 'ʲ',
  k: 'ᵏ',
  l: 'ˡ',
  m: 'ᵐ',
  n: 'ⁿ',
  o: 'ᵒ',
  p: 'ᵖ',
  r: 'ʳ',
  s: 'ˢ',
  t: 'ᵗ',
  u: 'ᵘ',
  v: 'ᵛ',
  w: 'ʷ',
  x: 'ˣ',
  y: 'ʸ',
  z: 'ᶻ',
};

const subscriptMap: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
  '+': '₊',
  '-': '₋',
  '=': '₌',
  a: 'ₐ',
  e: 'ₑ',
  h: 'ₕ',
  i: 'ᵢ',
  j: 'ⱼ',
  k: 'ₖ',
  l: 'ₗ',
  m: 'ₘ',
  n: 'ₙ',
  o: 'ₒ',
  p: 'ₚ',
  r: 'ᵣ',
  s: 'ₛ',
  t: 'ₜ',
  u: 'ᵤ',
  v: 'ᵥ',
  x: 'ₓ',
};

function mapScript(value: string, map: Record<string, string>) {
  return value
    .split('')
    .map((char) => map[char] ?? char)
    .join('');
}

function mapMathCharacter(char: string) {
  if (char === '*') {
    return '×';
  }
  if (char === 'x') {
    return '𝑥';
  }
  if (char === 'y') {
    return '𝑦';
  }
  return char;
}

function readGroup(value: string, start: number) {
  if (value[start] !== '{') {
    return { group: value[start] ?? '', end: start + 1 };
  }

  let depth = 0;
  for (let index = start; index < value.length; index += 1) {
    if (value[index] === '{') {
      depth += 1;
    }
    if (value[index] === '}') {
      depth -= 1;
    }
    if (depth === 0) {
      return { group: value.slice(start + 1, index), end: index + 1 };
    }
  }

  return { group: value.slice(start + 1), end: value.length };
}

function readParenthesised(value: string, start: number) {
  if (value[start] !== '(') {
    return { group: value[start] ?? '', end: start + 1 };
  }

  let depth = 0;
  for (let index = start; index < value.length; index += 1) {
    if (value[index] === '(') {
      depth += 1;
    }
    if (value[index] === ')') {
      depth -= 1;
    }
    if (depth === 0) {
      return { group: value.slice(start + 1, index), end: index + 1 };
    }
  }

  return { group: value.slice(start + 1), end: value.length };
}

function normaliseLatex(value: string) {
  let output = value;

  output = output.replace(/\\overrightarrow\{([^{}]+)\}/g, '→$1');
  output = output.replace(/\\mathbf\{([^{}]+)\}/g, '$1');
  output = output.replace(/\\left/g, '').replace(/\\right/g, '');

  Object.entries(symbolMap).forEach(([latex, replacement]) => {
    output = output.replaceAll(latex, replacement);
  });

  return output;
}

type ParseContext = {
  boxIndex: number;
  onMathBoxPress?: (boxIndex: number) => void;
};

function hasMathInputBox(value: string) {
  return value.includes(MATH_INPUT_CURSOR);
}

function countMathInputBoxes(value: string) {
  return value.split(MATH_INPUT_CURSOR).length - 1;
}

function getEditableRegionEnd(value: string, cursorIndex: number) {
  let depth = 0;
  let index = cursorIndex + MATH_INPUT_CURSOR.length;

  while (index < value.length) {
    const char = value[index];

    if (char === MATH_INPUT_CURSOR) {
      return index;
    }

    if (char === '{' || char === '(') {
      depth += 1;
      index += 1;
      continue;
    }

    if (char === '}' || char === ')') {
      if (depth === 0) {
        return index;
      }
      depth -= 1;
      index += 1;
      continue;
    }

    index += 1;
  }

  return index;
}

function isOuterMathBoxSelected(value: string) {
  const activeCaretIndex = value.indexOf(MATH_INPUT_CARET);
  const withoutCaret = value.replaceAll(MATH_INPUT_CARET, '');
  const cursorIndex = withoutCaret.indexOf(MATH_INPUT_CURSOR);

  if (activeCaretIndex < 0 || cursorIndex < 0) {
    return false;
  }

  return activeCaretIndex === getEditableRegionEnd(withoutCaret, cursorIndex);
}

function parseMathWithSelection(value: string, keyPrefix: string, size: number, color: string, context: ParseContext, showCaret: boolean, selectable: boolean) {
  if (selectable) {
    return parseMath(value, keyPrefix, size, color, context, showCaret);
  }

  const passiveContext: ParseContext = { boxIndex: context.boxIndex };
  const nodes = parseMath(value, keyPrefix, size, color, passiveContext, showCaret);
  context.boxIndex = passiveContext.boxIndex;
  return nodes;
}

function EditableMathPart({
  value,
  children,
  boxIndex,
  context,
  style,
}: {
  value: string;
  children: ReactNode;
  boxIndex: number;
  context: ParseContext;
  style: StyleProp<ViewStyle>;
}) {
  if (!context.onMathBoxPress || countMathInputBoxes(value) !== 1) {
    return <View style={style}>{children}</View>;
  }

  return (
    <View
      accessibilityRole={editableMathRole}
      accessibilityLabel="Math input area"
      onStartShouldSetResponder={() => true}
      onResponderGrant={(event: GestureResponderEvent) => {
        event.stopPropagation();
        context.onMathBoxPress?.(boxIndex);
      }}
      onResponderRelease={(event: GestureResponderEvent) => {
        event.stopPropagation();
      }}
      style={style}
    >
      {children}
    </View>
  );
}

function FractionMathPart({
  value,
  children,
  boxIndex,
  context,
  selected,
  style,
}: {
  value: string;
  children: ReactNode;
  boxIndex: number;
  context: ParseContext;
  selected: boolean;
  style: StyleProp<ViewStyle>;
}) {
  if (!context.onMathBoxPress || !hasMathInputBox(value) || selected) {
    return <View style={style}>{children}</View>;
  }

  return (
    <View
      accessibilityRole={editableMathRole}
      accessibilityLabel="Fraction input area"
      pointerEvents={selected ? 'auto' : 'box-only'}
      onStartShouldSetResponderCapture={() => true}
      onStartShouldSetResponder={() => true}
      onResponderGrant={(event: GestureResponderEvent) => {
        event.stopPropagation();
        context.onMathBoxPress?.(boxIndex);
      }}
      onResponderRelease={(event: GestureResponderEvent) => {
        event.stopPropagation();
      }}
      onResponderTerminationRequest={() => false}
      style={style}
    >
      {children}
    </View>
  );
}

function Fraction({
  numerator,
  denominator,
  color,
  size,
  nodeKey,
  context,
  showCaret,
}: {
  numerator: string;
  denominator: string;
  color: string;
  size: number;
  nodeKey: string;
  context: ParseContext;
  showCaret: boolean;
}) {
  const compact = size < 10;
  const scriptSize = Math.max(compact ? 7 : 11, size * 0.94);
  const numeratorBoxIndex = context.boxIndex;
  const numeratorOuterSelected = isOuterMathBoxSelected(numerator);
  const numeratorNodes = parseMathWithSelection(numerator, `${nodeKey}-num`, scriptSize, color, context, showCaret, numeratorOuterSelected);
  const denominatorBoxIndex = context.boxIndex;
  const denominatorOuterSelected = isOuterMathBoxSelected(denominator);
  const denominatorNodes = parseMathWithSelection(denominator, `${nodeKey}-den`, scriptSize, color, context, showCaret, denominatorOuterSelected);

  return (
    <View key={nodeKey} style={[styles.fraction, compact && styles.compactFraction]}>
      <FractionMathPart
        value={numerator}
        boxIndex={numeratorBoxIndex}
        context={context}
        selected={numeratorOuterSelected}
        style={[styles.fractionPart, compact && styles.compactFractionPart, styles.fractionNumerator, compact && styles.compactFractionNumerator]}
      >
        {numeratorNodes}
      </FractionMathPart>
      <View style={[styles.fractionBar, compact && styles.compactFractionBar, { backgroundColor: color }]} />
      <FractionMathPart
        value={denominator}
        boxIndex={denominatorBoxIndex}
        context={context}
        selected={denominatorOuterSelected}
        style={[styles.fractionPart, compact && styles.compactFractionPart, styles.fractionDenominator, compact && styles.compactFractionDenominator]}
      >
        {denominatorNodes}
      </FractionMathPart>
    </View>
  );
}

function SquareRoot({
  radicand,
  color,
  size,
  nodeKey,
  context,
  showCaret,
}: {
  radicand: string;
  color: string;
  size: number;
  nodeKey: string;
  context: ParseContext;
  showCaret: boolean;
}) {
  const radicandNodes = parseMath(radicand, `${nodeKey}-radicand`, size, color, context, showCaret);
  const [bodyWidth, setBodyWidth] = useState(size);
  const rootHeight = size * 1.55;
  const markWidth = size * 0.82;
  const strokeWidth = Math.max(1.8, size * 0.09);
  const svgWidth = markWidth + Math.max(bodyWidth, size * 0.75) + 5;
  const topY = strokeWidth;
  const midY = rootHeight * 0.62;
  const bottomY = rootHeight - strokeWidth;
  const path = `M1 ${midY} L${markWidth * 0.28} ${midY} L${markWidth * 0.43} ${bottomY} L${markWidth * 0.68} ${topY} L${svgWidth - 1} ${topY}`;

  return (
    <View key={nodeKey} style={[styles.root, { minHeight: rootHeight }]}>
      <Svg height={rootHeight} pointerEvents="none" style={styles.rootSvg} viewBox={`0 0 ${svgWidth} ${rootHeight}`} width={svgWidth}>
        <Path
          d={path}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokeWidth}
        />
      </Svg>
      <View style={{ width: markWidth - 2 }} />
      <View
        onLayout={(event) => {
          const nextWidth = event.nativeEvent.layout.width;
          setBodyWidth((currentWidth) => (Math.abs(currentWidth - nextWidth) > 0.5 ? nextWidth : currentWidth));
        }}
        style={[styles.rootBody, { paddingTop: strokeWidth + 4 }]}
      >
        {radicandNodes}
      </View>
    </View>
  );
}

function MathInputBox({
  active,
  boxIndex,
  color,
  context,
  size,
  showCaret,
}: {
  active?: boolean;
  boxIndex: number;
  color: string;
  context: ParseContext;
  size: number;
  showCaret: boolean;
}) {
  const inputBoxStyle = [styles.inputBox, { borderColor: color, width: size * 0.95, height: size * 1.08 }];

  if (!context.onMathBoxPress) {
    return (
      <View style={inputBoxStyle}>
        <Text style={[styles.boxCaret, { color, fontSize: size * 0.9, lineHeight: size, opacity: active && showCaret ? 1 : 0 }]}>|</Text>
      </View>
    );
  }

  return (
    <View
      accessibilityRole={editableMathRole}
      accessibilityLabel="Math input box"
      onStartShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={(event: GestureResponderEvent) => {
        event.stopPropagation();
        context.onMathBoxPress?.(boxIndex);
      }}
      onResponderRelease={(event: GestureResponderEvent) => {
        event.stopPropagation();
      }}
      style={inputBoxStyle}
    >
      <Text style={[styles.boxCaret, { color, fontSize: size * 0.9, lineHeight: size, opacity: active && showCaret ? 1 : 0 }]}>|</Text>
    </View>
  );
}

function parseMath(value: string, keyPrefix: string, size: number, color: string, context: ParseContext = { boxIndex: 0 }, showCaret = true) {
  const normalised = normaliseLatex(value);
  const nodes: ReactNode[] = [];
  let buffer = '';
  let index = 0;

  function flushBuffer() {
    if (!buffer) {
      return;
    }
    nodes.push(
      <Text key={`${keyPrefix}-text-${nodes.length}`} style={{ color, fontSize: size }}>
        {buffer}
      </Text>,
    );
    buffer = '';
  }

  while (index < normalised.length) {
    const char = normalised[index];

    if (normalised.startsWith('\\sqrt', index)) {
      flushBuffer();
      const radicand = readGroup(normalised, index + '\\sqrt'.length);

      nodes.push(
        <SquareRoot
          key={`${keyPrefix}-sqrt-${nodes.length}`}
          nodeKey={`${keyPrefix}-sqrt-${nodes.length}`}
          radicand={radicand.group}
          color={color}
          size={size}
          context={context}
          showCaret={showCaret}
        />,
      );
      index = radicand.end;
      continue;
    }

    if (normalised.startsWith('sqrt(', index)) {
      flushBuffer();
      const radicand = readParenthesised(normalised, index + 'sqrt'.length);

      nodes.push(
        <SquareRoot
          key={`${keyPrefix}-sqrt-${nodes.length}`}
          nodeKey={`${keyPrefix}-sqrt-${nodes.length}`}
          radicand={radicand.group}
          color={color}
          size={size}
          context={context}
          showCaret={showCaret}
        />,
      );
      index = radicand.end;
      continue;
    }

    if (normalised.startsWith('\\frac', index)) {
      flushBuffer();
      const numerator = readGroup(normalised, index + '\\frac'.length);
      const denominator = readGroup(normalised, numerator.end);

      nodes.push(
        <Fraction
          key={`${keyPrefix}-frac-${nodes.length}`}
          nodeKey={`${keyPrefix}-frac-${nodes.length}`}
          numerator={numerator.group}
          denominator={denominator.group}
          color={color}
          size={size}
          context={context}
          showCaret={showCaret}
        />,
      );
      index = denominator.end;
      continue;
    }

    if (char === '^' || char === '_') {
      flushBuffer();
      const { group, end } = readGroup(normalised, index + 1);
      const isSuperscript = char === '^';
      const isStructuredScript = hasStructuredMath(group);

      if (hasMathInputBox(group) || isStructuredScript) {
        const scriptBoxIndex = context.boxIndex;
        const scriptSize = Math.max(6, size * (isStructuredScript ? 0.36 : 0.72));
        const scriptNodes = parseMath(group, `${keyPrefix}-${isSuperscript ? 'sup' : 'sub'}-${nodes.length}`, scriptSize, color, context, showCaret);

        nodes.push(
          <EditableMathPart
            key={`${keyPrefix}-${isSuperscript ? 'sup' : 'sub'}-${nodes.length}`}
            value={group}
            boxIndex={scriptBoxIndex}
            context={context}
            style={[
              styles.scriptGroup,
              isStructuredScript && styles.structuredScriptGroup,
              {
                transform: [{ translateY: isSuperscript ? -size * (isStructuredScript ? 0.58 : 0.22) : size * 0.22 }],
              },
            ]}
          >
            {scriptNodes}
          </EditableMathPart>,
        );
        index = end;
        continue;
      }

      nodes.push(
        <Text
          key={`${keyPrefix}-${isSuperscript ? 'sup' : 'sub'}-${nodes.length}`}
          style={[
            styles.script,
            {
              color,
              fontSize: Math.max(10, size * 0.72),
              lineHeight: size,
              transform: [{ translateY: isSuperscript ? -size * 0.22 : size * 0.22 }],
            },
          ]}
        >
          {mapScript(group.replace(/[{}]/g, ''), isSuperscript ? superscriptMap : subscriptMap)}
        </Text>,
      );
      index = end;
      continue;
    }

    if (char === MATH_INPUT_CURSOR) {
      flushBuffer();
      const boxIndex = context.boxIndex;
      context.boxIndex += 1;
      const isActiveBox = normalised[index + 1] === MATH_INPUT_CARET;
      const nextChar = isActiveBox ? normalised[index + 2] : normalised[index + 1];
      const shouldShowBox = !nextChar || nextChar === '}' || nextChar === ')' || nextChar === '{';

      if (isActiveBox) {
        index += 1;
      }

      if (shouldShowBox) {
        nodes.push(
          <MathInputBox
            key={`${keyPrefix}-box-${boxIndex}`}
            active={isActiveBox}
            boxIndex={boxIndex}
            color={color}
            context={context}
            size={size}
            showCaret={showCaret}
          />,
        );
      }
      index += 1;
      continue;
    }

    if (char === MATH_INPUT_CARET) {
      flushBuffer();
      nodes.push(
        <Text key={`${keyPrefix}-caret-${nodes.length}`} style={[styles.caret, { color, fontSize: size, opacity: showCaret ? 1 : 0 }]}>
          |
        </Text>,
      );
      index += 1;
      continue;
    }

    if (char === '\\') {
      const commandMatch = normalised.slice(index).match(/^\\[a-zA-Z]+/);
      if (commandMatch) {
        buffer += commandMatch[0].slice(1);
        index += commandMatch[0].length;
        continue;
      }
    }

    if (char !== '{' && char !== '}') {
      buffer += mapMathCharacter(char);
    }
    index += 1;
  }

  flushBuffer();
  return nodes;
}

function hasComplexInlineMath(value: string) {
  return (
    value.includes(MATH_INPUT_CURSOR) ||
    value.includes(MATH_INPUT_CARET) ||
    hasStructuredMath(value)
  );
}

function hasStructuredMath(value: string) {
  return value.includes('\\frac') || value.includes('\\sqrt') || value.includes('sqrt(');
}

function formatInlineMath(value: string) {
  const normalised = normaliseLatex(value);
  let output = '';
  let index = 0;

  while (index < normalised.length) {
    const char = normalised[index];

    if (char === '^' || char === '_') {
      const { group, end } = readGroup(normalised, index + 1);
      output += mapScript(group.replace(/[{}]/g, ''), char === '^' ? superscriptMap : subscriptMap);
      index = end;
      continue;
    }

    if (char === '\\') {
      const commandMatch = normalised.slice(index).match(/^\\[a-zA-Z]+/);
      if (commandMatch) {
        output += commandMatch[0].slice(1);
        index += commandMatch[0].length;
        continue;
      }
    }

    if (char !== '{' && char !== '}') {
      output += mapMathCharacter(char);
    }
    index += 1;
  }

  return output;
}

function canRenderInlineText(content: string, onMathBoxPress: ((boxIndex: number) => void) | undefined) {
  if (onMathBoxPress) {
    return false;
  }

  return content
    .split(/(\$[^$]+\$)/g)
    .filter((part) => part.startsWith('$') && part.endsWith('$'))
    .every((part) => !hasComplexInlineMath(part.slice(1, -1)));
}

function parseInlineTextContent(content: string, size: number, color: string) {
  return content.split(/(\$[^$]+\$)/g).map((part, index) => {
    if (part.startsWith('$') && part.endsWith('$')) {
      return (
        <Text key={`inline-math-${index}`} style={[styles.inlineMath, { color, fontSize: size }]}>
          {formatInlineMath(part.slice(1, -1))}
        </Text>
      );
    }

    return part;
  });
}

function parseMixedContent(content: string, size: number, color: string, onMathBoxPress: ((boxIndex: number) => void) | undefined, showCaret: boolean) {
  const context: ParseContext = { boxIndex: 0, onMathBoxPress };

  return content.split(/(\$[^$]+\$)/g).map((part, index) => {
    if (part.startsWith('$') && part.endsWith('$')) {
      return parseMath(part.slice(1, -1), `math-${index}`, size, color, context, showCaret);
    }

    return (
      <Text key={`plain-${index}`} style={{ color, fontSize: size }}>
        {part}
      </Text>
    );
  });
}

export function MathText({ content, displayMode = false, size = 16, color, onMathBoxPress, noWrap = false }: MathTextProps) {
  const { colors } = useAppTheme();
  const textColor = color ?? colors.text;
  const [showCaret, setShowCaret] = useState(true);
  const hasCaret = content.includes(MATH_INPUT_CARET);
  const caretVisible = !hasCaret || showCaret;

  useEffect(() => {
    if (!hasCaret) {
      return undefined;
    }

    const interval = setInterval(() => {
      setShowCaret((current) => !current);
    }, 520);

    return () => clearInterval(interval);
  }, [hasCaret]);

  if (displayMode) {
    return (
      <View style={[styles.displayBlock, { borderColor: colors.border, backgroundColor: colors.cardAlt }]}>
        <View style={[styles.mathLine, noWrap && styles.mathLineNoWrap, styles.displayLine]}>
          {parseMath(content, 'display', size + 4, textColor, { boxIndex: 0, onMathBoxPress }, caretVisible)}
        </View>
      </View>
    );
  }

  if (canRenderInlineText(content, onMathBoxPress)) {
    return (
      <Text style={[styles.inlineText, { color: textColor, fontSize: size, lineHeight: size * 1.35 }]}>
        {parseInlineTextContent(content, size, textColor)}
      </Text>
    );
  }

  return (
    <View style={[styles.mathLine, noWrap && styles.mathLineNoWrap]}>
      {parseMixedContent(content, size, textColor, onMathBoxPress, caretVisible)}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '600',
  },
  inlineText: {
    fontWeight: '500',
  },
  inlineMath: {
    fontStyle: 'italic',
    fontWeight: '500',
  },
  script: {
    fontWeight: '700',
  },
  scriptGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  structuredScriptGroup: {
    marginLeft: -1,
    marginRight: 1,
  },
  mathLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  mathLineNoWrap: {
    flexWrap: 'nowrap',
  },
  displayLine: {
    justifyContent: 'center',
  },
  fraction: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    minWidth: 16,
    position: 'relative',
  },
  compactFraction: {
    marginHorizontal: 0,
    minWidth: 8,
  },
  fractionPart: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 20,
  },
  compactFractionPart: {
    minHeight: 9,
  },
  fractionNumerator: {
    paddingBottom: 3,
    position: 'relative',
    zIndex: 1,
  },
  compactFractionNumerator: {
    paddingBottom: 0,
  },
  fractionDenominator: {
    paddingTop: 3,
    position: 'relative',
    zIndex: 3,
  },
  compactFractionDenominator: {
    paddingTop: 0,
  },
  fractionBar: {
    alignSelf: 'stretch',
    height: 1.5,
    marginVertical: 2,
  },
  compactFractionBar: {
    height: 1,
    marginVertical: 0.5,
  },
  root: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 2,
    position: 'relative',
  },
  rootSvg: {
    left: 0,
    position: 'absolute',
    top: 0,
  },
  rootBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 3,
    minHeight: 20,
  },
  inputBox: {
    borderWidth: 1.5,
    borderRadius: 4,
    marginHorizontal: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caret: {
    fontWeight: '900',
    marginHorizontal: 1,
  },
  boxCaret: {
    fontWeight: '900',
    includeFontPadding: false,
  },
  displayBlock: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  displayText: {
    textAlign: 'center',
    fontWeight: '800',
  },
});
