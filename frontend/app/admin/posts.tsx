import { Stack } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { ItemCard } from "@/components/ItemCard";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { ItemType } from "@/lib/storage";

export default function AdminPostsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAuth();
  const { items } = useData();
  const [type, setType] = useState<ItemType | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((i) => type === "all" || i.type === type)
      .filter(
        (i) =>
          !q ||
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [items, type, query]);

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Stack.Screen options={{ title: "All Posts" }} />
        <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold" }}>Admins only</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: "All Posts" }} />
      <View style={{ padding: 16, gap: 10 }}>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: colors.input, borderColor: colors.border, borderRadius: colors.radius - 2 },
          ]}
        >
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search title, description, location..."
            placeholderTextColor={colors.mutedForeground}
            style={{
              flex: 1,
              color: colors.foreground,
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              paddingVertical: 0,
            }}
          />
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["all", "lost", "found"] as const).map((t) => {
            const active = t === type;
            return (
              <Pressable
                key={t}
                onPress={() => setType(t)}
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
                    textTransform: "capitalize",
                  }}
                >
                  {t}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 30, gap: 10 }}
        renderItem={({ item }) => <ItemCard item={item} />}
        ListEmptyComponent={
          <EmptyState icon="layers" title="No posts found" description="Try a different filter or search." />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 44,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
});
