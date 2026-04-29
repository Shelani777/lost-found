import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";

interface StatProps {
  label: string;
  value: number;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  bg: string;
}

function StatCard({ label, value, icon, color, bg }: StatProps) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.stat,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 24 }}>{value}</Text>
      <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 12, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

interface LinkRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  description?: string;
  onPress: () => void;
  iconBg?: string;
  iconFg?: string;
}

function LinkRow({ icon, label, description, onPress, iconBg, iconFg }: LinkRowProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.linkRow,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          backgroundColor: iconBg ?? colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather name={icon} size={18} color={iconFg ?? colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 15 }}>{label}</Text>
        {description ? (
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }}>
            {description}
          </Text>
        ) : null}
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

export default function AdminDashboard() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAuth();
  const { items, claims, reports, announcements } = useData();

  const counts = useMemo(
    () => ({
      lost: items.filter((i) => i.type === "lost").length,
      found: items.filter((i) => i.type === "found").length,
      pendingClaims: claims.filter((c) => c.status === "pending").length,
      pendingReports: reports.filter((r) => r.status === "pending").length,
    }),
    [items, claims, reports],
  );

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, padding: 24 }}>
        <Stack.Screen options={{ title: "Admin" }} />
        <Feather name="lock" size={36} color={colors.mutedForeground} />
        <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 18, marginTop: 12 }}>
          Admins only
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: "Admin Dashboard" }} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: insets.bottom + 30 }}>
        <View style={styles.statsGrid}>
          <StatCard label="Lost posts" value={counts.lost} icon="search" color={colors.lost} bg={colors.lostSoft} />
          <StatCard label="Found posts" value={counts.found} icon="check-circle" color={colors.found} bg={colors.foundSoft} />
          <StatCard
            label="Pending claims"
            value={counts.pendingClaims}
            icon="message-square"
            color={colors.warning}
            bg={colors.warningSoft}
          />
          <StatCard
            label="Open reports"
            value={counts.pendingReports}
            icon="flag"
            color={colors.destructive}
            bg={colors.destructiveSoft}
          />
        </View>

        <View>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>MANAGE</Text>
          <View style={{ gap: 10, marginTop: 8 }}>
            <LinkRow
              icon="layers"
              label="All Posts"
              description={`${items.length} item${items.length === 1 ? "" : "s"}`}
              onPress={() => router.push("/admin/posts" as never)}
            />
            <LinkRow
              icon="message-square"
              label="Claim Requests"
              description={`${claims.length} total`}
              onPress={() => router.push("/claims" as never)}
              iconBg={colors.foundSoft}
              iconFg={colors.found}
            />
            <LinkRow
              icon="alert-octagon"
              label="Reports"
              description={`${reports.length} total`}
              onPress={() => router.push("/admin/reports" as never)}
              iconBg={colors.destructiveSoft}
              iconFg={colors.destructive}
            />
            <LinkRow
              icon="users"
              label="Users"
              onPress={() => router.push("/admin/users" as never)}
              iconBg="#f3eafc"
              iconFg="#8b5cf6"
            />
            <LinkRow
              icon="grid"
              label="Categories"
              onPress={() => router.push("/categories" as never)}
            />
            <LinkRow
              icon="bell"
              label="Announcements"
              description={`${announcements.length} active`}
              onPress={() => router.push("/announcements" as never)}
              iconBg={colors.warningSoft}
              iconFg={colors.warning}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  stat: {
    width: "47%",
    flexGrow: 1,
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderWidth: 1,
  },
  sectionLabel: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 0.6 },
});
