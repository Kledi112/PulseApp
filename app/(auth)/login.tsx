import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';


import { PulseIcon } from '@/components/ui/PulseIcon';
import { AppText, Button, Input, Screen } from '@/components/ui';
import { strings } from '@/i18n/strings';
import { loginWithCredentials } from '@/services/auth';
import { useAuthStore } from '@/store/auth-store';
import { Colors, Radii, Spacing } from '@/theme';

export default function LoginScreen() {
  const [mode, setMode] = useState<'real' | 'demo'>('real');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const signIn = useAuthStore((state) => state.signIn);
  const signUpForDemo = useAuthStore((state) => state.signUpForDemo);

  const [demoEmail, setDemoEmail] = useState('');
  const [demoPassword, setDemoPassword] = useState('');
  const [demoRole, setDemoRole] = useState<'employee' | 'manager'>('employee');
  const [demoSubmitting, setDemoSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.trim().length > 0;
  const canSubmitDemo = demoEmail.trim().length > 0 && demoPassword.trim().length > 0;

  const handleSignIn = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const user = await loginWithCredentials(email.trim(), password);
      signIn(user);
      router.replace(user.role === 'manager' ? '/(manager)/(tabs)/team' : '/(employee)/marketplace');
    } catch {
      Alert.alert('Sign in failed', 'Check your email and password and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSignUp = async () => {
    if (!canSubmitDemo) return;
    setDemoSubmitting(true);
    try {
      await signUpForDemo(demoEmail.trim(), demoPassword, demoRole);
      router.replace(demoRole === 'manager' ? '/(manager)/(tabs)/team' : '/(employee)/marketplace');
    } catch (error) {
      const detail = error instanceof Error ? error.message : undefined;
      Alert.alert(
        'Could not start demo',
        detail?.toLowerCase().includes('already registered')
          ? 'That email is already taken - try a different one.'
          : 'Check your details and try again.'
      );
    } finally {
      setDemoSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ paddingTop: Spacing.huge, alignItems: 'center', gap: Spacing.xs }}>
          <PulseIcon size={64}/>
          <AppText variant="label" color={Colors.mint} style={{ marginTop: Spacing.sm, letterSpacing: 1, fontSize: Spacing.lg }}>
            {strings.common.appName}
          </AppText>
          <AppText variant="title" style={{fontSize: Spacing.xxl}}>{strings.auth.title}</AppText>
          <AppText variant="body" color={Colors.textSecondary} style={{fontSize: Spacing.sm}}>
            {strings.auth.subtitle}
          </AppText>
        </View>

        <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xl }}>
          <Pressable
            onPress={() => setMode('real')}
            style={{
              flex: 1,
              paddingVertical: Spacing.sm,
              borderRadius: Radii.pill,
              borderWidth: 1,
              alignItems: 'center',
              borderColor: mode === 'real' ? Colors.teal : Colors.border,
              backgroundColor: mode === 'real' ? `${Colors.teal}1f` : 'transparent',
            }}>
            <AppText variant="label" color={mode === 'real' ? Colors.teal : Colors.textSecondary}>
              {strings.auth.modeSignIn}
            </AppText>
          </Pressable>
          <Pressable
            onPress={() => setMode('demo')}
            style={{
              flex: 1,
              paddingVertical: Spacing.sm,
              borderRadius: Radii.pill,
              borderWidth: 1,
              alignItems: 'center',
              borderColor: mode === 'demo' ? Colors.teal : Colors.border,
              backgroundColor: mode === 'demo' ? `${Colors.teal}1f` : 'transparent',
            }}>
            <AppText variant="label" color={mode === 'demo' ? Colors.teal : Colors.textSecondary}>
              {strings.auth.modeDemo}
            </AppText>
          </Pressable>
        </View>

        {mode === 'real' ? (
          <>
            <View style={{ marginTop: Spacing.xl, gap: Spacing.md }}>
              <Input label={strings.auth.emailPlaceholder} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="name@company.com" />
              <Input label={strings.auth.passwordPlaceholder} value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
              <Button label={strings.auth.signIn} onPress={handleSignIn} disabled={!canSubmit} loading={submitting} style={{ marginTop: Spacing.xs }} />
            </View>

            <View style={{ alignItems: 'center', marginTop: Spacing.lg }}>
              <Button
                label={strings.auth.registerBusiness}
                variant="ghost"
                fullWidth={false}
                textColor={`${Colors.mint}99`}
                onPress={() => router.push('/(auth)/register-business')}
              />
            </View>
          </>
        ) : (
          <View style={{ marginTop: Spacing.xl, gap: Spacing.sm }}>
            <AppText variant="caption" color={Colors.textTertiary}>
              {strings.auth.demoSubtitle}
            </AppText>
            <Input
              label=""
              value={demoEmail}
              onChangeText={setDemoEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder={strings.auth.demoEmailPlaceholder}
            />
            <Input
              label=""
              value={demoPassword}
              onChangeText={setDemoPassword}
              secureTextEntry
              placeholder={strings.auth.demoPasswordPlaceholder}
            />

            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <Pressable
                onPress={() => setDemoRole('employee')}
                style={{
                  flex: 1,
                  paddingVertical: Spacing.sm,
                  borderRadius: Radii.pill,
                  borderWidth: 1,
                  alignItems: 'center',
                  borderColor: demoRole === 'employee' ? Colors.teal : Colors.border,
                  backgroundColor: demoRole === 'employee' ? `${Colors.teal}1f` : 'transparent',
                }}>
                <AppText variant="label" color={demoRole === 'employee' ? Colors.teal : Colors.textSecondary}>
                  {strings.auth.demoRoleEmployee}
                </AppText>
              </Pressable>
              <Pressable
                onPress={() => setDemoRole('manager')}
                style={{
                  flex: 1,
                  paddingVertical: Spacing.sm,
                  borderRadius: Radii.pill,
                  borderWidth: 1,
                  alignItems: 'center',
                  borderColor: demoRole === 'manager' ? Colors.teal : Colors.border,
                  backgroundColor: demoRole === 'manager' ? `${Colors.teal}1f` : 'transparent',
                }}>
                <AppText variant="label" color={demoRole === 'manager' ? Colors.teal : Colors.textSecondary}>
                  {strings.auth.demoRoleManager}
                </AppText>
              </Pressable>
            </View>

            <Button
              label={strings.auth.demoSubmit}
              variant="secondary"
              onPress={handleDemoSignUp}
              disabled={!canSubmitDemo}
              loading={demoSubmitting}
            />
          </View>
        )}

        <View style={{ flex: 1, minHeight: Spacing.xxl }} />
      </KeyboardAvoidingView>
    </Screen>
  );
}
