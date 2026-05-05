import { Stack, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GenericBadge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { formatRelative } from "@/lib/storage";

export default function ReportsListScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAdmin } = useAuth();
  const { reports, getItem } = useData();

  const visible = useMemo(() => {
    if (!user) return [];
    const list = isAdmin ? reports : reports.filter((r) => r.userId === user.id);
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [reports, user, isAdmin]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: isAdmin ? "All Reports" : "My Reports" }} />
      <FlatList
        data={visible}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: insets.bottom + 30 }}
        renderItem={({ item: report }) => {
          const it = getItem(report.itemId);
          return (
            <Pressable
              onPress={() => router.push(`/reports/${report.id}` as never)}
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
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <GenericBadge
                  label={report.status}
                  bg={
                    report.status === "resolved"
                      ? colors.successSoft
                      : report.status === "reviewed"
                        ? colors.primarySoft
                        : colors.warningSoft
                  }
                  color={
                    report.status === "resolved"
                      ? colors.success
                      : report.status === "reviewed"
                        ? colors.primary
                        : colors.warning
                  }
                />
                <Text style={{ marginLeft: "auto", color: colors.mutedForeground, fontSize: 12 }}>
                  {formatRelative(report.createdAt)}
                </Text>
              </View>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 15 }} numberOfLines={1}>
                {report.reason}
              </Text>
              <Text
                style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 4 }}
                numberOfLines={2}
              >
                {report.description || "No additional details."}
              </Text>
              {it ? (
                <Text
                  style={{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 12, marginTop: 6 }}
                  numberOfLines={1}
                >
                  on: {it.title}
                </Text>
              ) : (
                <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 6 }}>(item removed)</Text>
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="flag"
            title="No reports"
            description="Reports submitted will appear here for tracking."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderWidth: 1 },
});
