import React from "react";
import { Pressable, Text, View } from "react-native";

type ClubMapCardProps = {
  clubName: string;
  distanceKm: number;
  rating: number;
  onViewProfile?: () => void;
};

function formatStars(rating: number) {
  const rounded = Math.max(1, Math.min(5, Math.round(rating)));
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

export function ClubMapCard({ clubName, distanceKm, rating, onViewProfile }: ClubMapCardProps) {
  return (
    <View className="rounded-t-[32px] border border-botanical-line bg-white px-6 pb-7 pt-4">
      <View className="mb-3 h-1.5 w-14 self-center rounded-full bg-botanical-line" />
      <Text className="text-[11px] font-semibold tracking-[1.2px] text-[#7C857F]">MONSTERA LOUNGE</Text>
      <Text className="mt-1 font-serif text-4xl text-botanical-primary">{clubName}</Text>
      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-base tracking-[1px] text-[#C7A54B]">{formatStars(rating)}</Text>
        <Text className="text-sm text-botanical-muted">{distanceKm.toFixed(1)} km</Text>
      </View>

      <Pressable
        onPress={onViewProfile}
        className="mt-5 items-center rounded-full bg-botanical-primary py-3.5"
      >
        <Text className="text-sm font-semibold tracking-[0.3px] text-botanical-bg">
          Ver Perfil Completo
        </Text>
      </Pressable>
    </View>
  );
}
