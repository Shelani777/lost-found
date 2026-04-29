import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { ItemCard } from "@/components/ItemCard";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { ItemStatus } from "@/lib/storage";

const FILTERS: { key: ItemStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "claimed", label: "Claimed" },
  { key: "closed", label: "Closed" },
];

export default function MyPostsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { items } = useData();
  const [status, setStatus] = useState<ItemStatus | "all">("all");

  const myItems = useMemo(() => {
    if (!user) return [];
    return items
      .filter((i) => i.userId === user.id)
      .filter((i) => status === "all" || i.status === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [items, user, status]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: "My Posts",
          headerRight: () => (
            <Pressable hitSlop={8} onPress={() => router.push("/items/add" as never)}>
              <Feather name="plus" size={22} color={colors.primary} />
            </Pressable>
          ),
        }}
      />
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = f.key === status;
          return (
            <Pressable
              key={f.key}
              onPress={() => setStatus(f.key)}
              style={({ pressed }) => [
                {
                  flex: 1,
                  paddingVertical: 9,
                  alignItems: "center",
                  backgroundColor: active ? colors.primary : colors.muted,
                  borderRadius: 999,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: active ? colors.primaryForeground : colors.foreground,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 13,
                }}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <FlatList
        data={myItems}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 30, gap: 10 }}
        renderItem={({ item }) => <ItemCard item={item} />}
        ListEmptyComponent={
          <EmptyState
            icon="inbox"
            title="No posts yet"
            description="When you report a lost item or post a found item, it will show up here."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
});
