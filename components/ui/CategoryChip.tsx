import { Pressable, StyleSheet, View } from 'react-native';
import { Shadow } from 'react-native-shadow-2';

import { Colors, Radii, Spacing } from '@/theme';

import { AppText } from './AppText';

type CategoryChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function CategoryChip({ label, selected = false, onPress }: CategoryChipProps) {
  const chip = (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.chipPressed,
      ]}
    >
      <AppText variant="label" color={selected ? Colors.background : Colors.textSecondary}>
        {label}
      </AppText>
    </Pressable>
  );

  if (!selected) {
    return <View style={styles.wrapper}>{chip}</View>;
  }

  return (
    <Shadow
      distance={8}
      startColor={`${Colors.teal}66`} // ~40% opacity at the glow's core
      endColor={`${Colors.teal}00`} // fades to fully transparent
      offset={[0, 0]}
      style={styles.wrapper}
    >
      {chip}
    </Shadow>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginRight: Spacing.xs,
    borderRadius: Radii.pill,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 30,
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
    borderWidth: 1.5,
  },
  chipPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
});