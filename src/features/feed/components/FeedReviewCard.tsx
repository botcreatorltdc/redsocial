import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../../theme/colors";
import { radius } from "../../../theme/radius";
import { typography } from "../../../theme/typography";

export type FeedReviewCardProps = {
  reviewId: string;
  authorName: string;
  clubName: string;
  reviewText: string;
  rating: number;
  createdAtLabel: string;
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  onToggleLike?: (reviewId: string) => void;
  avatarUrl?: string;
  onPress?: () => void;
};

function renderStars(rating: number) {
  const safeRating = Math.max(1, Math.min(5, Math.round(rating)));
  return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
}

export function FeedReviewCard({
  reviewId,
  authorName,
  clubName,
  reviewText,
  rating,
  createdAtLabel,
  likesCount = 0,
  commentsCount = 0,
  isLiked = false,
  onToggleLike,
  avatarUrl,
  onPress
}: FeedReviewCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {authorName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={styles.author} numberOfLines={1}>
            {authorName}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {clubName} · {createdAtLabel}
          </Text>
        </View>
        <View style={styles.ratingPill}>
          <Text style={styles.ratingText}>{renderStars(rating)}</Text>
        </View>
      </View>

      <Text style={styles.review} numberOfLines={4}>
        {reviewText}
      </Text>

      <View style={styles.actionsRow}>
        <Pressable style={styles.actionItem} onPress={() => onToggleLike?.(reviewId)}>
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={16}
            color={isLiked ? colors.terracotta : colors.textSecondary}
          />
          <Text style={styles.actionText}>{likesCount}</Text>
        </Pressable>
        <View style={styles.actionItem}>
          <Ionicons name="chatbubble-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.actionText}>{commentsCount}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FCFBF8",
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    marginRight: 10
  },
  avatarPlaceholder: {
    backgroundColor: colors.sage,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarInitial: {
    color: colors.surface,
    ...typography.subtitle
  },
  headerText: {
    flex: 1,
    minWidth: 0
  },
  author: {
    color: colors.textPrimary,
    ...typography.subtitle
  },
  meta: {
    color: colors.textSecondary,
    ...typography.caption
  },
  ratingPill: {
    backgroundColor: "#F3E7E1",
    borderRadius: radius.md,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8
  },
  ratingText: {
    color: colors.terracotta,
    ...typography.caption
  },
  review: {
    color: colors.textPrimary,
    ...typography.body
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16
  },
  actionText: {
    marginLeft: 6,
    color: colors.textSecondary,
    ...typography.caption
  }
});
