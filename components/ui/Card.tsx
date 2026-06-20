import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { Colors, Radii, Spacing } from '@/theme';

type CardProps = PropsWithChildren<{
  style?: ViewStyle;
  padded?: boolean;
}>;

export function Card({ children, style, padded = true }: CardProps) {
  return <View style={[styles.card, padded && { padding: Spacing.md }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
