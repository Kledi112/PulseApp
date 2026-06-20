import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, View } from 'react-native';

import { AppText, Button, Input, Screen } from '@/components/ui';
import { strings } from '@/i18n/strings';
import { loginWithCredentials } from '@/services/auth';
import { useAuthStore } from '@/store/auth-store';
import { Colors, Spacing } from '@/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const signIn = useAuthStore((state) => state.signIn);
  const signInAsDemoEmployee = useAuthStore((state) => state.signInAsDemoEmployee);
  const signInAsDemoManager = useAuthStore((state) => state.signInAsDemoManager);

  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  const handleSignIn = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const user = await loginWithCredentials(email.trim(), password);
      signIn(user);
      router.replace(user.role === 'manager' ? '/(manager)/(tabs)/requests' : '/(employee)/marketplace');
    } catch {
      Alert.alert('Sign in failed', 'Check your email and password and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoEmployee = async () => {
    setSubmitting(true);
    try {
      await signInAsDemoEmployee();
      router.replace('/(employee)/marketplace');
    } catch {
      // No alert here - api-client.ts already shows the global connection-error modal.
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoManager = async () => {
    setSubmitting(true);
    try {
      await signInAsDemoManager();
      router.replace('/(manager)/(tabs)/requests');
    } catch {
      // No alert here - api-client.ts already shows the global connection-error modal.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ paddingTop: Spacing.huge, alignItems: 'center', gap: Spacing.xs }}>
          <LinearGradient
            colors={Colors.gradient.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 56, height: 56, borderRadius: 18 }}
          />
          <AppText variant="label" color={Colors.textTertiary} style={{ marginTop: Spacing.sm, letterSpacing: 1 }}>
            {strings.common.appName}
          </AppText>
          <AppText variant="title">{strings.auth.title}</AppText>
          <AppText variant="body" color={Colors.textSecondary}>
            {strings.auth.subtitle}
          </AppText>
        </View>

        <View style={{ marginTop: Spacing.xxl, gap: Spacing.md }}>
          <Input label={strings.auth.emailPlaceholder} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="name@company.com" />
          <Input label={strings.auth.passwordPlaceholder} value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
          <Button label={strings.auth.signIn} onPress={handleSignIn} disabled={!canSubmit} loading={submitting} style={{ marginTop: Spacing.xs }} />
        </View>

        <View style={{ marginTop: Spacing.xxl, gap: Spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
            <AppText variant="caption" color={Colors.textTertiary}>
              demo access
            </AppText>
            <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
          </View>
          <Button label={strings.auth.demoEmployee} variant="secondary" onPress={handleDemoEmployee} loading={submitting} />
          <Button label={strings.auth.demoManager} variant="secondary" onPress={handleDemoManager} loading={submitting} />
        </View>

        <View style={{ flex: 1, minHeight: Spacing.xxl }} />

        <View style={{ alignItems: 'center', paddingBottom: Spacing.lg }}>
          <Button
            label={strings.auth.registerBusiness}
            variant="ghost"
            fullWidth={false}
            onPress={() => router.push('/(auth)/register-business')}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
