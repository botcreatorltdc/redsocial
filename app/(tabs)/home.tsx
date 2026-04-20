import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { FeedReviewCard } from "../../src/features/feed/components/FeedReviewCard";
import { supabase } from "../../src/lib/supabase";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";

type ReviewItem = {
  id: string;
  author_id: string;
  target_type: "club" | "product";
  target_id: string;
  rating: number;
  content_text: string;
  created_at: string;
};

type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

type ProductRow = {
  id: string;
  name: string;
};

type FeedRow = {
  id: string;
  authorName: string;
  clubName: string;
  reviewText: string;
  rating: number;
  createdAtLabel: string;
  likesCount: number;
  commentsCount: number;
  avatarUrl?: string;
};

type ReviewLikeRow = {
  review_id: string;
  user_id: string;
};

function relativeDateLabel(dateInput: string) {
  const createdAtDate = new Date(dateInput);
  const createdAt = createdAtDate.getTime();
  const now = Date.now();
  const diffMs = now - createdAt;
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  const sameDay =
    createdAtDate.getDate() === new Date(now).getDate() &&
    createdAtDate.getMonth() === new Date(now).getMonth() &&
    createdAtDate.getFullYear() === new Date(now).getFullYear();

  if (sameDay && mins < 60) {
    return `Hace ${mins} min`;
  }
  if (sameDay) {
    const hoursToday = Math.floor(mins / 60);
    return `Hace ${hoursToday} horas`;
  }
  if (mins < 60) {
    return `Hace ${mins} min`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `Hace ${hours} horas`;
  }
  const days = Math.floor(hours / 24);
  if (days === 1) {
    return "Ayer";
  }
  return `Hace ${days} dias`;
}

function buildMockComments(reviewId: string) {
  const seed = reviewId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (seed % 9) + 2;
}

export default function HomeScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState("Nickname");
  const [feedRows, setFeedRows] = useState<FeedRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [likedByMe, setLikedByMe] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeed = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const currentUser = userData.user;
    setCurrentUserId(currentUser?.id ?? null);

    if (currentUser) {
      const { data: me } = await (supabase as any)
        .from("profiles")
        .select("username, full_name")
        .eq("id", currentUser.id)
        .maybeSingle();

      const display = me?.username || me?.full_name;
      if (display) {
        setNickname(display);
      }
    }

    const { data: reviewsData, error } = await (supabase as any)
      .from("reviews")
      .select("id, author_id, target_type, target_id, rating, content_text, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !reviewsData) {
      setFeedRows([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const reviews = reviewsData as ReviewItem[];
    const authorIds = Array.from(new Set(reviews.map((review) => review.author_id)));
    const productIds = Array.from(
      new Set(
        reviews
          .filter((review) => review.target_type === "product")
          .map((review) => review.target_id)
      )
    );

    const [{ data: profilesData }, { data: productsData }] = await Promise.all([
      authorIds.length > 0
        ? (supabase as any)
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .in("id", authorIds)
        : Promise.resolve({ data: [] }),
      productIds.length > 0
        ? supabase.from("products").select("id, name").in("id", productIds)
        : Promise.resolve({ data: [] })
    ]);

    const profiles = (profilesData as ProfileRow[]) ?? [];
    const products = (productsData as ProductRow[]) ?? [];
    const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
    const productMap = new Map(products.map((product) => [product.id, product.name]));
    const reviewIds = reviews.map((review) => review.id);

    let likesRows: ReviewLikeRow[] = [];
    if (reviewIds.length > 0) {
      const { data: likesData } = await (supabase as any)
        .from("review_likes")
        .select("review_id, user_id")
        .in("review_id", reviewIds);
      likesRows = (likesData as ReviewLikeRow[]) ?? [];
    }

    const likesCountMap = new Map<string, number>();
    const likedByCurrentUserMap: Record<string, boolean> = {};
    likesRows.forEach((like) => {
      likesCountMap.set(like.review_id, (likesCountMap.get(like.review_id) ?? 0) + 1);
      if (currentUser?.id && like.user_id === currentUser.id) {
        likedByCurrentUserMap[like.review_id] = true;
      }
    });

    const mappedRows: FeedRow[] = reviews.map((review) => {
      const author = profileMap.get(review.author_id);
      return {
        id: review.id,
        authorName: author?.username || author?.full_name || "Usuario",
        clubName:
          review.target_type === "product"
            ? productMap.get(review.target_id) || "Variedad"
            : "Reseña de club",
        reviewText: review.content_text,
        rating: review.rating,
        createdAtLabel: relativeDateLabel(review.created_at),
        likesCount: likesCountMap.get(review.id) ?? 0,
        commentsCount: buildMockComments(review.id),
        avatarUrl: author?.avatar_url ?? undefined
      };
    });

    setLikedByMe(likedByCurrentUserMap);
    setFeedRows(mappedRows);
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

  const toggleLike = useCallback(
    async (reviewId: string) => {
      if (!currentUserId) {
        return;
      }

      const isLiked = Boolean(likedByMe[reviewId]);

      if (isLiked) {
        const { error } = await (supabase as any)
          .from("review_likes")
          .delete()
          .eq("review_id", reviewId)
          .eq("user_id", currentUserId);
        if (error) {
          return;
        }
      } else {
        const { error } = await (supabase as any).from("review_likes").insert({
          review_id: reviewId,
          user_id: currentUserId
        });
        if (error) {
          return;
        }
      }

      setLikedByMe((prev) => ({ ...prev, [reviewId]: !isLiked }));
      setFeedRows((prev) =>
        prev.map((row) =>
          row.id === reviewId
            ? { ...row, likesCount: Math.max(0, row.likesCount + (isLiked ? -1 : 1)) }
            : row
        )
      );
    },
    [currentUserId, likedByMe]
  );

  const header = useMemo(
    () => (
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {nickname} 🌿</Text>
        <Text style={styles.subtitle}>Tu comunidad wellness hoy</Text>
      </View>
    ),
    [nickname]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={feedRows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <FeedReviewCard
            reviewId={item.id}
            authorName={item.authorName}
            clubName={item.clubName}
            rating={item.rating}
            createdAtLabel={item.createdAtLabel}
            reviewText={item.reviewText}
            likesCount={item.likesCount}
            commentsCount={item.commentsCount}
            isLiked={Boolean(likedByMe[item.id])}
            onToggleLike={toggleLike}
            avatarUrl={item.avatarUrl}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Aun no hay reseñas publicadas</Text>
              <Text style={styles.emptySubtitle}>Comparte la primera experiencia de la comunidad.</Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.pine} />
        }
      />
      <Pressable style={styles.floatingButton} onPress={() => router.push("/modals/create-post")}>
        <Text style={styles.floatingButtonText}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28
  },
  header: {
    marginBottom: 16
  },
  greeting: {
    color: colors.textPrimary,
    ...typography.title
  },
  subtitle: {
    color: colors.textSecondary,
    ...typography.body,
    marginTop: 4
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 14
  },
  emptyTitle: {
    color: colors.textPrimary,
    ...typography.subtitle
  },
  emptySubtitle: {
    color: colors.textSecondary,
    ...typography.body,
    marginTop: 4
  },
  floatingButton: {
    position: "absolute",
    right: 18,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: colors.pine,
    alignItems: "center",
    justifyContent: "center"
  },
  floatingButtonText: {
    color: colors.surface,
    fontSize: 30,
    marginTop: -2
  }
});
