import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COS_BOX_TOKEN, FRACTION_BOX_TOKEN, POWER_BOX_TOKEN, SIN_BOX_TOKEN, SQRT_BOX_TOKEN } from '@/lib/mathInput';
import { useAppTheme } from '@/lib/theme';

type MathKeyboardProps = {
  onInsert: (value: string) => void;
  onBackspace: () => void;
  onEnter?: () => void;
  fill?: boolean;
};

type MathKeyboardOverlayProps = MathKeyboardProps & {
  visible: boolean;
  onDismiss: () => void;
};

const rows = [
  [
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: '÷', value: '/' },
    { label: '𝑥²', value: 'power-2', accessibilityLabel: 'Squared' },
    { label: '⌫', value: 'backspace', accessibilityLabel: 'Backspace' },
  ],
  [
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '×', value: '*' },
    { label: '𝑥³', value: 'power-3', accessibilityLabel: 'Cubed' },
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
const KEYBOARD_DROP = 14;

export function MathKeyboard({ onInsert, onBackspace, onEnter, fill = false }: MathKeyboardProps) {
  const { colors } = useAppTheme();

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
      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={[styles.row, fill && styles.rowFill]}>
          {row.map((key) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={key.accessibilityLabel ?? key.label}
              key={key.label}
              onPress={() => handleKeyPress(key.value)}
              style={({ pressed }) => [
                styles.key,
                fill && styles.keyFill,
                key.value === 'enter'
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: colors.card, borderColor: colors.border },
                pressed && styles.keyPressed,
              ]}
            >
              <Text style={[styles.keyText, { color: key.value === 'enter' ? '#FFFFFF' : colors.text }]}>{key.label}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

export function MathKeyboardOverlay({ visible, onInsert, onBackspace, onDismiss }: MathKeyboardOverlayProps) {
  const { colors } = useAppTheme();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 0);

  if (!visible) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <View
        pointerEvents="none"
        style={[
          styles.bottomFill,
          {
            height: bottomInset + KEYBOARD_DROP + 56,
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
            height: height * 0.42 + bottomInset + KEYBOARD_DROP,
            paddingBottom: 12 + bottomInset,
            backgroundColor: colors.cardAlt,
            borderColor: colors.border,
            transform: [{ translateY: KEYBOARD_DROP }],
          },
        ]}
      >
        <MathKeyboard fill onEnter={onDismiss} onInsert={onInsert} onBackspace={onBackspace} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    gap: 8,
    borderRadius: 20,
    padding: 10,
  },
  keyboardFill: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
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
    borderWidth: 1,
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
  overlay: {
    flex: 1,
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  bottomFill: {
    position: 'absolute',
    right: 0,
    bottom: -KEYBOARD_DROP,
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
