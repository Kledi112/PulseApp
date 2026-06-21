import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

import { AssistantPerkCard } from '@/components/AssistantPerkCard';
import { AppText, Input, Screen } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { sendAssistantMessage } from '@/services/assistant';
import { useBundleStore } from '@/store/bundle-store';
import { Colors, Radii, Spacing } from '@/theme';
import { AssistantMessage } from '@/types';

function TypingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(delay, withRepeat(withTiming(1, { duration: 400 }), -1, true));
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.textTertiary },
        style,
      ]}
    />
  );
}

function TypingBubble() {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        gap: 4,
        backgroundColor: Colors.surface,
        borderRadius: Radii.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 2,
        marginTop: Spacing.sm,
      }}>
      <TypingDot delay={0} />
      <TypingDot delay={150} />
      <TypingDot delay={300} />
    </View>
  );
}

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

    try {
      const reply = await sendAssistantMessage(text);
      setMessages((prev) => [...prev, reply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          text: "Sorry, I couldn't reach the assistant. Please try again.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm }}>
          <AppText variant="title">Assistant</AppText>
        </View>

        <FlatList
          ref={listRef}
          style={{ flex: 1 }}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.sm }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={typing ? <TypingBubble /> : null}
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
