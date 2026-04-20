import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../../theme/colors";
import { radius } from "../../../theme/radius";
import { typography } from "../../../theme/typography";

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

export function ClubMapCard({
  clubName,
  distanceKm,
  rating,
  onViewProfile
}: ClubMapCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.handle} />
      <Text style={styles.clubName}>{clubName}</Text>
      <Text style={styles.metaText}>A {distanceKm.toFixed(1)} km de ti</Text>
      <Text style={styles.stars}>{formatStars(rating)}</Text>

      <Pressable onPress={onViewProfile} style={styles.button}>
        <Text style={styles.buttonText}>Ver Perfil Completo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: 10
  },
  clubName: {
    color: colors.textPrimary,
    ...typography.title,
    fontSize: 20
  },
  metaText: {
    color: colors.textSecondary,
    ...typography.body,
    marginTop: 4
  },
  stars: {
    color: colors.star,
    ...typography.subtitle,
    marginTop: 6
  },
  button: {
    marginTop: 14,
    backgroundColor: colors.pine,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: "center"
  },
  buttonText: {
    color: colors.surface,
    ...typography.subtitle
  }
});
