import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { ItemCard } from "@/components/ItemCard";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";

interface QuickActionProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  bg: string;
  fg: string;
  onPress: () => void;
}

function QuickAction({ icon, label, bg, fg, onPress }: QuickActionProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickAction,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderRadius: colors.radius + 2,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={[styles.quickIcon, { backgroundColor: bg }]}>
        <Feather name={icon} size={22} color={fg} />
      </View>
      <Text style={[styles.quickLabel, { color: colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { items, announcements } = useData();

  const recent = useMemo(() => items.slice(0, 5), [items]);
  const latestAnnouncement = announcements[0];
  const isWeb = Platform.OS === "web";
  const headerTopPadding = isWeb ? 67 + 12 : insets.top + 12;
  const tabBarSpace = isWeb ? 84 : 90;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarSpace + 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero header */}
        <View
          style={[
            styles.hero,
            {
              backgroundColor: colors.primary,
              paddingTop: headerTopPadding,
              borderBottomLeftRadius: 28,
              borderBottomRightRadius: 28,
            },
          ]}
        >
          <View style={styles.heroRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroHi}>
                Welcome, {user?.name?.split(" ")[0] ?? "Friend"}
              </Text>
              <Text style={styles.heroSub}>What can we help you with today?</Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push("/(tabs)/more" as never)}
            style={[styles.profileCard, { backgroundColor: colors.background, borderRadius: colors.radius + 2 }]}
          >
            <Avatar name={user?.name ?? "?"} uri={user?.avatar} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 15 }}>
                {user?.name ?? "Guest"}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12 }}>
                {user?.role === "admin" ? "Administrator" : user?.email}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {/* Quick actions */}
        <View style={[styles.grid, { marginTop: 16 }]}>
          <QuickAction
            icon="plus-circle"
            label="Add Lost Item"
            bg={colors.lostSoft}
            fg={colors.lost}
            onPress={() => router.push({ pathname: "/items/add", params: { type: "lost" } } as never)}
          />
          <QuickAction
            icon="plus-square"
            label="Add Found Item"
            bg={colors.foundSoft}
            fg={colors.found}
            onPress={() => router.push({ pathname: "/items/add", params: { type: "found" } } as never)}
          />
          <QuickAction
            icon="edit-3"
            label="My Posts"
            bg={colors.warningSoft}
            fg={colors.warning}
            onPress={() => router.push("/my-posts" as never)}
          />
          <QuickAction
            icon="alert-triangle"
            label="Submit Report"
            bg="#f3eafc"
            fg="#8b5cf6"
            onPress={() => router.push("/reports/new" as never)}
          />
        </View>

        {/* Latest announcement */}
        {latestAnnouncement ? (
          <Pressable
            onPress={() => router.push(`/announcements/${latestAnnouncement.id}` as never)}
            style={({ pressed }) => [
              styles.announce,
              {
                backgroundColor: colors.primarySoft,
                borderRadius: colors.radius + 2,
                opacity: pressed ? 0.92 : 1,
              },
            ]}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="bell" size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 12, letterSpacing: 0.4 }}>
                ANNOUNCEMENT
              </Text>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 14 }} numberOfLines={1}>
                {latestAnnouncement.title}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.primary} />
          </Pressable>
        ) : null}

        {/* Recent items */}
        <View style={[styles.section, { marginTop: 12 }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Lost & Found Items</Text>
          <Pressable onPress={() => router.push("/(tabs)/lost" as never)}>
            <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>View All</Text>
          </Pressable>
        </View>

        {recent.length === 0 ? (
          <View
            style={[
              styles.emptyHint,
              { backgroundColor: colors.card, borderRadius: colors.radius + 2 },
            ]}
          >
            <Image
              source={require("@/assets/images/welcome-illustration.png")}
              style={{ width: 120, height: 120 }}
              contentFit="contain"
            />
            <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 16 }}>
              Nothing here yet
            </Text>
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              Be the first to post a lost or found item from your campus.
            </Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 16, gap: 10 }}>
            {recent.map((it) => (
              <ItemCard key={it.id} item={it} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 22,
    paddingBottom: 60,
  },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroHi: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 24 },
  heroSub: { color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular", fontSize: 14, marginTop: 4 },
  profileCard: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    marginBottom: -42,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
    paddingTop: 38,
  },
  quickAction: {
    flexBasis: "47%",
    flexGrow: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    gap: 12,
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: { fontFamily: "Inter_700Bold", fontSize: 14 },
  announce: {
    marginTop: 18,
    marginHorizontal: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  emptyHint: {
    marginHorizontal: 16,
    paddingVertical: 24,
    alignItems: "center",
    gap: 6,
  },
});
