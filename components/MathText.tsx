import { ReactNode, useEffect, useState } from 'react';
import { GestureResponderEvent, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

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
  n: 'ⁿ',
  x: 'ˣ',
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
      accessibilityRole="button"
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
      accessibilityRole="button"
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
  const scriptSize = Math.max(11, size * 0.76);
  const numeratorBoxIndex = context.boxIndex;
  const numeratorOuterSelected = isOuterMathBoxSelected(numerator);
  const numeratorNodes = parseMathWithSelection(numerator, `${nodeKey}-num`, scriptSize, color, context, showCaret, numeratorOuterSelected);
  const denominatorBoxIndex = context.boxIndex;
  const denominatorOuterSelected = isOuterMathBoxSelected(denominator);
  const denominatorNodes = parseMathWithSelection(denominator, `${nodeKey}-den`, scriptSize, color, context, showCaret, denominatorOuterSelected);

  return (
    <View key={nodeKey} style={styles.fraction}>
      <FractionMathPart
        value={numerator}
        boxIndex={numeratorBoxIndex}
        context={context}
        selected={numeratorOuterSelected}
        style={[styles.fractionPart, styles.fractionNumerator]}
      >
        {numeratorNodes}
      </FractionMathPart>
      <View style={[styles.fractionBar, { backgroundColor: color }]} />
      <FractionMathPart
        value={denominator}
        boxIndex={denominatorBoxIndex}
        context={context}
        selected={denominatorOuterSelected}
        style={[styles.fractionPart, styles.fractionDenominator]}
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

  return (
    <View key={nodeKey} style={styles.root}>
      <Text style={[styles.rootSymbol, { color, fontSize: size * 1.18, lineHeight: size * 1.18 }]}>√</Text>
      <View style={[styles.rootBody, { borderTopColor: color }]}>
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
      accessibilityRole="button"
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

      if (hasMathInputBox(group)) {
        const scriptBoxIndex = context.boxIndex;
        const scriptSize = Math.max(10, size * 0.72);
        const scriptNodes = parseMath(group, `${keyPrefix}-${isSuperscript ? 'sup' : 'sub'}-${nodes.length}`, scriptSize, color, context, showCaret);

        nodes.push(
          <EditableMathPart
            key={`${keyPrefix}-${isSuperscript ? 'sup' : 'sub'}-${nodes.length}`}
            value={group}
            boxIndex={scriptBoxIndex}
            context={context}
            style={[
              styles.scriptGroup,
              {
                transform: [{ translateY: isSuperscript ? -size * 0.22 : size * 0.22 }],
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
  script: {
    fontWeight: '700',
  },
  scriptGroup: {
    flexDirection: 'row',
    alignItems: 'center',
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
  fractionPart: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 20,
  },
  fractionNumerator: {
    paddingBottom: 3,
    position: 'relative',
    zIndex: 1,
  },
  fractionDenominator: {
    paddingTop: 3,
    position: 'relative',
    zIndex: 3,
  },
  fractionBar: {
    alignSelf: 'stretch',
    height: 1.5,
    marginVertical: 2,
  },
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  rootSymbol: {
    fontWeight: '900',
    includeFontPadding: false,
    marginRight: -1,
  },
  rootBody: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 2,
    paddingHorizontal: 3,
    paddingTop: 2,
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
