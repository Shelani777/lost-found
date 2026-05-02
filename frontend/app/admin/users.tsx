import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { GenericBadge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { STORAGE_KEYS, User, formatRelative, readJSON } from "@/lib/storage";

export default function AdminUsersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAuth();
  const { items, claims } = useData();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    let cancelled = false;
    readJSON<User[]>(STORAGE_KEYS.users, []).then((u) => {
      if (!cancelled) setUsers(u.sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Stack.Screen options={{ title: "Users" }} />
        <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold" }}>Admins only</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: "Users" }} />
      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: insets.bottom + 30 }}
        renderItem={({ item: u }) => {
          const posts = items.filter((i) => i.userId === u.id).length;
          const claimsCount = claims.filter((c) => c.userId === u.id).length;
          return (
            <View
              style={[
                styles.row,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
              ]}
            >
              <Avatar name={u.name} uri={u.avatar} size={44} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 15 }}>
                    {u.name}
                  </Text>
                  {u.role === "admin" ? (
                    <GenericBadge label="ADMIN" bg={colors.primary} color="#fff" />
                  ) : null}
                </View>
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }}>
                  {u.email}
                </Text>
                <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 12, marginTop: 4 }}>
                  {posts} post{posts === 1 ? "" : "s"} · {claimsCount} claim{claimsCount === 1 ? "" : "s"} · joined{" "}
                  {formatRelative(u.createdAt)}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<EmptyState icon="users" title="No users yet" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1,
  },
});
