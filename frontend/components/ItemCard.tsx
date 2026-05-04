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
import { useTheme } from "@/lib/theme-context";

interface Props {
  item: Item;
  compact?: boolean;
}

export function ItemCard({ item, compact = false }: Props) {
  const colors = useColors();
  const { isDark } = useTheme();
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

  const neumorphicStyle = {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    backdropFilter: "blur(20px)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  };

  if (compact) {
    return (
      <Pressable
        onPress={() => router.push(`/items/${item.id}` as never)}
        style={({ pressed }) => [
          styles.cardCompact,
          neumorphicStyle,
          {
            borderRadius: 20,
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <View
          style={[
            styles.thumb,
            {
              backgroundColor: item.type === "lost" ? colors.lostSoft : colors.foundSoft,
              borderRadius: 14,
              width: 64,
              height: 64,
            },
          ]}
        >
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={{ width: "100%", height: "100%", borderRadius: 14 }}
              contentFit="cover"
            />
          ) : (
            <Feather
              name={item.type === "lost" ? "search" : "check-circle"}
              size={26}
              color={item.type === "lost" ? colors.lost : colors.found}
            />
          )}
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={styles.row}>
            <TypeBadge type={item.type} />
            <Text
              numberOfLines={1}
              style={{ flex: 1, color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 15 }}
            >
              {item.title}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Feather name="calendar" size={12} color="rgba(255,255,255,0.5)" />
            <Text style={[styles.meta, { color: "rgba(255,255,255,0.5)" }]}>{formatRelative(item.createdAt)}</Text>
            <StatusBadge status={item.status} />
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.card,
        neumorphicStyle,
        {
          borderRadius: 24,
        },
      ]}
    >
      {/* Post header */}
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          {author?.avatar ? (
            <Image
              source={{ uri: author.avatar }}
              style={{ width: 46, height: 46, borderRadius: 23 }}
              contentFit="cover"
            />
          ) : (
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                backgroundColor: "rgba(255,255,255,0.1)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 18 }}>
                {(author?.name ?? "?")[0].toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 }}>
            {author?.name || "Unknown User"}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 }}>
            <Feather name="clock" size={11} color="rgba(255,255,255,0.5)" />
            <Text style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Inter_500Medium", fontSize: 12 }}>
              {formatRelative(item.createdAt)}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.3)" }}>·</Text>
            <Feather name={publicityIcon} size={11} color="rgba(255,255,255,0.5)" />
          </View>
        </View>
        <StatusBadge status={item.status} />
      </View>

      {/* Post body */}
      <Pressable onPress={() => router.push(`/items/${item.id}` as never)} style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <TypeBadge type={item.type} />
          {category && (
            <View style={[styles.categoryChip, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
              <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 12 }}>
                {category.name}
              </Text>
            </View>
          )}
        </View>
        <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 18, marginBottom: 8 }}>
          {item.title}
        </Text>
        <Text numberOfLines={2} style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22 }}>
          {item.description}
        </Text>
      </Pressable>

      {/* Post image */}
      {item.image ? (
        <Pressable onPress={() => router.push(`/items/${item.id}` as never)} style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <Image
            source={{ uri: item.image }}
            style={{ width: "100%", height: 200, borderRadius: 16 }}
            contentFit="cover"
          />
        </Pressable>
      ) : null}

      {/* Action footer */}
      <View style={[styles.footer, { borderTopColor: "rgba(255,255,255,0.1)" }]}>
        <Pressable
          onPress={handleLike}
          style={({ pressed }) => [styles.actionBtn, { backgroundColor: "rgba(255,255,255,0.05)", opacity: pressed ? 0.7 : 1 }]}
        >
          <View style={[styles.actionIconWrap]}>
            <Feather name="heart" size={20} color={isLiked ? colors.destructive : "rgba(255,255,255,0.5)"} />
          </View>
          <Text style={{ color: isLiked ? colors.destructive : "rgba(255,255,255,0.5)", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
            {item.likes?.length || 0}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push(`/items/${item.id}` as never)}
          style={({ pressed }) => [styles.actionBtn, { backgroundColor: "rgba(255,255,255,0.05)", opacity: pressed ? 0.7 : 1 }]}
        >
          <View style={styles.actionIconWrap}>
            <Feather name="message-square" size={20} color="rgba(255,255,255,0.5)" />
          </View>
          <Text style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
            {item.comments?.length || 0}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [styles.actionBtn, { backgroundColor: "rgba(255,255,255,0.05)", opacity: pressed ? 0.7 : 1 }]}
        >
          <View style={styles.actionIconWrap}>
            <Feather name="share-2" size={20} color="rgba(255,255,255,0.5)" />
          </View>
          <Text style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardCompact: {
    flexDirection: "row",
    padding: 16,
    gap: 16,
    alignItems: "center",
  },
  card: {
    marginBottom: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    padding: 20,
    alignItems: "center",
  },
  avatarWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
  thumb: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  meta: { fontSize: 13, fontFamily: "Inter_500Medium" },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  footer: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
