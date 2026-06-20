import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useLoadingStore } from '@/store/loading-store';
import { Colors } from '@/theme';

export function GlobalLoadingOverlay() {
  const isLoading = useLoadingStore((state) => state.count > 0);

  if (!isLoading) return null;

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color={Colors.teal} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});
