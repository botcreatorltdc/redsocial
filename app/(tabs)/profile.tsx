import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Pressable, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../../src/lib/supabase";
import { radius } from "../../src/theme/radius";
import { typography } from "../../src/theme/typography";

type ProfileData = {
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = async () => {
      if (!refreshing) setLoading(true);
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData.user;

      if (!currentUser) {
        router.replace("/(auth)/sign-in");
        return;
      }

      setUserId(currentUser.id);
      const { data: profileData } = await (supabase as any)
        .from("profiles")
        .select("username, full_name, avatar_url")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as ProfileData);
        setUsernameInput((profileData as ProfileData).username ?? "");
      }
      setLoading(false);
      setRefreshing(false);
    };

  useEffect(() => {
    void loadProfile();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    void loadProfile();
  };

  const handleCompleteProfile = async () => {
    if (!userId || !usernameInput.trim()) {
      return;
    }
    setIsSaving(true);
    const payload = {
      id: userId,
      username: usernameInput.trim(),
      full_name: profile?.full_name ?? null,
      avatar_url: profile?.avatar_url ?? null
    };

    const { data } = await (supabase as any)
      .from("profiles")
      .upsert(payload)
      .select("username, full_name, avatar_url")
      .maybeSingle();

    if (data) {
      setProfile(data as ProfileData);
    }
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/(auth)/sign-in");
  };

  const displayName = profile?.full_name || profile?.username || "Usuario";
  const avatarInitial = (displayName || "U").charAt(0).toUpperCase();
  const stats = [
    { label: "Reseñas", value: "24" },
    { label: "Likes", value: "128" },
    { label: "Clubes", value: "6" }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarInitial}</Text>
            </View>
          )}
          <Text style={styles.nickname}>{loading ? "Cargando..." : displayName}</Text>
          <Text style={styles.usernameLine}>
            {profile?.username ? `@${profile.username}` : "Perfil pendiente de completar"}
          </Text>
        </View>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {!profile?.username ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Completar Perfil</Text>
            <TextInput
              placeholder="Elige un username"
              placeholderTextColor="#7A7F86"
              value={usernameInput}
              onChangeText={setUsernameInput}
              autoCapitalize="none"
              style={styles.input}
            />
            <Pressable style={styles.primaryButton} onPress={handleCompleteProfile} disabled={isSaving}>
              <Text style={styles.primaryButtonText}>
                {isSaving ? "Guardando..." : "Completar Perfil"}
              </Text>
            </Pressable>
          </View>
        ) : null}

        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Cerrar Sesión</Text>
        </Pressable>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 20
  },
  header: {
    alignItems: "center",
    marginBottom: 16
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    backgroundColor: "#DCE8E2",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: radius.pill
  },
  avatarText: {
    color: "#1A1B1E",
    fontSize: 28,
    fontWeight: "600"
  },
  nickname: {
    marginTop: 14,
    color: "#1A1B1E",
    fontSize: 28,
    fontWeight: "600",
    letterSpacing: 0.2
  },
  usernameLine: {
    marginTop: 6,
    color: "#5F6368",
    fontSize: 14,
    lineHeight: 24
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#F7F4EE",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 18
  },
  statItem: {
    flex: 1,
    alignItems: "center"
  },
  statValue: {
    color: "#1A1B1E",
    fontSize: 20,
    fontWeight: "600"
  },
  statLabel: {
    marginTop: 3,
    color: "#5F6368",
    ...typography.caption
  },
  sectionCard: {
    backgroundColor: "#FCFBF8",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1
  },
  sectionTitle: {
    color: "#1A1B1E",
    fontSize: 18,
    fontWeight: "500"
  },
  input: {
    marginTop: 12,
    backgroundColor: "#F8F5EF",
    borderColor: "#E8E2D7",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#1A1B1E",
    fontSize: 15
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: "#2D463E",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center"
  },
  primaryButtonText: {
    color: "#FCFBF8",
    fontSize: 15,
    fontWeight: "600"
  },
  signOutButton: {
    marginTop: 6,
    backgroundColor: "#F2EEE6",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center"
  },
  signOutText: {
    color: "#1A1B1E",
    fontSize: 15,
    fontWeight: "500"
  }
});
