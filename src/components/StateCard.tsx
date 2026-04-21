import React from "react";
import { Text, View } from "react-native";

type StateVariant = "loading" | "empty" | "error" | "info";

type StateCardProps = {
  title: string;
  description?: string;
  variant?: StateVariant;
};

const variantStyles: Record<StateVariant, { bg: string; title: string; body: string }> = {
  loading: { bg: "bg-botanical-cream", title: "text-botanical-primary", body: "text-botanical-muted" },
  empty: { bg: "bg-botanical-cream", title: "text-botanical-text", body: "text-botanical-muted" },
  error: { bg: "bg-red-50", title: "text-red-700", body: "text-red-600" },
  info: { bg: "bg-emerald-50", title: "text-emerald-700", body: "text-emerald-600" }
};

export function StateCard({ title, description, variant = "empty" }: StateCardProps) {
  const style = variantStyles[variant];
  return (
    <View className={`rounded-[24px] p-4 ${style.bg}`}>
      <Text className={`text-base font-semibold ${style.title}`}>{title}</Text>
      {description ? <Text className={`mt-1 text-sm ${style.body}`}>{description}</Text> : null}
    </View>
  );
}

type SkeletonListProps = {
  count?: number;
  height?: number;
};

export function SkeletonList({ count = 2, height = 120 }: SkeletonListProps) {
  return (
    <View className="gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={`skeleton-${index}`}
          className="rounded-[24px] bg-botanical-cream"
          style={{ height }}
        />
      ))}
    </View>
  );
}
