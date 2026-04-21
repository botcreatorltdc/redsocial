import React from "react";
import { Pressable, Text, View } from "react-native";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View className="mb-4">
      <Text className="font-serif text-[30px] leading-[36px] text-botanical-primary">{title}</Text>
      {subtitle ? <Text className="mt-1 text-sm text-botanical-muted">{subtitle}</Text> : null}
    </View>
  );
}

type InlineErrorProps = {
  message: string;
};

export function InlineError({ message }: InlineErrorProps) {
  return (
    <View className="mb-3 rounded-2xl bg-red-50 px-4 py-3">
      <Text className="text-sm text-red-700">{message}</Text>
    </View>
  );
}

type PrimaryEmptyActionProps = {
  label: string;
  onPress: () => void;
};

export function PrimaryEmptyAction({ label, onPress }: PrimaryEmptyActionProps) {
  return (
    <Pressable className="mt-3 self-start rounded-full bg-botanical-primary px-4 py-2" onPress={onPress}>
      <Text className="text-xs font-semibold tracking-[0.06em] text-botanical-bg">{label}</Text>
    </Pressable>
  );
}
