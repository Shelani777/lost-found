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
    <View style={{ flex: 1, backgroundColor: "#0B041C" }}>
      {/* Background Ambient Gradients */}
      <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
        <View style={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: colors.primary, opacity: 0.15, filter: 'blur(50px)' }} />
      </View>

      <Stack.Screen
        options={{
          title: "My Posts",
          headerTitleStyle: { color: "#fff", fontFamily: "Inter_700Bold" },
          headerStyle: { backgroundColor: "#0B041C" },
          headerTintColor: "#fff",
          headerRight: () => (
            <Pressable hitSlop={8} onPress={() => router.push("/items/add" as never)}>
              <Feather name="plus" size={24} color={colors.primary} />
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
                  paddingVertical: 10,
                  alignItems: "center",
                  backgroundColor: active ? colors.primary : "rgba(255,255,255,0.06)",
                  borderColor: active ? colors.primary : "rgba(255,255,255,0.1)",
                  borderWidth: 1,
                  borderRadius: 14,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: active ? "#fff" : "rgba(255,255,255,0.6)",
                  fontFamily: active ? "Inter_700Bold" : "Inter_500Medium",
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
        contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 30, gap: 16 }}
        renderItem={({ item }) => <ItemCard item={item} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="edit-3"
            title="No posts yet"
            description="You haven't posted any lost or found items."
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
