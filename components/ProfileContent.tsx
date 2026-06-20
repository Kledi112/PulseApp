import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { ClaimQRModal } from '@/components/ClaimQRModal';
import { AppText, Button, Card, Input, Screen } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ActiveService } from '@/data/active-services';
import { strings } from '@/i18n/strings';
import { Budget, getMyBudget, getMyPerks } from '@/services/active-services';
import { useAuthStore } from '@/store/auth-store';
import { Colors, Radii, Spacing } from '@/theme';
import { formatCurrency } from '@/utils/currency';

export function ProfileContent({ showHistory = false }: { showHistory?: boolean }) {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const signOut = useAuthStore((state) => state.signOut);
  const [name, setName] = useState(user?.name ?? '');
  const [password, setPassword] = useState('');
  const [history, setHistory] = useState<ActiveService[]>([]);
  const [active, setActive] = useState<ActiveService[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrPerkTitle, setQrPerkTitle] = useState<string | undefined>();

  useFocusEffect(
    useCallback(() => {
      if (!user || !showHistory) return;
      getMyPerks('claimed').then(setHistory).catch(() => setHistory([]));
      getMyPerks('active').then(setActive).catch(() => setActive([]));
      getMyBudget().then(setBudget).catch(() => setBudget(null));
    }, [user, showHistory])
  );

  if (!user) return null;

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to change your avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      updateProfile({ avatarUri: result.assets[0].uri });
    }
  };

  const handleSave = () => {
    updateProfile({ name: name.trim() || user.name });
    setPassword('');
    Alert.alert('Saved', 'Your profile has been updated.');
  };

  const handleLogOut = () => {
    signOut();
    router.replace('/(auth)/login');
  };

  const openQr = (service: ActiveService) => {
    setQrToken(service.token);
    setQrPerkTitle(service.title);
  };

  return (
    <Screen scroll>
      <View style={{ alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.md }}>
        <Pressable onPress={handlePickAvatar}>
          {user.avatarUri ? (
            <Image source={{ uri: user.avatarUri }} style={{ width: 88, height: 88, borderRadius: 44 }} />
          ) : (
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: Colors.surfaceElevated,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <IconSymbol name="person.fill" size={36} color={Colors.textTertiary} />
            </View>
          )}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: Colors.teal,
              borderRadius: 14,
              padding: 6,
            }}>
            <IconSymbol name="camera.fill" size={14} color={Colors.background} />
          </View>
        </Pressable>
        <AppText variant="subtitle">{user.name}</AppText>
        <AppText variant="body" color={Colors.textSecondary}>
          {user.email}
        </AppText>
      </View>

      <View style={{ marginTop: Spacing.xl, gap: Spacing.md }}>
        <Input label="Username" value={name} onChangeText={setName} />
        <Input label="New password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Leave blank to keep current" />
        <Button label={strings.common.save} variant="secondary" onPress={handleSave} />
      </View>

      {showHistory && budget && (
        <View style={{ marginTop: Spacing.xl, gap: Spacing.sm }}>
          <AppText variant="subtitle">{strings.profile.budgetTitle}</AppText>
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText variant="body" color={Colors.textSecondary}>
                Remaining
              </AppText>
              <AppText variant="subtitle" color={Colors.teal}>
                {formatCurrency(budget.remainingAll)}
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.xs }}>
              <AppText variant="caption" color={Colors.textTertiary}>
                of {formatCurrency(budget.monthlyBudgetAll)} monthly budget
              </AppText>
            </View>
          </Card>
        </View>
      )}

      {showHistory && (
        <View style={{ marginTop: Spacing.xl, gap: Spacing.sm }}>
          <AppText variant="subtitle">{strings.profile.activeTitle}</AppText>
          {active.length === 0 ? (
            <AppText variant="body" color={Colors.textSecondary}>
              {strings.profile.emptyActive}
            </AppText>
          ) : (
            active.map((service) => (
              <Card key={service.id}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm }}>
                  <View style={{ gap: Spacing.xxs, flex: 1 }}>
                    <AppText variant="label" numberOfLines={1}>
                      {service.title}
                    </AppText>
                    <AppText variant="caption" color={Colors.textTertiary}>
                      {service.providerName}
                    </AppText>
                    <AppText variant="label" color={Colors.teal}>
                      {formatCurrency(service.priceAll)}
                    </AppText>
                  </View>
                  <Pressable
                    onPress={() => openQr(service)}
                    style={{
                      paddingHorizontal: Spacing.sm,
                      paddingVertical: Spacing.xs,
                      borderRadius: Radii.pill,
                      backgroundColor: Colors.teal,
                    }}>
                    <AppText variant="caption" color={Colors.background}>
                      {strings.profile.showQr}
                    </AppText>
                  </Pressable>
                </View>
              </Card>
            ))
          )}
        </View>
      )}

      {showHistory && (
        <View style={{ marginTop: Spacing.xl, gap: Spacing.sm }}>
          <AppText variant="subtitle">{strings.profile.historyTitle}</AppText>
          {history.length === 0 ? (
            <AppText variant="body" color={Colors.textSecondary}>
              {strings.profile.emptyHistory}
            </AppText>
          ) : (
            history.map((claim) => (
              <Card key={claim.id}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ gap: Spacing.xxs, flex: 1 }}>
                    <AppText variant="label" numberOfLines={1}>
                      {claim.title}
                    </AppText>
                    <AppText variant="caption" color={Colors.textTertiary}>
                      {claim.providerName}
                    </AppText>
                  </View>
                  <AppText variant="label" color={Colors.teal}>
                    {formatCurrency(claim.priceAll)}
                  </AppText>
                </View>
              </Card>
            ))
          )}
        </View>
      )}

      <Button
        label={strings.common.logOut}
        variant="danger"
        onPress={handleLogOut}
        style={{ marginTop: Spacing.xxl, marginBottom: Spacing.lg, borderRadius: Radii.pill }}
      />

      <ClaimQRModal visible={qrToken !== null} token={qrToken} title={qrPerkTitle} onClose={() => setQrToken(null)} />
    </Screen>
  );
}
