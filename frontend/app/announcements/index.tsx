import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { formatRelative } from "@/lib/storage";

export default function AnnouncementsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAuth();
  const { announcements } = useData();

  const sorted = [...announcements].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: "Announcements",
          headerRight: isAdmin
            ? () => (
                <Pressable hitSlop={8} onPress={() => router.push("/announcements/new" as never)}>
                  <Feather name="plus" size={22} color={colors.primary} />
                </Pressable>
              )
            : undefined,
        }}
      />
      <FlatList
        data={sorted}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 30 }}
        renderItem={({ item: a }) => (
          <Pressable
            onPress={() => router.push(`/announcements/${a.id}` as never)}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
                opacity: pressed ? 0.92 : 1,
              },
            ]}
          >
            {a.image ? (
              <Image
                source={{ uri: a.image }}
                style={{ width: "100%", aspectRatio: 16 / 8 }}
                contentFit="cover"
              />
            ) : (
              <View
                style={{
                  width: "100%",
                  aspectRatio: 16 / 8,
                  backgroundColor: colors.primarySoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="bell" size={36} color={colors.primary} />
              </View>
            )}
            <View style={{ padding: 14 }}>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 12 }}>
                {formatRelative(a.createdAt)}
              </Text>
              <Text
                style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 16, marginTop: 4 }}
                numberOfLines={2}
              >
                {a.title}
              </Text>
              <Text
                style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 4 }}
                numberOfLines={2}
              >
                {a.description}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="bell"
            title="No announcements"
            description={
              isAdmin
                ? "Tap + to create one for your community."
                : "Important updates from administrators will appear here."
            }
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, overflow: "hidden" },
});
