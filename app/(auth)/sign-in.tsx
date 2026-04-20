import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../../src/lib/supabase";
import { colors } from "../../src/theme/colors";
import { radius } from "../../src/theme/radius";
import { typography } from "../../src/theme/typography";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = async () => {
    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.replace("/(tabs)/home");
  };

  const handleSignUp = async () => {
    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Iniciar sesión</Text>
        <Text style={styles.subtitle}>Accede de forma rápida y privada</Text>

        <View style={styles.actions}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Contraseña"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Pressable style={styles.providerButton} onPress={handleSignIn} disabled={loading}>
            <Text style={styles.providerButtonText}>
              {loading ? "Procesando..." : "Entrar"}
            </Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={handleSignUp} disabled={loading}>
            <Text style={styles.secondaryButtonText}>Registrarse</Text>
          </Pressable>
        </View>

        <Text style={styles.privacyText}>
          Tu identidad se protege mediante nickname y controles de privacidad por diseño.
        </Text>
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
    justifyContent: "center"
  },
  title: {
    color: colors.textPrimary,
    ...typography.title
  },
  subtitle: {
    marginTop: 6,
    color: colors.textSecondary,
    ...typography.body
  },
  actions: {
    marginTop: 24
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    color: colors.textPrimary,
    ...typography.body
  },
  providerButton: {
    backgroundColor: colors.pine,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10
  },
  providerButtonText: {
    color: colors.surface,
    ...typography.subtitle
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center"
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    ...typography.subtitle
  },
  errorText: {
    color: "#C25454",
    ...typography.caption,
    marginBottom: 8
  },
  privacyText: {
    marginTop: 20,
    color: colors.textSecondary,
    ...typography.caption,
    textAlign: "center"
  }
});
