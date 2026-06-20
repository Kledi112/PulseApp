import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { AppText, Button, Input, Screen } from '@/components/ui';
import { createQuest } from '@/services/quests';
import { Colors, Radii, Spacing } from '@/theme';
import { QuestType } from '@/types';

const TYPE_OPTIONS: { key: QuestType; label: string }[] = [
  { key: 'team', label: 'Team' },
  { key: 'individual', label: 'Individual' },
  { key: 'either', label: 'Either' },
];

export default function CreateQuestScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
  const [deadline, setDeadline] = useState('');
  const [type, setType] = useState<QuestType>('team');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Title is required';
    if (!description.trim()) next.description = 'Description is required';
    if (!reward.trim()) next.reward = 'Reward is required';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) next.deadline = 'Use YYYY-MM-DD format';
    return next;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await createQuest({ title, description, reward, type, deadline });
      router.back();
    } catch {
      Alert.alert('Could not create quest', 'Could not reach the backend. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <View style={{ gap: Spacing.md, marginTop: Spacing.sm }}>
        <Input label="Title" value={title} onChangeText={setTitle} error={errors.title} placeholder="Ship the new onboarding flow" />
        <Input label="Description" value={description} onChangeText={setDescription} error={errors.description} placeholder="What needs to happen and by when" multiline numberOfLines={3} />
        <Input label="Reward" value={reward} onChangeText={setReward} error={errors.reward} placeholder="Dinner for the team at Padam" />
        <Input label="Deadline" value={deadline} onChangeText={setDeadline} error={errors.deadline} placeholder="2026-07-15" />

        <View style={{ gap: Spacing.xxs }}>
          <AppText variant="label" color={Colors.textSecondary}>
            Quest type
          </AppText>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {TYPE_OPTIONS.map((option) => (
              <Pressable
                key={option.key}
                onPress={() => setType(option.key)}
                style={{
                  flex: 1,
                  paddingVertical: Spacing.sm,
                  borderRadius: Radii.md,
                  alignItems: 'center',
                  backgroundColor: type === option.key ? Colors.surfaceElevated : Colors.surface,
                  borderWidth: 1,
                  borderColor: type === option.key ? Colors.teal : Colors.border,
                }}>
                <AppText variant="label" color={type === option.key ? Colors.teal : Colors.textSecondary}>
                  {option.label}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>

        <Button label="Create quest" onPress={handleSubmit} loading={submitting} style={{ marginTop: Spacing.sm }} />
      </View>
    </Screen>
  );
}
