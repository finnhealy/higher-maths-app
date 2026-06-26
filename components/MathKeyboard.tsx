import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { POWER_BOX_TOKEN } from '@/lib/mathInput';
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
    { label: 'x²', value: 'power-2', accessibilityLabel: 'Squared' },
    { label: '⌫', value: 'backspace', accessibilityLabel: 'Backspace' },
  ],
  [
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '×', value: '*' },
    { label: 'x³', value: 'power-3', accessibilityLabel: 'Cubed' },
    { label: '√', value: 'sqrt(' },
  ],
  [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '+', value: '+' },
    { label: '□ⁿ', value: 'power-box', accessibilityLabel: 'Power box' },
    { label: 'n', value: 'n' },
  ],
  [
    { label: '0', value: '0' },
    { label: '.', value: '.' },
    { label: ',', value: ',' },
    { label: '-', value: '-' },
    { label: '=', value: '=' },
    { label: 'x', value: 'x' },
    { label: 'y', value: 'y' },
  ],
  [
    { label: 'sin', value: 'sin' },
    { label: 'cos', value: 'cos' },
    { label: '<', value: '<' },
    { label: '>', value: '>' },
    { label: '↵', value: 'enter', accessibilityLabel: 'Enter' },
  ],
];

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

  if (!visible) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close maths keyboard" onPress={onDismiss} style={styles.backdrop} />
      <View style={[styles.overlayKeyboard, { height: height * 0.32, backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
        <MathKeyboard fill onEnter={onDismiss} onInsert={onInsert} onBackspace={onBackspace} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    gap: 6,
    borderRadius: 18,
    padding: 8,
  },
  keyboardFill: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  rowFill: {
    flex: 1,
  },
  key: {
    flex: 1,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  keyFill: {
    minHeight: 0,
  },
  keyPressed: {
    transform: [{ scale: 0.97 }],
  },
  keyText: {
    fontSize: 13,
    fontWeight: '900',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  overlayKeyboard: {
    width: '100%',
    borderTopWidth: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 16,
  },
});
