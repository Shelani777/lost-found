import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { ItemCard } from "@/components/ItemCard";
import { useColors } from "@/hooks/useColors";
import { useData } from "@/lib/data-context";
import { ItemType } from "@/lib/storage";

export function ItemsTab({ type }: { type: ItemType }) {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { categories, filterItems } = useData();
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");

  const items = useMemo(
    () => filterItems({ type, categoryId, query }),
    [filterItems, type, categoryId, query],
  );

  const isWeb = Platform.OS === "web";
  const headerTopPadding = isWeb ? 67 + 12 : insets.top + 12;
  const tabBarSpace = isWeb ? 84 : 90;

  const accentBg = type === "lost" ? colors.lostSoft : colors.foundSoft;
  const accentFg = type === "lost" ? colors.lost : colors.found;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={[
          styles.header,
          { paddingTop: headerTopPadding, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_600SemiBold", fontSize: 12, letterSpacing: 0.4 }}>
              {type === "lost" ? "LOST ITEMS" : "FOUND ITEMS"}
            </Text>
            <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 24, marginTop: 2 }}>
              {type === "lost" ? "Help find them" : "Reunite them"}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push({ pathname: "/items/add", params: { type } } as never)}
            style={({ pressed }) => [
              styles.addBtn,
              { backgroundColor: accentBg, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="plus" size={20} color={accentFg} />
          </Pressable>
        </View>

        <View style={[styles.searchBox, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={`Search ${type} items...`}
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 18, gap: 8, paddingTop: 12 }}
        >
          <FilterChip
            label="All"
            active={categoryId === "all"}
            onPress={() => setCategoryId("all")}
          />
          {categories.map((c) => (
            <FilterChip
              key={c.id}
              label={c.name}
              active={categoryId === c.id}
              onPress={() => setCategoryId(c.id)}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: tabBarSpace + 16, gap: 10 }}
        renderItem={({ item }) => <ItemCard item={item} />}
        scrollEnabled={items.length > 0}
        ListEmptyComponent={
          <EmptyState
            icon={type === "lost" ? "search" : "check-circle"}
            title={query || categoryId !== "all" ? "No items match" : `No ${type} items yet`}
            description={
              query || categoryId !== "all"
                ? "Try adjusting your search or filter."
                : `Be the first to post a ${type} item.`
            }
          />
        }
      />
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 999,
          backgroundColor: active ? colors.primary : colors.muted,
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
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    gap: 12,
    marginBottom: 14,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    marginHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
});
