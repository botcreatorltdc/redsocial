import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../../theme/colors";
import { radius } from "../../../theme/radius";
import { typography } from "../../../theme/typography";

type ProductCardProps = {
  name: string;
  type: "Índica" | "Sativa" | "CBD" | "Híbrida";
  thcPercent: number;
  cbdPercent: number;
};

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function ProductCard({
  name,
  type,
  thcPercent,
  cbdPercent
}: ProductCardProps) {
  const thc = clampPercent(thcPercent);
  const cbd = clampPercent(cbdPercent);

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.type}>{type}</Text>

      <View style={styles.barGroup}>
        <View style={styles.barHeader}>
          <Text style={styles.barLabel}>THC</Text>
          <Text style={styles.barValue}>{thc}%</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, styles.thcFill, { width: `${thc}%` }]} />
        </View>
      </View>

      <View style={styles.barGroup}>
        <View style={styles.barHeader}>
          <Text style={styles.barLabel}>CBD</Text>
          <Text style={styles.barValue}>{cbd}%</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, styles.cbdFill, { width: `${cbd}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 12
  },
  name: {
    color: colors.textPrimary,
    ...typography.subtitle
  },
  type: {
    color: colors.textSecondary,
    ...typography.caption,
    marginTop: 2,
    marginBottom: 10
  },
  barGroup: {
    marginTop: 8
  },
  barHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6
  },
  barLabel: {
    color: colors.textPrimary,
    ...typography.caption
  },
  barValue: {
    color: colors.textSecondary,
    ...typography.caption
  },
  track: {
    width: "100%",
    height: 8,
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    overflow: "hidden"
  },
  fill: {
    height: "100%",
    borderRadius: radius.pill
  },
  thcFill: {
    backgroundColor: colors.terracotta
  },
  cbdFill: {
    backgroundColor: colors.eucalyptus
  }
});
