import { router } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import { supabase } from "../../src/lib/supabase";

export default function LoginShortcutScreen() {
  return (
    <SafeAreaView className="flex-1 bg-botanical-bg">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="font-serif text-4xl text-botanical-primary">Cuenta</Text>
        <Text className="mt-2 text-center text-sm text-botanical-muted">
          Accede o crea tu cuenta para publicar, votar y gestionar favoritos.
        </Text>

        <Pressable
          className="mt-6 w-full max-w-xs rounded-full bg-botanical-primary px-6 py-3"
          onPress={() => router.push("/(auth)/sign-in")}
        >
          <Text className="text-center text-sm font-semibold text-white">Ir a Login / Registro</Text>
        </Pressable>

        <Pressable
          className="mt-3 w-full max-w-xs rounded-full border border-botanical-line bg-white px-6 py-3"
          onPress={async () => {
            await supabase.auth.signOut();
            router.replace("/(auth)/sign-in");
          }}
        >
          <Text className="text-center text-sm font-semibold text-botanical-muted">Cerrar sesión actual</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
