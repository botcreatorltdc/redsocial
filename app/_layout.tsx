import { router, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { supabase } from "../src/lib/supabase";
import "../global.css";

export default function RootLayout() {
  const segments = useSegments();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(Boolean(data.session));
    };

    void checkInitialSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated === null) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    if (!isAuthenticated && inTabsGroup) {
      router.replace("/(auth)/sign-in");
      return;
    }

    if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/home");
    }
  }, [isAuthenticated, segments]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="club/[id]" />
        <Stack.Screen name="modals/create-post" options={{ presentation: "modal" }} />
      </Stack>
    </>
  );
}
