import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
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
  const starText = "★".repeat(Math.max(1, Math.min(5, Math.round(rating))));

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
          <View style={styles.metaRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText} numberOfLines={1}>
                {clubName}
              </Text>
            </View>
            <Text style={styles.metaDate} numberOfLines={1}>
              {createdAtLabel}
            </Text>
          </View>
          <Text style={styles.ratingMinimal}>{starText}</Text>
          <Text style={styles.review} numberOfLines={4}>
            {reviewText}
          </Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={styles.actionItem} onPress={() => onToggleLike?.(reviewId)}>
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={16}
            color={isLiked ? "#2D463E" : "#5F6368"}
          />
          <Text style={styles.actionText}>{likesCount}</Text>
        </Pressable>
        <View style={styles.actionItem}>
          <Ionicons name="chatbubble-outline" size={16} color="#5F6368" />
          <Text style={styles.actionText}>{commentsCount}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FCFBF8",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start"
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    marginRight: 12
  },
  avatarPlaceholder: {
    backgroundColor: "#DCE8E2",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarInitial: {
    color: "#1A1B1E",
    fontSize: 13,
    fontWeight: "700"
  },
  headerText: {
    flex: 1,
    minWidth: 0
  },
  author: {
    color: "#1A1B1E",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2
  },
  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center"
  },
  badge: {
    backgroundColor: "#EEF3F0",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: "65%"
  },
  badgeText: {
    color: "#2D463E",
    ...typography.caption
  },
  metaDate: {
    marginLeft: 8,
    color: "#6C7076",
    ...typography.caption
  },
  ratingMinimal: {
    marginTop: 10,
    color: "#2D463E",
    fontSize: 12,
    letterSpacing: 1.2
  },
  review: {
    marginTop: 10,
    color: "#1A1B1E",
    fontSize: 14,
    lineHeight: 24
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 10
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20
  },
  actionText: {
    marginLeft: 6,
    color: "#5F6368",
    ...typography.caption
  }
});
