import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { StatusBadge, TypeBadge } from "@/components/Badge";
import { useColors } from "@/hooks/useColors";
import { useData } from "@/lib/data-context";
import { Item, formatRelative } from "@/lib/storage";

interface Props {
  item: Item;
  compact?: boolean;
}

export function ItemCard({ item, compact = false }: Props) {
  const colors = useColors();
  const router = useRouter();
  const { getCategory } = useData();
  const category = getCategory(item.categoryId);

  return (
    <Pressable
      onPress={() => router.push(`/items/${item.id}` as never)}
      style={({ pressed }) => [
        styles.card,
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
            width: compact ? 56 : 76,
            height: compact ? 56 : 76,
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
            size={compact ? 22 : 28}
            color={item.type === "lost" ? colors.lost : colors.found}
          />
        )}
      </View>
      <View style={{ flex: 1, gap: 6 }}>
        <View style={styles.row}>
          <TypeBadge type={item.type} />
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              color: colors.foreground,
              fontFamily: "Inter_700Bold",
              fontSize: 15,
            }}
          >
            {item.title}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Feather name="calendar" size={12} color={colors.mutedForeground} />
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {formatRelative(item.createdAt)}
          </Text>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>·</Text>
          <Feather name="map-pin" size={12} color={colors.mutedForeground} />
          <Text
            style={[styles.meta, { color: colors.mutedForeground, flex: 1 }]}
            numberOfLines={1}
          >
            {item.location}
          </Text>
        </View>
        <View style={styles.metaRow}>
          {category ? (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                backgroundColor: colors.muted,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 11,
                }}
              >
                {category.name}
              </Text>
            </View>
          ) : null}
          <StatusBadge status={item.status} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 14,
    gap: 14,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  thumb: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  meta: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
