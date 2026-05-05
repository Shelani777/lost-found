import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GenericBadge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { ReportStatus, formatRelative } from "@/lib/storage";

const FILTERS: { value: ReportStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "resolved", label: "Resolved" },
];

export default function AdminReportsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAuth();
  const { reports, getItem, setReportStatus, deleteReport, deleteItem } = useData();
  const [status, setStatus] = useState<ReportStatus | "all">("all");

  const visible = useMemo(
    () =>
      reports
        .filter((r) => status === "all" || r.status === status)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [reports, status],
  );

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Stack.Screen options={{ title: "Reports" }} />
        <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold" }}>Admins only</Text>
      </View>
    );
  }

  const removePost = (itemId: string, reportId: string) => {
    const doIt = async () => {
      await setReportStatus(reportId, "resolved");
      await deleteItem(itemId);
    };
    if (Platform.OS === "web") return doIt();
    Alert.alert("Remove this post?", "The post will be deleted and the report resolved.", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: doIt },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: "Reports" }} />
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = f.value === status;
          return (
            <Pressable
              key={f.value}
              onPress={() => setStatus(f.value)}
              style={({ pressed }) => [
                {
                  flex: 1,
                  paddingVertical: 8,
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
                  fontSize: 12,
                }}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <FlatList
        data={visible}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 10, paddingBottom: insets.bottom + 30 }}
        renderItem={({ item: report }) => {
          const it = getItem(report.itemId);
          return (
            <Pressable
              onPress={() => router.push(`/reports/${report.id}` as never)}
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
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
              <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 15, marginTop: 8 }}>
                {report.reason}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 4 }}>
                {report.description}
              </Text>
              {it ? (
                <Pressable onPress={() => router.push(`/items/${it.id}` as never)} style={{ marginTop: 8 }}>
                  <Text
                    style={{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 13 }}
                    numberOfLines={1}
                  >
                    View post: {it.title}
                  </Text>
                </Pressable>
              ) : (
                <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 8 }}>
                  (post no longer exists)
                </Text>
              )}

              <View style={{ flexDirection: "row", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                {report.status !== "reviewed" ? (
                  <View style={{ flex: 1, minWidth: 130 }}>
                    <Button
                      title="Mark Reviewed"
                      size="sm"
                      variant="ghost"
                      iconLeft={<Feather name="eye" size={14} color={colors.primary} />}
                      onPress={() => setReportStatus(report.id, "reviewed")}
                    />
                  </View>
                ) : null}
                {report.status !== "resolved" ? (
                  <View style={{ flex: 1, minWidth: 130 }}>
                    <Button
                      title="Resolve"
                      size="sm"
                      iconLeft={<Feather name="check" size={14} color="#fff" />}
                      onPress={() => setReportStatus(report.id, "resolved")}
                    />
                  </View>
                ) : null}
                {it ? (
                  <View style={{ flex: 1, minWidth: 130 }}>
                    <Button
                      title="Remove Post"
                      size="sm"
                      variant="destructive"
                      iconLeft={<Feather name="trash-2" size={14} color="#fff" />}
                      onPress={() => removePost(it.id, report.id)}
                    />
                  </View>
                ) : null}
                <View style={{ flex: 1, minWidth: 130 }}>
                  <Button
                    title="Dismiss"
                    size="sm"
                    variant="ghost"
                    iconLeft={<Feather name="x" size={14} color={colors.destructive} />}
                    onPress={() => deleteReport(report.id)}
                  />
                </View>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <EmptyState icon="flag" title="No reports" description="The community is doing great!" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  card: {
    padding: 14,
    borderWidth: 1,
  },
});
