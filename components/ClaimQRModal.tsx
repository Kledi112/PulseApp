import { Modal, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { AppText, Button } from '@/components/ui';
import { strings } from '@/i18n/strings';
import { Colors, Radii, Spacing } from '@/theme';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export function claimUrlForToken(token: string) {
  return `${API_BASE_URL}/c/${token}`;
}

type ClaimQRModalProps = {
  visible: boolean;
  token: string | null;
  title?: string;
  onClose: () => void;
};

export function ClaimQRModal({ visible, token, title, onClose }: ClaimQRModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(13,17,23,0.7)',
          paddingHorizontal: Spacing.xl,
        }}>
        <View
          style={{
            width: '100%',
            maxWidth: 320,
            padding: Spacing.lg,
            alignItems: 'center',
            gap: Spacing.sm,
            borderRadius: Radii.xl,
            borderWidth: 1,
            borderColor: Colors.border,
            backgroundColor: Colors.surface,
          }}>
          <AppText variant="subtitle" style={{ textAlign: 'center' }}>
            {title ?? strings.claimQr.title}
          </AppText>
          <AppText variant="body" color={Colors.textSecondary} style={{ textAlign: 'center' }}>
            {strings.claimQr.subtitle}
          </AppText>

          <View
            style={{
              marginTop: Spacing.sm,
              padding: Spacing.md,
              borderRadius: Radii.lg,
              backgroundColor: Colors.white,
            }}>
            {token ? <QRCode value={claimUrlForToken(token)} size={200} /> : null}
          </View>

          <Button label={strings.claimQr.close} onPress={onClose} style={{ marginTop: Spacing.md, width: '100%' }} />
        </View>
      </View>
    </Modal>
  );
}
