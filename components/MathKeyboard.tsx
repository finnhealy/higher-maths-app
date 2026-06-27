import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ExpressionNavigationAction } from '@/lib/expressionEditor';
import { COS_BOX_TOKEN, FRACTION_BOX_TOKEN, POWER_BOX_TOKEN, SIN_BOX_TOKEN, SQRT_BOX_TOKEN } from '@/lib/mathInput';
import { useAppTheme } from '@/lib/theme';

type MathKeyboardProps = {
  onInsert: (value: string) => void;
  onBackspace: () => void;
  onNavigate?: (action: ExpressionNavigationAction) => void;
  onEnter?: () => void;
  fill?: boolean;
};

type MathKeyboardOverlayProps = MathKeyboardProps & {
  visible: boolean;
  onDismiss: () => void;
};

type KeyVariant = 'number' | 'operation' | 'structure' | 'variable' | 'function' | 'navigation' | 'delete' | 'enter';

const rows = [
  [
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: '÷', value: '/' },
    { label: '□²', value: 'power-2', accessibilityLabel: 'Squared' },
    { label: '⌫', value: 'backspace', accessibilityLabel: 'Backspace' },
  ],
  [
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '×', value: '*' },
    { label: '□³', value: 'power-3', accessibilityLabel: 'Cubed' },
    { label: '√□', value: 'sqrt-box', accessibilityLabel: 'Square root box' },
  ],
  [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '+', value: '+' },
    { label: '□/□', value: 'fraction-box', accessibilityLabel: 'Fraction box' },
    { label: '□ⁿ', value: 'power-box', accessibilityLabel: 'Power box' },
  ],
  [
    { label: '0', value: '0' },
    { label: '.', value: '.' },
    { label: ',', value: ',', accessibilityLabel: 'Comma' },
    { label: '-', value: '-' },
    { label: '=', value: '=' },
    { label: '𝑥', value: 'x', accessibilityLabel: 'x' },
    { label: '𝑦', value: 'y', accessibilityLabel: 'y' },
  ],
  [
    { label: 'sin', value: 'sin-box' },
    { label: 'cos', value: 'cos-box' },
    { label: '<', value: '<' },
    { label: '>', value: '>' },
    { label: '(', value: '(' },
    { label: ')', value: ')' },
    { label: '↵', value: 'enter', accessibilityLabel: 'Enter' },
  ],
];

const navigationRow: { label: string; action?: ExpressionNavigationAction; value?: 'delete'; accessibilityLabel: string }[] = [
  { label: '←', action: 'left', accessibilityLabel: 'Move cursor left' },
  { label: '→', action: 'right', accessibilityLabel: 'Move cursor right' },
  { label: '↑', action: 'up', accessibilityLabel: 'Move cursor up' },
  { label: '↓', action: 'down', accessibilityLabel: 'Move cursor down' },
  { label: 'Next', action: 'next-placeholder', accessibilityLabel: 'Next input box' },
  { label: 'Delete', value: 'delete', accessibilityLabel: 'Delete' },
];
const CURVED_SCREEN_BACKGROUND_DROP = 8;
const CURVED_SCREEN_KEYBOARD_DROP = 2;
const MAX_CURVED_SCREEN_KEY_PADDING = 8;
const BOTTOM_FILL_EXTRA = 56;

function getKeyVariant(value: string): KeyVariant {
  if (value === 'backspace') {
    return 'delete';
  }
  if (value === 'enter') {
    return 'enter';
  }
  if (value === 'fraction-box' || value === 'sqrt-box' || value === 'power-box' || value === 'power-2' || value === 'power-3') {
    return 'structure';
  }
  if (value === 'sin-box' || value === 'cos-box') {
    return 'function';
  }
  if (value === 'x' || value === 'y') {
    return 'variable';
  }
  if (value === '+' || value === '-' || value === '*' || value === '/' || value === '=' || value === '<' || value === '>' || value === '(' || value === ')') {
    return 'operation';
  }
  return 'number';
}

function getKeyPalette(variant: KeyVariant, colors: ReturnType<typeof useAppTheme>['colors'], isDark: boolean) {
  const neutralRaised = isDark ? '#1E293B' : '#F8FAFC';
  const neutralPressed = isDark ? '#243044' : '#EEF2F7';
  const structureFill = isDark ? '#202A38' : '#F1F5F9';
  const structureBorder = isDark ? '#3A4658' : '#CBD5E1';

  if (variant === 'enter') {
    return { backgroundColor: colors.primary, borderColor: colors.primary, color: '#FFFFFF' };
  }
  if (variant === 'delete') {
    return {
      backgroundColor: isDark ? '#252B35' : '#F8FAFC',
      borderColor: structureBorder,
      color: colors.text,
    };
  }
  if (variant === 'structure') {
    return {
      backgroundColor: structureFill,
      borderColor: structureBorder,
      color: colors.text,
    };
  }
  if (variant === 'navigation') {
    return {
      backgroundColor: neutralPressed,
      borderColor: colors.border,
      color: colors.muted,
    };
  }
  if (variant === 'operation' || variant === 'function' || variant === 'variable') {
    return {
      backgroundColor: neutralRaised,
      borderColor: colors.border,
      color: colors.text,
    };
  }
  return {
    backgroundColor: colors.card,
    borderColor: colors.border,
    color: colors.text,
  };
}

export function MathKeyboard({ onInsert, onBackspace, onNavigate, onEnter, fill = false }: MathKeyboardProps) {
  const { colors, isDark } = useAppTheme();

  function handleKeyPress(value: string) {
    if (value === 'backspace') {
      onBackspace();
      return;
    }
    if (value === 'enter') {
      onEnter?.();
      return;
    }
    if (value === 'power-box') {
      onInsert(POWER_BOX_TOKEN);
      return;
    }
    if (value === 'sqrt-box') {
      onInsert(SQRT_BOX_TOKEN);
      return;
    }
    if (value === 'fraction-box') {
      onInsert(FRACTION_BOX_TOKEN);
      return;
    }
    if (value === 'sin-box') {
      onInsert(SIN_BOX_TOKEN);
      return;
    }
    if (value === 'cos-box') {
      onInsert(COS_BOX_TOKEN);
      return;
    }
    if (value === 'power-2') {
      onInsert('^{2}');
      return;
    }
    if (value === 'power-3') {
      onInsert('^{3}');
      return;
    }
    onInsert(value);
  }

  return (
    <View style={[styles.keyboard, fill && styles.keyboardFill, { backgroundColor: colors.cardAlt }]}>
      <View style={[styles.row, styles.navigationRow, fill && styles.rowFill, { borderBottomColor: colors.border }]}>
        {navigationRow.map((key) => {
          const palette = getKeyPalette(key.value === 'delete' ? 'delete' : 'navigation', colors, isDark);

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={key.accessibilityLabel}
              key={key.label}
              onPress={() => {
                if (key.value === 'delete') {
                  onBackspace();
                  return;
                }
                if (key.action) {
                  onNavigate?.(key.action);
                }
              }}
              style={({ pressed }) => [
                styles.key,
                styles.navigationKey,
                fill && styles.keyFill,
                { backgroundColor: palette.backgroundColor, borderColor: palette.borderColor },
                pressed && styles.keyPressed,
              ]}
            >
              <Text style={[styles.keyText, styles.navigationKeyText, { color: palette.color }]}>{key.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={[styles.row, fill && styles.rowFill]}>
          {row.map((key) => {
            const variant = getKeyVariant(key.value);
            const palette = getKeyPalette(variant, colors, isDark);

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={key.accessibilityLabel ?? key.label}
                key={key.label}
                onPress={() => handleKeyPress(key.value)}
                style={({ pressed }) => [
                  styles.key,
                  fill && styles.keyFill,
                  (variant === 'structure' || variant === 'operation') && styles.groupedKey,
                  { backgroundColor: palette.backgroundColor, borderColor: palette.borderColor },
                  pressed && styles.keyPressed,
                ]}
              >
                <Text style={[styles.keyText, variant === 'function' && styles.functionKeyText, { color: palette.color }]}>{key.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function MathKeyboardOverlay({ visible, onInsert, onBackspace, onNavigate, onDismiss }: MathKeyboardOverlayProps) {
  const { colors } = useAppTheme();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 0);
  const hasCurvedBottom = bottomInset > 0;
  const backgroundExtension = hasCurvedBottom ? bottomInset + CURVED_SCREEN_BACKGROUND_DROP : 0;
  const keyboardDrop = hasCurvedBottom ? CURVED_SCREEN_KEYBOARD_DROP : 0;
  const keyboardLift = Math.max(backgroundExtension - keyboardDrop, 0);
  const keyBottomPadding = 12 + (hasCurvedBottom ? Math.min(bottomInset, MAX_CURVED_SCREEN_KEY_PADDING) : 0);

  if (!visible) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={[styles.overlay, { bottom: -backgroundExtension }]}>
      <View
        pointerEvents="none"
        style={[
          styles.bottomFill,
          {
            height: backgroundExtension + BOTTOM_FILL_EXTRA,
            backgroundColor: colors.cardAlt,
          },
        ]}
      />
      <View
        onTouchStart={(event) => event.stopPropagation()}
        onTouchEnd={(event) => event.stopPropagation()}
        style={[
          styles.overlayKeyboard,
          {
            height: height * 0.48 + keyboardDrop,
            marginBottom: keyboardLift,
            paddingBottom: keyBottomPadding,
            backgroundColor: colors.cardAlt,
            borderColor: colors.border,
          },
        ]}
      >
        <MathKeyboard fill onEnter={onDismiss} onInsert={onInsert} onBackspace={onBackspace} onNavigate={onNavigate} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    gap: 9,
    borderRadius: 20,
    padding: 10,
  },
  keyboardFill: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 7,
  },
  navigationRow: {
    flexGrow: 0.9,
    borderBottomWidth: 1,
    paddingBottom: 2,
  },
  rowFill: {
    flex: 1,
  },
  key: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1.25,
  },
  groupedKey: {
    borderWidth: 1.35,
  },
  keyFill: {
    minHeight: 0,
  },
  keyPressed: {
    transform: [{ scale: 0.97 }],
  },
  keyText: {
    fontSize: 16,
    fontWeight: '900',
  },
  functionKeyText: {
    fontSize: 15,
  },
  navigationKey: {
    minHeight: 40,
  },
  navigationKeyText: {
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  bottomFill: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
  },
  overlayKeyboard: {
    width: '100%',
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 18,
  },
});
