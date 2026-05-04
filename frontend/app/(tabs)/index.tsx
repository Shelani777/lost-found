import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { Avatar } from "@/components/Avatar";
import { ItemCard } from "@/components/ItemCard";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { useTheme } from "@/lib/theme-context";

interface QuickActionProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  bg: string;
  fg: string;
  onPress: () => void;
}

function QuickAction({ icon, label, bg, fg, onPress }: QuickActionProps) {
  const colors = useColors();
  const { isDark } = useTheme();
  
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickAction,
        {
          backgroundColor: isDark ? "rgba(255,255,255,0.06)" : colors.card,
          borderColor: isDark ? "rgba(255,255,255,0.12)" : "#ffffff", 
          borderWidth: 1,
          borderRadius: 24,
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
          shadowColor: isDark ? "#000" : "#a3b1c6", 
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.5 : 0.4,
          shadowRadius: 15,
          elevation: 5,
        },
      ]}
    >
      <View style={[styles.quickIcon, { backgroundColor: bg, borderRadius: 16 }]}>
        <Feather name={icon} size={24} color={fg} />
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
  const { width } = useWindowDimensions();

  const recent = useMemo(() => items.slice(0, 5), [items]);
  const latestAnnouncement = announcements[0];
  const isWeb = Platform.OS === "web";
  const headerTopPadding = isWeb ? 67 + 20 : insets.top + 20;
  const tabBarSpace = isWeb ? 84 : 90;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Background Ambient Gradients */}
      <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
        <View style={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: colors.primary, opacity: 0.15, filter: 'blur(50px)' }} />
        <View style={{ position: 'absolute', top: 200, right: -150, width: 400, height: 400, borderRadius: 200, backgroundColor: colors.tint, opacity: 0.1, filter: 'blur(60px)' }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarSpace + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Row */}
        <View style={[styles.heroRow, { paddingTop: headerTopPadding, paddingHorizontal: 24, marginBottom: 20 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.heroHi, { color: colors.foreground }]}>
              Welcome, {user?.name?.split(" ")[0] ?? "Friend"} 👋
            </Text>
            <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
              What can we help you with today?
            </Text>
          </View>
          <Pressable onPress={() => router.push("/(tabs)/more" as never)}>
             <Avatar name={user?.name ?? "?"} uri={user?.avatar} size={50} />
          </Pressable>
        </View>

        {/* 3D Glassmorphic Hero Card */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
           <View style={[styles.heroCardContainer, { borderColor: "rgba(255,255,255,0.15)" }]}>
              <Image
                source={require("@/assets/images/hero.png")}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(11, 4, 28, 0.95)']}
                style={StyleSheet.absoluteFill}
              />
              
              {/* Glass Info Pane overlaying the image */}
              <View style={[styles.heroGlassPane, { backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)" }]}>
                 <Text style={{ fontFamily: "Inter_700Bold", fontSize: 22, color: "#fff", marginBottom: 6 }}>Find What You Lost</Text>
                 <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 18 }}>
                   Our magical matching system helps you locate missing items across the campus instantly.
                 </Text>
              </View>
           </View>
        </View>

        {/* Search Bar */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Pressable
            onPress={() => router.push("/(tabs)/search" as never)}
            style={[
              styles.searchBar,
              {
                backgroundColor: "rgba(255,255,255,0.06)",
                borderColor: "rgba(255,255,255,0.1)",
              }
            ]}
          >
            <Feather name="search" size={20} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 15 }}>
              Search for lost or found items...
            </Text>
          </Pressable>
        </View>

        {/* Quick action grid */}
        <View style={styles.grid}>
          <QuickAction
            icon="plus-circle"
            label="Add Lost"
            bg={colors.lostSoft}
            fg={colors.lost}
            onPress={() => router.push({ pathname: "/items/add", params: { type: "lost" } } as never)}
          />
          <QuickAction
            icon="plus-square"
            label="Add Found"
            bg={colors.foundSoft}
            fg={colors.found}
            onPress={() => router.push({ pathname: "/items/add", params: { type: "found" } } as never)}
          />
          <QuickAction
            icon="grid"
            label="My Posts"
            bg={colors.primarySoft}
            fg={colors.primary}
            onPress={() => router.push("/my-posts" as never)}
          />
          <QuickAction
            icon="alert-triangle"
            label="Report"
            bg={colors.warningSoft}
            fg={colors.warning}
            onPress={() => router.push("/reports/new" as never)}
          />
        </View>

        {/* Latest announcement banner */}
        {latestAnnouncement ? (
          <Pressable
            onPress={() => router.push(`/announcements/${latestAnnouncement.id}` as never)}
            style={({ pressed }) => [
              styles.announce,
              {
                backgroundColor: "rgba(255,255,255,0.06)",
                borderColor: "rgba(255,255,255,0.1)",
                borderWidth: 1,
                opacity: pressed ? 0.92 : 1,
              },
            ]}
          >
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                backgroundColor: colors.primarySoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="bell" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>
                Announcement
              </Text>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 15, marginTop: 2 }} numberOfLines={1}>
                {latestAnnouncement.title}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.primary} />
          </Pressable>
        ) : null}

        {/* Section header */}
        <View style={[styles.section, { marginTop: 35 }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Items</Text>
          <Pressable
            onPress={() => router.push("/(tabs)/lost" as never)}
            style={[styles.viewAllBtn, { backgroundColor: "rgba(255,255,255,0.06)" }]}
          >
            <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>View All</Text>
          </Pressable>
        </View>

        {/* Items list */}
        {recent.length === 0 ? (
          <View
            style={[
              styles.emptyHint,
              {
                backgroundColor: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,255,255,0.08)",
                borderWidth: 1,
              },
            ]}
          >
            <Image
              source={require("@/assets/images/empty.png")}
              style={{ width: 180, height: 180 }}
              contentFit="contain"
            />
            <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 18, marginTop: 10 }}>
              Nothing here yet
            </Text>
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                textAlign: "center",
                lineHeight: 22,
                marginTop: 4,
              }}
            >
              Be the first to post a lost or found item from your campus.
            </Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20, gap: 16 }}>
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
  heroRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between",
  },
  heroHi: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5 },
  heroSub: { fontFamily: "Inter_400Regular", fontSize: 15, marginTop: 4 },
  heroCardContainer: {
    height: 380,
    borderRadius: 32,
    borderWidth: 1,
    overflow: "hidden",
    justifyContent: "flex-end",
    padding: 20,
  },
  heroGlassPane: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    backdropFilter: "blur(20px)", 
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 24,
    borderWidth: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 16,
  },
  quickAction: {
    width: "47%",
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 14,
    alignItems: "flex-start",
  },
  quickIcon: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  announce: {
    marginTop: 24,
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 20, letterSpacing: -0.5 },
  viewAllBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyHint: {
    marginHorizontal: 20,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    borderRadius: 32,
    marginBottom: 20,
  },
});
