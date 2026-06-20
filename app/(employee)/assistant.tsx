import { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { AssistantPerkCard } from '@/components/AssistantPerkCard';
import { AppText, Input, Screen } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { sendAssistantMessage } from '@/services/assistant';
import { useBundleStore } from '@/store/bundle-store';
import { Colors, Radii, Spacing } from '@/theme';
import { AssistantMessage } from '@/types';

const INITIAL_MESSAGE: AssistantMessage = {
  id: 'msg-initial',
  role: 'assistant',
  text: 'Hi, I am your Pulse assistant. Tell me what kind of perk you are after, like "find me something relaxing".',
  createdAt: new Date().toISOString(),
};

export default function AssistantScreen() {
  const [messages, setMessages] = useState<AssistantMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef<FlatList<AssistantMessage>>(null);
  const bundleItems = useBundleStore((state) => state.items);
  const addPerk = useBundleStore((state) => state.addPerk);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const userMessage: AssistantMessage = { id: `msg-${Date.now()}`, role: 'user', text, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setTyping(true);

    const reply = await sendAssistantMessage(text);
    setTyping(false);
    setMessages((prev) => [...prev, reply]);
  };

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'android' ? 12 : 0}
        style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm }}>
          <AppText variant="title">Assistant</AppText>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.sm }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View style={{ gap: Spacing.xs }}>
              <View
                style={{
                  alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  backgroundColor: item.role === 'user' ? Colors.teal : Colors.surface,
                  borderRadius: Radii.lg,
                  borderWidth: item.role === 'user' ? 0 : 1,
                  borderColor: Colors.border,
                  paddingHorizontal: Spacing.md,
                  paddingVertical: Spacing.sm,
                }}>
                <AppText variant="body" color={item.role === 'user' ? Colors.background : Colors.textPrimary}>
                  {item.text}
                </AppText>
              </View>
              {item.perks && item.perks.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm }}>
                  {item.perks.map((perk) => (
                    <AssistantPerkCard
                      key={perk.id}
                      perk={perk}
                      onAddToBundle={addPerk}
                      added={bundleItems.some((bundleItem) => bundleItem.id === perk.id)}
                    />
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        />

        {typing && (
          <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xs }}>
            <AppText variant="caption" color={Colors.textTertiary}>
              Assistant is typing…
            </AppText>
          </View>
        )}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.sm,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
          }}>
          <View style={{ flex: 1 }}>
            <Input label="" value={input} onChangeText={setInput} placeholder="Ask for a perk..." onSubmitEditing={handleSend} returnKeyType="send" />
          </View>
          <Pressable
            onPress={handleSend}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: Colors.teal,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <IconSymbol name="paperplane.fill" size={18} color={Colors.background} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
