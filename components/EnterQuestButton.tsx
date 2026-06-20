import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Radii, Spacing } from '@/theme';

import { AppText } from './ui';

type EnterQuestButtonProps = {
  entered: boolean;
  submitting: boolean;
  onPress: () => void;
};

export function EnterQuestButton({ entered, submitting, onPress }: EnterQuestButtonProps) {
  const scale = useSharedValue(1);
  const ringScale = useSharedValue(0);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    if (entered) {
      scale.value = withSequence(withTiming(1.12, { duration: 140 }), withTiming(1, { duration: 160 }));
      ringScale.value = 0;
      ringOpacity.value = 0.55;
      ringScale.value = withTiming(2.4, { duration: 650 });
      ringOpacity.value = withTiming(0, { duration: 650 });
    }
  }, [entered, scale, ringScale, ringOpacity]);

  const buttonStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const handlePressIn = () => {
    if (entered) return;
    scale.value = withTiming(0.96, { duration: 90 });
  };

  const handlePressOut = () => {
    if (entered) return;
    scale.value = withTiming(1, { duration: 90 });
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.ring, ringStyle]} />
      <Animated.View style={buttonStyle}>
        <Pressable
          onPress={entered ? undefined : onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={entered || submitting}
          style={[styles.button, entered && styles.buttonEntered]}>
          <AppText variant="label" color={entered ? Colors.teal : Colors.background}>
            {entered ? 'Entered' : submitting ? 'Entering…' : 'Enter quest'}
          </AppText>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 40,
    borderRadius: Radii.pill,
    borderWidth: 2,
    borderColor: Colors.teal,
  },
  button: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.pill,
    backgroundColor: Colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  buttonEntered: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.teal,
  },
});
