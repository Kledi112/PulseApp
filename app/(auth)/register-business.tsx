import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, View } from 'react-native';

import { AppText, Button, Input, Screen } from '@/components/ui';
import { strings } from '@/i18n/strings';
import { submitBusinessApplication } from '@/services/business';
import { Colors, Spacing } from '@/theme';
import { BusinessApplication } from '@/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+\d][\d\s-]{6,}$/;

type FormErrors = Partial<Record<keyof BusinessApplication, string>>;

export default function RegisterBusinessScreen() {
  const [form, setForm] = useState<BusinessApplication>({
    businessName: '',
    nipt: '',
    employeeCount: '',
    contactNumber: '',
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof BusinessApplication, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!form.businessName.trim()) next.businessName = 'Business name is required';
    if (!form.nipt.trim()) next.nipt = 'NIPT is required';
    if (!form.employeeCount.trim() || Number.isNaN(Number(form.employeeCount))) {
      next.employeeCount = 'Enter a valid number of employees';
    }
    if (!PHONE_REGEX.test(form.contactNumber.trim())) next.contactNumber = 'Enter a valid contact number';
    if (!EMAIL_REGEX.test(form.email.trim())) next.email = 'Enter a valid email address';
    return next;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await submitBusinessApplication(form);
      router.replace('/(auth)/application-success');
    } catch {
      Alert.alert('Could not submit application', 'Could not reach the backend. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, gap: Spacing.lg }}>
        <View style={{ gap: Spacing.xxs, marginBottom: Spacing.xs }}>
          <AppText variant="title">{strings.registerBusiness.title}</AppText>
          <AppText variant="body" color={Colors.textSecondary}>
            {strings.registerBusiness.subtitle}
          </AppText>
        </View>
        <View style={{ gap: Spacing.md }}>
          <Input label={strings.registerBusiness.businessName} value={form.businessName} onChangeText={(v) => update('businessName', v)} error={errors.businessName} placeholder="e.g. Tirana Tech Studio" />
          <Input label={strings.registerBusiness.nipt} value={form.nipt} onChangeText={(v) => update('nipt', v)} error={errors.nipt} placeholder="L12345678A" autoCapitalize="characters" />
          <Input label={strings.registerBusiness.employeeCount} value={form.employeeCount} onChangeText={(v) => update('employeeCount', v)} error={errors.employeeCount} placeholder="e.g. 45" keyboardType="number-pad" />
          <Input label={strings.registerBusiness.contactNumber} value={form.contactNumber} onChangeText={(v) => update('contactNumber', v)} error={errors.contactNumber} placeholder="+355 69 123 4567" keyboardType="phone-pad" />
          <Input label={strings.registerBusiness.email} value={form.email} onChangeText={(v) => update('email', v)} error={errors.email} placeholder="hr@company.al" autoCapitalize="none" keyboardType="email-address" />
        </View>
        <Button label={strings.registerBusiness.submit} onPress={handleSubmit} loading={submitting} />
      </KeyboardAvoidingView>
    </Screen>
  );
}
