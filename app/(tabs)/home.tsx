import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Image, Pressable, RefreshControl, SafeAreaView, Text, View } from "react-native";
import { supabase } from "../../src/lib/supabase";
import { colors } from "../../src/theme/colors";

type ClubRow = {
  id: string;
  name: string;
  address: string | null;
  description: string | null;
  cover_image: string | null;
};

type ExploreCard = {
  id: string;
  title: string;
  category: string;
  meta: string;
  imageUrl: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState("Nickname");
  const [cards, setCards] = useState<ExploreCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeed = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const currentUser = userData.user ?? null;

    if (currentUser) {
      const { data: me } = await (supabase as any)
        .from("profiles")
        .select("username, full_name")
        .eq("id", currentUser.id)
        .maybeSingle();

      const display = me?.username || me?.full_name;
      if (display) setNickname(display);
    }

    const { data: clubsData, error } = await (supabase as any)
      .from("clubs")
      .select("id, name, address, description, cover_image")
      .order("name", { ascending: true })
      .limit(24);

    if (error || !clubsData) {
      setCards([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const mappedRows: ExploreCard[] = (clubsData as ClubRow[]).map((club, index) => ({
      id: club.id,
      title: club.name,
      category: ["Terrace", "Lounge", "CBD", "Sativa"][index % 4],
      meta: club.address || club.description || "Experiencia botanica premium",
      imageUrl: club.cover_image || "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1000&q=80"
    }));

    setCards(mappedRows);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void loadFeed();
    }, [loadFeed])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void loadFeed();
  }, [loadFeed]);

  const header = useMemo(
    () => (
      <View className="mb-6 px-0.5">
        <Text className="font-serif text-[34px] leading-[42px] text-botanical-primary">Welcome back, {nickname}</Text>
        <Text className="mt-2 text-[15px] leading-[22px] text-botanical-muted">Discover botanical clubs near you</Text>
      </View>
    ),
    [nickname]
  );

  return (
    <SafeAreaView className="flex-1 bg-botanical-bg">
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-[18px] pb-9 pt-5"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <Pressable
            className="mb-5 rounded-[32px] bg-white p-3"
            style={{ shadowColor: "#2D463E", shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 3 }}
            onPress={() => router.push(`/club/${item.id}`)}
          >
            <View className="relative h-80 overflow-hidden rounded-3xl">
              <Image source={{ uri: item.imageUrl }} className="h-full w-full" />
              <View className="absolute right-3 top-3 rounded-full bg-botanical-bg px-3 py-1.5">
                <Text className="text-[11px] font-semibold tracking-[1.1px] text-botanical-primary">{item.category}</Text>
              </View>
            </View>

            <View className="px-1 py-3.5">
              <Text className="font-serif text-[26px] text-botanical-primary" numberOfLines={1}>
                {item.title}
              </Text>
              <Text className="mt-1.5 text-sm leading-5 text-botanical-muted" numberOfLines={2}>
                {item.meta}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          loading ? (
            <View className="space-y-3">
              <View className="h-40 rounded-3xl bg-botanical-cream" />
              <View className="h-40 rounded-3xl bg-botanical-cream" />
            </View>
          ) : (
            <View
              className="rounded-[32px] bg-botanical-cream p-5"
              style={{ shadowColor: "#2D463E", shadowOpacity: 0.05, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 1 }}
            >
              <Text className="text-lg font-semibold text-botanical-text">Aun no hay clubes publicados</Text>
              <Text className="mt-2 text-sm leading-6 text-botanical-muted">Agrega tu primer club desde el panel B2B.</Text>
            </View>
          ) : null
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.pine} />}
      />

      <Pressable
        className="absolute bottom-6 right-[18px] h-14 w-14 items-center justify-center rounded-[28px] bg-botanical-primary"
        style={{ shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 4 }}
        onPress={() => router.push("/modals/create-post")}
      >
        <Text className="-mt-0.5 text-3xl text-botanical-bg">+</Text>
      </Pressable>
    </SafeAreaView>
  );
}
