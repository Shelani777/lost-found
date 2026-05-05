import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GenericBadge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { ReportStatus, formatRelative } from "@/lib/storage";

const STATUS_OPTIONS: { value: ReportStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "resolved", label: "Resolved" },
];

export default function ReportDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const { reports, getItem, setReportStatus, deleteReport, deleteItem, users } = useData();

  const report = reports.find((r) => r.id === id);
  const item = report ? getItem(report.itemId) : undefined;
  const reporter = report ? users.find((u) => u.id === report.userId) : undefined;
  const isOwner = report?.userId === user?.id;
  const canDelete = isAdmin || isOwner;

  if (!report || (!isAdmin && report.userId !== user?.id)) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Stack.Screen options={{ title: "Report" }} />
        <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>Report not found</Text>
      </View>
    );
  }

  const onDelete = () => {
    const doIt = async () => {
      await deleteReport(report.id);
      router.back();
    };
    if (Platform.OS === "web") return doIt();
    Alert.alert("Delete report?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: doIt },
    ]);
  };

  const onRemovePost = () => {
    if (!item) return;
    const doIt = async () => {
      await setReportStatus(report.id, "resolved");
      await deleteItem(item.id);
    };
    if (Platform.OS === "web") return doIt();
    Alert.alert("Remove this post?", "The post will be deleted and this report resolved.", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: doIt },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: "Report",
          headerRight: canDelete
            ? () => (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                  {isOwner ? (
                    <Pressable hitSlop={8} onPress={() => router.push(`/reports/new?id=${report.id}` as never)}>
                      <Feather name="edit-2" size={20} color={colors.primary} />
                    </Pressable>
                  ) : null}
                  <Pressable hitSlop={8} onPress={onDelete}>
                    <Feather name="trash-2" size={20} color={colors.destructive} />
                  </Pressable>
                </View>
              )
            : undefined,
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 18, gap: 14, paddingBottom: insets.bottom + 40 }}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ReportStatusBadge status={report.status} />
            <Text style={{ marginLeft: "auto", color: colors.mutedForeground, fontSize: 12 }}>
              {formatRelative(report.createdAt)}
            </Text>
          </View>
          <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 20, marginTop: 12 }}>
            {report.reason}
          </Text>
          <Text style={{ color: colors.foreground, fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22, marginTop: 8 }}>
            {report.description}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Reported Post</Text>
          {item ? (
            <Pressable onPress={() => router.push(`/items/${item.id}` as never)} style={{ marginTop: 10 }}>
              <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 16 }}>{item.title}</Text>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 4 }}>
                {item.type === "lost" ? "Lost" : "Found"} at {item.location}
              </Text>
            </Pressable>
          ) : (
            <Text style={{ color: colors.mutedForeground, marginTop: 10 }}>(post no longer exists)</Text>
          )}
        </View>

        {isAdmin ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Reporter</Text>
            <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 15, marginTop: 10 }}>
              {reporter?.name || "Unknown user"}
            </Text>
            {reporter ? (
              <Text style={{ color: colors.mutedForeground, fontSize: 13, marginTop: 4 }}>
                {reporter.identityId} - {reporter.email}
              </Text>
            ) : null}
          </View>
        ) : null}

        {report.screenshot ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Screenshot Evidence</Text>
            <Image
              source={{ uri: report.screenshot }}
              style={{ width: "100%", aspectRatio: 16 / 10, borderRadius: colors.radius - 2, marginTop: 10 }}
              contentFit="cover"
            />
          </View>
        ) : null}

        {isAdmin ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Update Status</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              {STATUS_OPTIONS.map((option) => {
                const active = option.value === report.status;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setReportStatus(report.id, option.value)}
                    style={({ pressed }) => [
                      styles.statusButton,
                      {
                        backgroundColor: active ? colors.primary : colors.muted,
                        borderRadius: colors.radius - 2,
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
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              {item ? (
                <View style={{ flex: 1 }}>
                  <Button
                    title="Remove Post"
                    size="md"
                    variant="destructive"
                    iconLeft={<Feather name="trash-2" size={16} color="#fff" />}
                    onPress={onRemovePost}
                  />
                </View>
              ) : null}
              <View style={{ flex: 1 }}>
                <Button
                  title="Delete Report"
                  size="md"
                  variant="ghost"
                  iconLeft={<Feather name="x" size={16} color={colors.destructive} />}
                  onPress={onDelete}
                />
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const colors = useColors();
  return (
    <GenericBadge
      label={status}
      bg={
        status === "resolved"
          ? colors.successSoft
          : status === "reviewed"
            ? colors.primarySoft
            : colors.warningSoft
      }
      color={
        status === "resolved"
          ? colors.success
          : status === "reviewed"
            ? colors.primary
            : colors.warning
      }
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 14,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  statusButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
});
