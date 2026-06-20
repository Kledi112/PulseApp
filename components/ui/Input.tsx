import { TextInput, TextInputProps, View } from 'react-native';

import { Colors, Radii, Spacing, Typography } from '@/theme';

import { AppText } from './AppText';

type InputProps = TextInputProps & {
  label: string;
  error?: string;
};

export function Input({ label, error, style, ...rest }: InputProps) {
  return (
    <View style={{ gap: Spacing.xxs }}>
      {label ? (
        <AppText variant="label" color={Colors.textSecondary}>
          {label}
        </AppText>
      ) : null}
      <TextInput
        placeholderTextColor={Colors.textTertiary}
        style={[
          {
            backgroundColor: Colors.surface,
            borderRadius: Radii.md,
            borderWidth: 1,
            borderColor: error ? Colors.error : Colors.border,
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.sm,
            color: Colors.textPrimary,
            fontSize: Typography.bodyLarge.fontSize,
            fontFamily: Typography.fontFamily,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <AppText variant="caption" color={Colors.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
