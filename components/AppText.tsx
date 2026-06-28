import { ReactNode } from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';

import { useAppTheme } from '@/lib/theme';

type AppTextVariant = 'title' | 'heading' | 'subheading' | 'body' | 'label' | 'caption';

type AppTextProps = TextProps & {
  children: ReactNode;
  variant?: AppTextVariant;
  color?: string;
  muted?: boolean;
  align?: TextStyle['textAlign'];
  style?: StyleProp<TextStyle>;
};

export function AppText({
  children,
  variant = 'body',
  color,
  muted = false,
  align,
  style,
  ...props
}: AppTextProps) {
  const { colors, typography } = useAppTheme();

  return (
    <Text
      {...props}
      style={[
        typography[variant],
        {
          color: color ?? (muted ? colors.muted : colors.text),
          textAlign: align,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
