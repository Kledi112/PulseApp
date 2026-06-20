import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Colors, Radii, Spacing, Typography } from '@/theme';

import { AppText } from './AppText';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
  textColor?: string; // NEW
};

const sizeStyles: Record<ButtonSize, { paddingVertical: number; fontSize: number }> = {
  sm: { paddingVertical: Spacing.xs, fontSize: 13 },
  md: { paddingVertical: Spacing.sm, fontSize: 15 },
  lg: { paddingVertical: Spacing.md, fontSize: 16 },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  fullWidth = true,
  textColor
}: ButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const isDisabled = disabled || loading;
  const { paddingVertical, fontSize } = sizeStyles[size];

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 });
  };
  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

 const content = loading ? (
  <ActivityIndicator color={variant === 'primary' ? Colors.background : Colors.teal} />
) : (
  <AppText
    variant="label"
    color={textColor ?? (variant === 'primary' ? Colors.background : variant === 'danger' ? Colors.error : Colors.textPrimary)}
    style={{ fontSize, fontFamily: Typography.fontFamily }}>
    {label}
  </AppText>
);

  if (variant === 'primary') {
    return (
      <AnimatedPressable
        onPress={isDisabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[animatedStyle, fullWidth && { alignSelf: 'stretch' }, isDisabled && styles.disabled, style]}>
        <LinearGradient
          colors={Colors.gradient.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, { paddingVertical }]}>
          {content}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={isDisabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[
        animatedStyle,
        styles.base,
        { paddingVertical },
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.dangerOutline,
        fullWidth && { alignSelf: 'stretch' },
        isDisabled && styles.disabled,
        style,
      ]}>
      {content}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  secondary: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  dangerOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  disabled: {
    opacity: 0.5,
  },
});
