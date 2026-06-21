import { useEffect } from 'react';
import { Modal, View } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing } from '@/theme';

const CONFETTI_COLORS = [Colors.teal, Colors.mint, Colors.tealLight, '#fbbf24', '#f472b6'];
const CONFETTI_COUNT = 14;
const AUTO_DISMISS_MS = 2200;

function ConfettiDot({ index, progress }: { index: number; progress: SharedValue<number> }) {
  const angle = (2 * Math.PI / CONFETTI_COUNT) * index;
  const dx = Math.cos(angle) * 90;
  const dy = Math.sin(angle) * 90;
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];

  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: progress.value * dx },
      { translateY: progress.value * dy },
      { scale: 1 - progress.value * 0.6 },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 7,
          height: 7,
          borderRadius: 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

type ClaimCelebrationProps = {
  visible: boolean;
  perkTitle?: string;
  onDismiss: () => void;
};

export function ClaimCelebration({ visible, perkTitle, onDismiss }: ClaimCelebrationProps) {
  const checkScale = useSharedValue(0);
  const confettiProgress = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;

    checkScale.value = 0;
    confettiProgress.value = 0;
    checkScale.value = withSequence(
      withTiming(1.15, { duration: 280, easing: Easing.out(Easing.back(1.5)) }),
      withTiming(1, { duration: 150 })
    );
    confettiProgress.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });

    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [visible, checkScale, confettiProgress, onDismiss]);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(13,17,23,0.75)',
        }}>
        <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg }}>
          {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
            <ConfettiDot key={i} index={i} progress={confettiProgress} />
          ))}
          <Animated.View
            style={[
              {
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: Colors.teal,
                alignItems: 'center',
                justifyContent: 'center',
              },
              checkStyle,
            ]}>
            <IconSymbol name="checkmark.circle.fill" size={30} color={Colors.background} />
          </Animated.View>
        </View>

        <AppText variant="subtitle" color={Colors.textPrimary} style={{ textAlign: 'center', paddingHorizontal: Spacing.xl }}>
          Perk claimed!
        </AppText>
        {perkTitle && (
          <AppText variant="body" color={Colors.textSecondary} style={{ marginTop: Spacing.xxs, textAlign: 'center', paddingHorizontal: Spacing.xl }}>
            {perkTitle}
          </AppText>
        )}
      </View>
    </Modal>
  );
}
