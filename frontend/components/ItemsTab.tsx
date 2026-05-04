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
    <View style={{ flex: 1, backgroundColor: "#0B041C" }}>
      {/* Background Ambient Gradients */}
      <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
        <View style={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: accentFg, opacity: 0.15, filter: 'blur(50px)' }} />
        <View style={{ position: 'absolute', bottom: 100, right: -150, width: 400, height: 400, borderRadius: 200, backgroundColor: colors.primary, opacity: 0.1, filter: 'blur(60px)' }} />
      </View>

      <View
        style={[
          styles.header,
          { paddingTop: headerTopPadding },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Inter_600SemiBold", fontSize: 12, letterSpacing: 0.4 }}>
              {type === "lost" ? "LOST ITEMS" : "FOUND ITEMS"}
            </Text>
            <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 26, marginTop: 2 }}>
              {type === "lost" ? "Help find them" : "Reunite them"}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push({ pathname: "/items/add", params: { type } } as never)}
            style={({ pressed }) => [
              styles.addBtn,
              { backgroundColor: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.15)", borderWidth: 1, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="plus" size={24} color={accentFg} />
          </Pressable>
        </View>

        <View style={[styles.searchBox, { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }]}>
          <Feather name="search" size={18} color="rgba(255,255,255,0.4)" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={`Search ${type} items...`}
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={{
              flex: 1,
              color: "#fff",
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              paddingVertical: 0,
            }}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 18, gap: 10, paddingTop: 16 }}
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
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: tabBarSpace + 16, gap: 16 }}
        renderItem={({ item }) => <ItemCard item={item} />}
        scrollEnabled={items.length > 0}
        showsVerticalScrollIndicator={false}
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
          paddingHorizontal: 18,
          paddingVertical: 10,
          borderRadius: 16,
          backgroundColor: active ? colors.primary : "rgba(255,255,255,0.06)",
          borderColor: active ? colors.primary : "rgba(255,255,255,0.1)",
          borderWidth: 1,
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
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    gap: 12,
    marginBottom: 20,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(10px)",
  },
  searchBox: {
    marginHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
});
