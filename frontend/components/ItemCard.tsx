import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View, Share } from "react-native";

import { StatusBadge, TypeBadge } from "@/components/Badge";
import { useColors } from "@/hooks/useColors";
import { useData } from "@/lib/data-context";
import { useAuth } from "@/lib/auth-context";
import { Item, formatRelative } from "@/lib/storage";

interface Props {
  item: Item;
  compact?: boolean;
}

export function ItemCard({ item, compact = false }: Props) {
  const colors = useColors();
  const router = useRouter();
  const { getCategory, users, likeItem } = useData();
  const { user } = useAuth();
  
  const category = getCategory(item.categoryId);
  const author = users?.find(u => u.id === item.userId);
  const isLiked = user && item.likes ? item.likes.includes(user.id) : false;

  const handleLike = async () => {
    if (!user) return;
    await likeItem(item.id);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${item.type} item: ${item.title} on Lost & Found!`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const publicityIcon = item.publicity === "students_only" ? "users" : "globe";
  const publicityLabel = item.publicity === "students_only" ? "Students" : "Public";

  if (compact) {
    return (
      <Pressable
        onPress={() => router.push(`/items/${item.id}` as never)}
        style={({ pressed }) => [
          styles.cardCompact,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderRadius: colors.radius,
            opacity: pressed ? 0.92 : 1,
            transform: [{ scale: pressed ? 0.995 : 1 }],
          },
        ]}
      >
        <View
          style={[
            styles.thumb,
            {
              backgroundColor: item.type === "lost" ? colors.lostSoft : colors.foundSoft,
              borderRadius: colors.radius - 4,
              width: 60,
              height: 60,
            },
          ]}
        >
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={{ width: "100%", height: "100%", borderRadius: colors.radius - 4 }}
              contentFit="cover"
            />
          ) : (
            <Feather
              name={item.type === "lost" ? "search" : "check-circle"}
              size={24}
              color={item.type === "lost" ? colors.lost : colors.found}
            />
          )}
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={styles.row}>
            <TypeBadge type={item.type} />
            <Text
              numberOfLines={1}
              style={{ flex: 1, color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 14 }}
            >
              {item.title}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Feather name="calendar" size={12} color={colors.mutedForeground} />
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>{formatRelative(item.createdAt)}</Text>
            <StatusBadge status={item.status} />
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius }]}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          {author?.avatar ? (
            <Image source={{ uri: author.avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} contentFit="cover" />
          ) : (
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" }}>
              <Feather name="user" size={20} color={colors.mutedForeground} />
            </View>
          )}
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 15 }}>
            {author?.name || "Unknown User"}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12 }}>
              {formatRelative(item.createdAt)}
            </Text>
            <Text style={{ color: colors.mutedForeground }}>·</Text>
            <Feather name={publicityIcon} size={12} color={colors.mutedForeground} />
          </View>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <Pressable onPress={() => router.push(`/items/${item.id}` as never)} style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <TypeBadge type={item.type} />
          {category && (
            <Text style={{ color: colors.primary, fontFamily: "Inter_500Medium", fontSize: 13 }}>
              {category.name}
            </Text>
          )}
        </View>
        <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 16, marginBottom: 4 }}>
          {item.title}
        </Text>
        <Text numberOfLines={2} style={{ color: colors.foreground, fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20 }}>
          {item.description}
        </Text>
      </Pressable>

      {item.image ? (
        <Pressable onPress={() => router.push(`/items/${item.id}` as never)}>
          <Image source={{ uri: item.image }} style={{ width: "100%", height: 250 }} contentFit="cover" />
        </Pressable>
      ) : null}

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Pressable onPress={handleLike} style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.7 : 1 }]}>
          <Feather name="heart" size={20} color={isLiked ? colors.destructive : colors.mutedForeground} />
          <Text style={{ color: isLiked ? colors.destructive : colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 13 }}>
            {item.likes?.length || 0}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push(`/items/${item.id}` as never)} style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.7 : 1 }]}>
          <Feather name="message-square" size={20} color={colors.mutedForeground} />
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 13 }}>
            {item.comments?.length || 0}
          </Text>
        </Pressable>

        <Pressable onPress={handleShare} style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.7 : 1 }]}>
          <Feather name="share-2" size={20} color={colors.mutedForeground} />
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 13 }}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardCompact: {
    flexDirection: "row",
    padding: 12,
    gap: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  card: {
    marginBottom: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    padding: 14,
    alignItems: "center",
  },
  avatar: {
    justifyContent: "center",
    alignItems: "center",
  },
  thumb: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  meta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  footer: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    justifyContent: "space-around",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 6,
  },
});
