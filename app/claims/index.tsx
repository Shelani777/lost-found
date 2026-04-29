import { Stack, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GenericBadge, TypeBadge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { ClaimRequest, formatRelative } from "@/lib/storage";

export default function ClaimsListScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAdmin } = useAuth();
  const { claims, items, getItem } = useData();

  const visible = useMemo<ClaimRequest[]>(() => {
    if (!user) return [];
    if (isAdmin) return [...claims].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return claims
      .filter((c) => {
        if (c.userId === user.id) return true;
        const it = getItem(c.itemId);
        return it?.userId === user.id;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [claims, user, isAdmin, items, getItem]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: "Claim Requests" }} />
      <FlatList
        data={visible}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: insets.bottom + 30 }}
        renderItem={({ item: claim }) => {
          const it = getItem(claim.itemId);
          return (
            <Pressable
              onPress={() => router.push(`/claims/${claim.id}` as never)}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                  opacity: pressed ? 0.93 : 1,
                },
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                {it ? <TypeBadge type={it.type} /> : null}
                <GenericBadge
                  label={claim.status}
                  bg={
                    claim.status === "approved"
                      ? colors.successSoft
                      : claim.status === "rejected"
                        ? colors.destructiveSoft
                        : colors.warningSoft
                  }
                  color={
                    claim.status === "approved"
                      ? colors.success
                      : claim.status === "rejected"
                        ? colors.destructive
                        : colors.warning
                  }
                />
                <Text style={{ marginLeft: "auto", color: colors.mutedForeground, fontSize: 12 }}>
                  {formatRelative(claim.createdAt)}
                </Text>
              </View>
              <Text
                style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 15 }}
                numberOfLines={1}
              >
                {it?.title ?? "Item removed"}
              </Text>
              <Text
                style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 4 }}
                numberOfLines={2}
              >
                {claim.message}
              </Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="message-square"
            title="No claim requests"
            description="Send a claim from any lost or found item page to start a conversation."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderWidth: 1 },
});
