import { ReactNode } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Edge, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/lib/theme';

type ScreenProps = {
  children: ReactNode;
  overlay?: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  nestedScrollEnabled?: boolean;
  onScrollBeginDrag?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  showsVerticalScrollIndicator?: boolean;
};

export function Screen({
  children,
  overlay,
  scroll = true,
  edges = [],
  contentContainerStyle,
  style,
  keyboardShouldPersistTaps,
  nestedScrollEnabled,
  onScrollBeginDrag,
  showsVerticalScrollIndicator,
}: ScreenProps) {
  const { colors, spacing } = useAppTheme();
  const insets = useSafeAreaInsets();
  const contentSpacing = {
    padding: spacing.md,
    paddingBottom: spacing.xl + Math.max(insets.bottom, spacing.sm),
    gap: spacing.md,
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }, style]} edges={edges}>
      {overlay}
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.container, contentSpacing, contentContainerStyle]}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          nestedScrollEnabled={nestedScrollEnabled}
          onScrollBeginDrag={onScrollBeginDrag}
          scrollIndicatorInsets={{ bottom: insets.bottom }}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.container, styles.staticContainer, contentSpacing, contentContainerStyle]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
  },
  staticContainer: {
    flex: 1,
  },
});
