import { router } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../src/theme/colors";
import { radius } from "../../src/theme/radius";
import { typography } from "../../src/theme/typography";

export default function AgeGateScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>Bienestar y comunidad</Text>
        <Text style={styles.title}>¿Eres mayor de 18 años?</Text>
        <Text style={styles.body}>
          Esta plataforma prioriza la educación, seguridad y privacidad de la comunidad.
        </Text>

        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={() => router.replace("/(tabs)/home")}>
            <Text style={styles.primaryButtonText}>Sí, tengo +18</Text>
          </Pressable>

          <Pressable style={styles.ghostButton} onPress={() => router.replace("/(auth)/sign-in")}>
            <Text style={styles.ghostButtonText}>Soy menor</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  eyebrow: {
    color: colors.eucalyptus,
    ...typography.caption,
    marginBottom: 8
  },
  title: {
    color: colors.textPrimary,
    ...typography.title,
    textAlign: "center",
    fontSize: 30,
    lineHeight: 36
  },
  body: {
    color: colors.textSecondary,
    ...typography.body,
    textAlign: "center",
    marginTop: 12
  },
  actions: {
    width: "100%",
    marginTop: 28
  },
  primaryButton: {
    backgroundColor: colors.terracotta,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center"
  },
  primaryButtonText: {
    color: colors.surface,
    ...typography.subtitle
  },
  ghostButton: {
    marginTop: 14,
    alignItems: "center",
    paddingVertical: 8
  },
  ghostButtonText: {
    color: colors.textSecondary,
    ...typography.body
  }
});
