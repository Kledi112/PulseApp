import { useState } from 'react';
import { Modal, View } from 'react-native';

import { AppText, Button, Input } from '@/components/ui';
import { Colors, Radii, Spacing } from '@/theme';
import { formatCurrency } from '@/utils/currency';

type PledgeModalProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  maxAmountAll: number;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (amountAll: number) => void;
  onClose: () => void;
};

export function PledgeModal({
  visible,
  title,
  subtitle,
  maxAmountAll,
  submitLabel,
  submitting,
  onSubmit,
  onClose,
}: PledgeModalProps) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = () => {
    const value = Math.round(Number(amount));
    if (!amount || Number.isNaN(value) || value <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (value > maxAmountAll) {
      setError(`Can't pledge more than ${formatCurrency(maxAmountAll)}`);
      return;
    }
    setError(undefined);
    onSubmit(value);
  };

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
            maxWidth: 340,
            padding: Spacing.lg,
            gap: Spacing.sm,
            borderRadius: Radii.xl,
            borderWidth: 1,
            borderColor: Colors.border,
            backgroundColor: Colors.surface,
          }}>
          <AppText variant="subtitle">{title}</AppText>
          {subtitle && (
            <AppText variant="body" color={Colors.textSecondary}>
              {subtitle}
            </AppText>
          )}

          <View style={{ marginTop: Spacing.sm }}>
            <Input
              label={`Your pledge (up to ${formatCurrency(maxAmountAll)})`}
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                setError(undefined);
              }}
              keyboardType="number-pad"
              placeholder="0"
              error={error}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
            <Button label="Cancel" variant="secondary" onPress={onClose} style={{ flex: 1 }} />
            <Button label={submitLabel} onPress={handleSubmit} loading={submitting} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
