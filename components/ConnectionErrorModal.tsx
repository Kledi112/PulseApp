import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Modal, Platform, StyleSheet, View } from 'react-native';

import { AppText, Button } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useConnectionErrorStore } from '@/store/connection-error-store';
import { Colors, Radii, Spacing } from '@/theme';

export function ConnectionErrorModal() {
  const visible = useConnectionErrorStore((state) => state.visible);
  const title = useConnectionErrorStore((state) => state.title);
  const message = useConnectionErrorStore((state) => state.message);
  const hide = useConnectionErrorStore((state) => state.hide);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={hide}>
      <BlurView intensity={50} tint="dark" style={styles.backdrop}>
        <View style={styles.card}>
          <LinearGradient
            colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.02)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.iconBadge}>
            <LinearGradient
              colors={Colors.gradient.brand}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconBadgeGradient}>
              <IconSymbol name="exclamationmark.triangle.fill" size={22} color={Colors.background} />
            </LinearGradient>
          </View>

          <AppText variant="subtitle" style={{ textAlign: 'center', marginTop: Spacing.md }}>
            {title}
          </AppText>
          <AppText variant="body" color={Colors.textSecondary} style={{ textAlign: 'center', marginTop: Spacing.xxs }}>
            {message}
          </AppText>

          <Button label="OK" onPress={hide} style={{ marginTop: Spacing.lg }} />
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13,17,23,0.45)',
    paddingHorizontal: Spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    padding: Spacing.lg,
    alignItems: 'center',
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(28,36,48,0.65)',
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0px 12px 24px rgba(0,0,0,0.3)' },
      default: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 12,
      },
    }),
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  iconBadgeGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
