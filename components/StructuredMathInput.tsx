import type { ReactNode } from 'react';
import { useRef } from 'react';
import { GestureResponderEvent, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { ExpressionEditorState, ExpressionNode, ExpressionPath, ExpressionPathSegment, PlaceholderNode, RowNode } from '@/lib/expressionEditor';
import {
  isSameExpressionPath,
  moveExpressionCursorToEnd,
  setExpressionCursor,
} from '@/lib/expressionEditor';
import { useAppTheme } from '@/lib/theme';

type StructuredMathInputProps = {
  state: ExpressionEditorState;
  onChange: (state: ExpressionEditorState) => void;
  onFocus?: () => void;
  editable?: boolean;
  size?: number;
  color?: string;
};

type RenderContext = {
  state: ExpressionEditorState;
  color: string;
  editable: boolean;
  onChange: (state: ExpressionEditorState) => void;
  onFocus?: () => void;
  primary: string;
  size: number;
};

function stop(event: GestureResponderEvent) {
  event.stopPropagation();
}

function cursorRowPath(cursorPath: ExpressionPath) {
  return cursorPath.slice(0, -1);
}

function getLastPlaceholderPath(row: RowNode, rowPath: ExpressionPath) {
  for (let index = row.children.length - 1; index >= 0; index -= 1) {
    if (row.children[index].type === 'placeholder') {
      return [...rowPath, index];
    }
  }

  return [...rowPath, Math.max(row.children.length - 1, 0)];
}

function childRowPath(path: ExpressionPath, field: Extract<ExpressionPathSegment, string>): ExpressionPath {
  return [...path, field];
}

function selectPath(context: RenderContext, path: ExpressionPath) {
  if (!context.editable) {
    return;
  }

  context.onChange(setExpressionCursor(context.state, path));
  context.onFocus?.();
}

function displayAtom(node: ExpressionNode) {
  if (node.type !== 'number' && node.type !== 'identifier' && node.type !== 'operator') {
    return '';
  }

  if (node.value === '*') {
    return '×';
  }
  if (node.value === '/') {
    return '÷';
  }
  if (node.value === 'x') {
    return '𝑥';
  }
  if (node.value === 'y') {
    return '𝑦';
  }
  return node.value;
}

function atomStyles(node: ExpressionNode) {
  if (node.type === 'identifier') {
    return styles.variableAtom;
  }
  if (node.type === 'operator') {
    return styles.operatorAtom;
  }
  return undefined;
}

function RowPressArea({
  children,
  context,
  row,
  rowPath,
  compact = false,
}: {
  children: ReactNode;
  context: RenderContext;
  row: RowNode;
  rowPath: ExpressionPath;
  compact?: boolean;
}) {
  const active = isSameExpressionPath(cursorRowPath(context.state.cursorPath), rowPath);

  return (
    <View
      accessibilityRole={context.editable ? 'button' : undefined}
      accessibilityLabel="Math row"
      onStartShouldSetResponder={() => context.editable}
      onResponderGrant={(event) => {
        stop(event);
        selectPath(context, getLastPlaceholderPath(row, rowPath));
      }}
      onResponderRelease={stop}
      style={[
        styles.row,
        compact && styles.rowCompact,
        active && {
          backgroundColor: `${context.primary}18`,
          borderColor: `${context.primary}55`,
        },
      ]}
    >
      {children}
    </View>
  );
}

function PlaceholderView({ node, path, context }: { node: PlaceholderNode; path: ExpressionPath; context: RenderContext }) {
  const active = isSameExpressionPath(context.state.cursorPath, path);
  const boxSize = Math.max(20, context.size * 0.95);

  if (node.kind === 'cursor') {
    if (!active) {
      return <View style={styles.hiddenCursorStop} />;
    }

    return (
      <View
        accessibilityRole={context.editable ? 'button' : undefined}
        accessibilityLabel="Active math cursor"
        onStartShouldSetResponder={() => context.editable}
        onResponderGrant={(event) => {
          stop(event);
          selectPath(context, path);
        }}
        onResponderRelease={stop}
        style={[styles.cursorStop, { minHeight: Math.max(24, context.size * 1.15) }]}
      >
        <Text
          style={[
            styles.placeholderCaret,
            {
              color: context.primary,
              fontSize: Math.max(16, context.size * 0.92),
            },
          ]}
        >
          |
        </Text>
      </View>
    );
  }

  return (
    <View
      accessibilityRole={context.editable ? 'button' : undefined}
      accessibilityLabel={active ? 'Active math input box' : 'Math input box'}
      onStartShouldSetResponder={() => context.editable}
      onResponderGrant={(event) => {
        stop(event);
        selectPath(context, path);
      }}
      onResponderRelease={stop}
      style={[
        styles.placeholder,
        {
          width: boxSize,
          minHeight: Math.max(24, context.size * 1.15),
          borderColor: active ? context.primary : `${context.color}66`,
          backgroundColor: active ? `${context.primary}22` : 'transparent',
        },
      ]}
    >
      <Text
        style={[
          styles.placeholderCaret,
          {
            color: active ? context.primary : `${context.color}55`,
            fontSize: Math.max(16, context.size * 0.92),
            opacity: active ? 1 : 0.55,
          },
        ]}
      >
        |
      </Text>
    </View>
  );
}

function ExpressionRowView({
  row,
  rowPath,
  context,
  compact,
}: {
  row: RowNode;
  rowPath: ExpressionPath;
  context: RenderContext;
  compact?: boolean;
}) {
  return (
    <RowPressArea row={row} rowPath={rowPath} context={context} compact={compact}>
      {row.children.map((node, index) => (
        <ExpressionNodeView key={node.id} node={node} path={[...rowPath, index]} context={context} />
      ))}
    </RowPressArea>
  );
}

function ExpressionNodeView({ node, path, context }: { node: ExpressionNode; path: ExpressionPath; context: RenderContext }) {
  if (node.type === 'placeholder') {
    return <PlaceholderView node={node} path={path} context={context} />;
  }

  if (node.type === 'number' || node.type === 'identifier' || node.type === 'operator') {
    return (
      <Text style={[styles.atom, atomStyles(node), { color: context.color, fontSize: context.size, lineHeight: context.size * 1.35 }]}>
        {displayAtom(node)}
      </Text>
    );
  }

  if (node.type === 'fraction') {
    const numeratorPath = childRowPath(path, 'numerator');
    const denominatorPath = childRowPath(path, 'denominator');
    const numeratorActive = isSameExpressionPath(cursorRowPath(context.state.cursorPath), numeratorPath);
    const denominatorActive = isSameExpressionPath(cursorRowPath(context.state.cursorPath), denominatorPath);

    return (
      <View style={styles.fraction}>
        <View style={[styles.fractionPart, numeratorActive && { backgroundColor: `${context.primary}18` }]}>
          <ExpressionRowView row={node.numerator} rowPath={numeratorPath} context={{ ...context, size: Math.max(13, context.size * 0.78) }} compact />
        </View>
        <View style={[styles.fractionBar, { backgroundColor: context.color }]} />
        <View style={[styles.fractionPart, denominatorActive && { backgroundColor: `${context.primary}18` }]}>
          <ExpressionRowView row={node.denominator} rowPath={denominatorPath} context={{ ...context, size: Math.max(13, context.size * 0.78) }} compact />
        </View>
      </View>
    );
  }

  if (node.type === 'sqrt') {
    const valuePath = childRowPath(path, 'value');
    const active = isSameExpressionPath(cursorRowPath(context.state.cursorPath), valuePath);

    return (
      <View style={styles.root}>
        <Text style={[styles.rootSymbol, { color: context.color, fontSize: context.size * 1.18, lineHeight: context.size * 1.18 }]}>
          √
        </Text>
        <View style={[styles.rootBody, { borderTopColor: context.color }, active && { backgroundColor: `${context.primary}18` }]}>
          <ExpressionRowView row={node.value} rowPath={valuePath} context={{ ...context, size: Math.max(14, context.size * 0.88) }} compact />
        </View>
      </View>
    );
  }

  if (node.type === 'power') {
    return (
      <View style={styles.power}>
        <ExpressionRowView row={node.base} rowPath={childRowPath(path, 'base')} context={context} compact />
        <View style={styles.exponent}>
          <ExpressionRowView row={node.exponent} rowPath={childRowPath(path, 'exponent')} context={{ ...context, size: Math.max(12, context.size * 0.68) }} compact />
        </View>
      </View>
    );
  }

  if (node.type === 'group') {
    return (
      <View style={styles.group}>
        <Text style={[styles.atom, { color: context.color, fontSize: context.size }]}>(</Text>
        <ExpressionRowView row={node.body} rowPath={childRowPath(path, 'body')} context={context} compact />
        <Text style={[styles.atom, { color: context.color, fontSize: context.size }]}>)</Text>
      </View>
    );
  }

  return (
    <View style={styles.functionCall}>
      <Text style={[styles.functionName, { color: context.color, fontSize: Math.max(14, context.size * 0.78) }]}>{node.name}</Text>
      <Text style={[styles.atom, { color: context.color, fontSize: context.size }]}>(</Text>
      <ExpressionRowView row={node.argument} rowPath={childRowPath(path, 'argument')} context={context} compact />
      <Text style={[styles.atom, { color: context.color, fontSize: context.size }]}>)</Text>
    </View>
  );
}

export function StructuredMathInput({ state, onChange, onFocus, editable = true, size = 22, color }: StructuredMathInputProps) {
  const { colors } = useAppTheme();
  const scrollRef = useRef<ScrollView>(null);
  const textColor = color ?? colors.text;
  const context: RenderContext = {
    state,
    color: textColor,
    editable,
    onChange,
    onFocus,
    primary: colors.primary,
    size,
  };

  function focusEnd() {
    if (!editable) {
      return;
    }

    onChange(moveExpressionCursorToEnd(state));
    onFocus?.();
  }

  return (
    <View
      accessibilityLabel="Math answer input"
      style={[styles.inputShell, { borderColor: colors.border, backgroundColor: colors.cardAlt }]}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <ExpressionRowView row={state.root} rowPath={[]} context={context} />
        <View
          onStartShouldSetResponder={() => editable}
          onResponderGrant={(event) => {
            stop(event);
            focusEnd();
          }}
          onResponderRelease={stop}
          style={styles.endTarget}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  inputShell: {
    minHeight: 76,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  scroll: {
    alignSelf: 'stretch',
    flexGrow: 0,
  },
  scrollContent: {
    alignItems: 'center',
    flexGrow: 1,
    minHeight: 50,
  },
  endTarget: {
    alignSelf: 'stretch',
    flexGrow: 1,
    minWidth: 72,
  },
  row: {
    minHeight: 34,
    minWidth: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  rowCompact: {
    minHeight: 22,
    paddingHorizontal: 1,
    paddingVertical: 1,
  },
  atom: {
    fontWeight: '500',
    includeFontPadding: false,
    paddingHorizontal: 1,
  },
  variableAtom: {
    fontWeight: '600',
  },
  operatorAtom: {
    fontWeight: '500',
  },
  functionName: {
    fontWeight: '700',
    includeFontPadding: false,
    marginRight: 1,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    borderWidth: 1.5,
    marginHorizontal: 1,
  },
  hiddenCursorStop: {
    width: 0,
  },
  cursorStop: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1,
    minWidth: 8,
  },
  placeholderCaret: {
    fontWeight: '900',
    includeFontPadding: false,
  },
  fraction: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  fractionPart: {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 26,
    minWidth: 34,
    paddingHorizontal: 2,
  },
  fractionBar: {
    alignSelf: 'stretch',
    height: 1.5,
    marginVertical: 2,
    minWidth: 30,
  },
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  rootSymbol: {
    fontWeight: '700',
    includeFontPadding: false,
    marginRight: -1,
  },
  rootBody: {
    borderTopWidth: 2,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 28,
    paddingHorizontal: 2,
    paddingTop: 2,
  },
  power: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 1,
  },
  exponent: {
    marginLeft: 1,
    transform: [{ translateY: -8 }],
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 1,
  },
  functionCall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 1,
  },
});
