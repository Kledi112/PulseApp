import { Text, TextProps } from 'react-native';

import { Colors, Typography, TypographyVariant } from '@/theme';

type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: string;
};

export function AppText({ variant = 'body', color = Colors.textPrimary, style, ...rest }: AppTextProps) {
  return <Text {...rest} style={[Typography[variant], { color, fontFamily: Typography.fontFamily }, style]} />;
}
