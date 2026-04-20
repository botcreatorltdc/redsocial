import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../../src/lib/supabase";
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
        <View style={styles.welcomeBlock}>
          <Text style={styles.overline}>Premium Wellness Network</Text>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>Accede a tu espacio privado de comunidad y bienestar.</Text>
        </View>

        <View style={styles.actions}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor="#7A7F86"
            style={styles.input}
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Contraseña"
            placeholderTextColor="#7A7F86"
            style={styles.input}
          />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Pressable
            style={({ pressed }) => [styles.providerButton, pressed && styles.providerButtonPressed]}
            onPress={handleSignIn}
            disabled={loading}
          >
            <Text style={styles.providerButtonText}>
              {loading ? "Procesando..." : "Entrar"}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
            onPress={handleSignUp}
            disabled={loading}
          >
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
    backgroundColor: "#FCFBF8"
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
    paddingTop: 64,
    paddingBottom: 32
  },
  welcomeBlock: {
    marginTop: 10
  },
  overline: {
    color: "#2D463E",
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  title: {
    color: "#1A1B1E",
    fontSize: 42,
    fontWeight: "600",
    letterSpacing: 0.2,
    marginTop: 12
  },
  subtitle: {
    marginTop: 12,
    color: "#5F6368",
    fontSize: 16,
    lineHeight: 30
  },
  actions: {
    marginTop: 26
  },
  input: {
    backgroundColor: "#F8F5EF",
    borderColor: "#E8E2D7",
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    color: "#1A1B1E",
    fontSize: 15
  },
  providerButton: {
    backgroundColor: "#2D463E",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 6
  },
  providerButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }]
  },
  providerButtonText: {
    color: "#FCFBF8",
    fontSize: 16,
    fontWeight: "600"
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderColor: "#D9D2C6",
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10
  },
  secondaryButtonPressed: {
    opacity: 0.9
  },
  secondaryButtonText: {
    color: "#1A1B1E",
    fontSize: 15,
    fontWeight: "500"
  },
  errorText: {
    color: "#8D3F3F",
    ...typography.caption,
    marginBottom: 6
  },
  privacyText: {
    marginTop: 20,
    color: "#7A7F86",
    ...typography.caption,
    textAlign: "center",
    lineHeight: 20
  }
});
