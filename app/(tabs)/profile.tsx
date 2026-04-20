import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../../src/lib/supabase";
import { colors } from "../../src/theme/colors";
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

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
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
    };

    void loadProfile();
  }, []);

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarInitial}</Text>
            </View>
          )}
          <Text style={styles.nickname}>{loading ? "Cargando..." : displayName}</Text>
          <Text style={styles.reviewCount}>
            {profile?.username ? `@${profile.username}` : "Perfil pendiente de completar"}
          </Text>
        </View>

        {!profile?.username ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Completar Perfil</Text>
            <TextInput
              placeholder="Elige un username"
              placeholderTextColor={colors.textSecondary}
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
    paddingHorizontal: 16,
    paddingTop: 16
  },
  header: {
    alignItems: "center",
    marginBottom: 20
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: radius.pill,
    backgroundColor: colors.sage,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: radius.pill
  },
  avatarText: {
    color: colors.surface,
    ...typography.title
  },
  nickname: {
    marginTop: 10,
    color: colors.textPrimary,
    ...typography.title,
    fontSize: 22
  },
  reviewCount: {
    marginTop: 4,
    color: colors.textSecondary,
    ...typography.body
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 12
  },
  sectionTitle: {
    color: colors.textPrimary,
    ...typography.subtitle
  },
  sectionSubtitle: {
    marginTop: 6,
    color: colors.textSecondary,
    ...typography.body
  },
  input: {
    marginTop: 8,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    ...typography.body
  },
  primaryButton: {
    marginTop: 10,
    backgroundColor: colors.pine,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: "center"
  },
  primaryButtonText: {
    color: colors.surface,
    ...typography.subtitle
  },
  signOutButton: {
    marginTop: 8,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: "center"
  },
  signOutText: {
    color: colors.textPrimary,
    ...typography.subtitle
  }
});
