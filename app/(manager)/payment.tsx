import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { AppText, Button, Input, Screen } from '@/components/ui';
import { approveRequest } from '@/services/requests';
import { Colors, Radii, Spacing } from '@/theme';
import { formatCurrency } from '@/utils/currency';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PaymentScreen() {
  const { requestId, amount, employeeName } = useLocalSearchParams<{ requestId: string; amount: string; employeeName: string }>();
  const [method, setMethod] = useState<'card' | 'paypal'>('card');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    if (method === 'card') {
      if (!cardName.trim()) next.cardName = 'Name on card is required';
      if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) next.cardNumber = 'Enter a valid 16-digit card number';
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) next.expiry = 'Use MM/YY format';
      if (!/^\d{3,4}$/.test(cvv)) next.cvv = 'Enter a valid CVV';
    } else {
      if (!EMAIL_REGEX.test(paypalEmail.trim())) next.paypalEmail = 'Enter a valid PayPal email';
    }
    return next;
  };

  const handlePay = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0 || !requestId) return;

    setProcessing(true);
    await approveRequest(requestId, method);
    setProcessing(false);
    Alert.alert('Payment confirmed', 'The benefit has been routed to the provider.', [
      { text: 'Done', onPress: () => router.back() },
    ]);
  };

  return (
    <Screen scroll>
      <View style={{ gap: Spacing.xs, marginTop: Spacing.sm }}>
        <AppText variant="body" color={Colors.textSecondary}>
          Paying for {employeeName}
        </AppText>
        <AppText variant="title" color={Colors.teal}>
          {formatCurrency(Number(amount ?? 0))}
        </AppText>
      </View>

      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg }}>
        <Pressable
          onPress={() => setMethod('card')}
          style={{
            flex: 1,
            paddingVertical: Spacing.sm,
            borderRadius: Radii.md,
            alignItems: 'center',
            backgroundColor: method === 'card' ? Colors.surfaceElevated : Colors.surface,
            borderWidth: 1,
            borderColor: method === 'card' ? Colors.teal : Colors.border,
          }}>
          <AppText variant="label" color={method === 'card' ? Colors.teal : Colors.textSecondary}>
            Card
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => setMethod('paypal')}
          style={{
            flex: 1,
            paddingVertical: Spacing.sm,
            borderRadius: Radii.md,
            alignItems: 'center',
            backgroundColor: method === 'paypal' ? Colors.surfaceElevated : Colors.surface,
            borderWidth: 1,
            borderColor: method === 'paypal' ? Colors.teal : Colors.border,
          }}>
          <AppText variant="label" color={method === 'paypal' ? Colors.teal : Colors.textSecondary}>
            PayPal
          </AppText>
        </Pressable>
      </View>

      {method === 'card' ? (
        <View style={{ gap: Spacing.md, marginTop: Spacing.lg }}>
          <Input label="Name on card" value={cardName} onChangeText={setCardName} error={errors.cardName} placeholder="Gentian Berisha" />
          <Input
            label="Card number"
            value={cardNumber}
            onChangeText={setCardNumber}
            error={errors.cardNumber}
            placeholder="4242 4242 4242 4242"
            keyboardType="number-pad"
            maxLength={19}
          />
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Input label="Expiry" value={expiry} onChangeText={setExpiry} error={errors.expiry} placeholder="MM/YY" maxLength={5} />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="CVV" value={cvv} onChangeText={setCvv} error={errors.cvv} placeholder="123" keyboardType="number-pad" maxLength={4} secureTextEntry />
            </View>
          </View>
        </View>
      ) : (
        <View style={{ gap: Spacing.md, marginTop: Spacing.lg }}>
          <Input
            label="PayPal email"
            value={paypalEmail}
            onChangeText={setPaypalEmail}
            error={errors.paypalEmail}
            placeholder="name@paypal.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
      )}

      <Button label="Confirm payment" onPress={handlePay} loading={processing} style={{ marginTop: Spacing.xl }} />
    </Screen>
  );
}
