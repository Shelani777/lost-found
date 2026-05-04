import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { useTheme } from "@/lib/theme-context";

interface RowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  description?: string;
  onPress: () => void;
  badge?: string | number;
  iconBg?: string;
  iconFg?: string;
  destructive?: boolean;
}

function Row({ icon, label, description, onPress, badge, iconBg, iconFg, destructive }: RowProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: "rgba(255,255,255,0.06)",
          borderColor: "rgba(255,255,255,0.1)",
          borderRadius: 20,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View
        style={[
          styles.rowIcon,
          {
            backgroundColor: iconBg ?? "rgba(255,255,255,0.08)",
            borderRadius: 14,
          },
        ]}
      >
        <Feather name={icon} size={20} color={iconFg ?? "#fff"} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: destructive ? colors.destructive : "#fff",
            fontFamily: "Inter_600SemiBold",
            fontSize: 15,
          }}
        >
          {label}
        </Text>
        {description ? (
          <Text style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }}>
            {description}
          </Text>
        ) : null}
      </View>
      {badge !== undefined ? (
        <View
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 12 }}>{badge}</Text>
        </View>
      ) : (
        <View style={[styles.chevronWrap, { backgroundColor: "rgba(255,255,255,0.08)" }]}>
          <Feather name="chevron-right" size={15} color="rgba(255,255,255,0.4)" />
        </View>
      )}
    </Pressable>
  );
}

export default function MoreScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout, isAdmin } = useAuth();
  const { items, claims, reports, announcements } = useData();
  const { mode, setMode } = useTheme();

  const myItems = items.filter((i) => i.userId === user?.id).length;
  const myClaims = claims.filter((c) => c.userId === user?.id).length;

  const isWeb = Platform.OS === "web";
  const headerTopPadding = isWeb ? 67 + 12 : insets.top + 12;
  const tabBarSpace = isWeb ? 84 : 90;

  const onLogout = () => {
    if (Platform.OS === "web") {
      logout().then(() => router.replace("/(auth)/login"));
      return;
    }
    Alert.alert("Log out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0B041C" }}>
      {/* Background Ambient Gradients */}
      <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
        <View style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: colors.primary, opacity: 0.15, filter: 'blur(50px)' }} />
        <View style={{ position: 'absolute', bottom: 100, left: -150, width: 400, height: 400, borderRadius: 200, backgroundColor: colors.tint, opacity: 0.1, filter: 'blur(60px)' }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: headerTopPadding,
          paddingHorizontal: 18,
          paddingBottom: tabBarSpace + 16,
          gap: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 28, letterSpacing: -0.5 }}>More</Text>

        <View
          style={[
            styles.profileCard,
            { backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderRadius: 28 },
          ]}
        >
          <TouchableOpacity 
            style={styles.avatarRing}
            onPress={() => router.push("/profile/edit" as never)}
          >
            <Avatar name={user?.name ?? "?"} uri={user?.avatar} size={64} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <TouchableOpacity 
                style={{ flex: 1 }}
                onPress={() => router.push("/profile/edit" as never)}
              >
                <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 20 }}>{user?.name}</Text>
                <Text style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 }}>
                  {user?.email}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.push("/profile/edit" as never)}
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  padding: 8, 
                  borderRadius: 10,
                  borderColor: 'rgba(255,255,255,0.2)',
                  borderWidth: 1
                }}
              >
                <Feather name="edit-2" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            {isAdmin ? (
              <View
                style={{
                  marginTop: 10,
                  alignSelf: "flex-start",
                  backgroundColor: "rgba(185, 43, 138, 0.2)",
                  borderColor: "rgba(185, 43, 138, 0.4)",
                  borderWidth: 1,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1 }}>ADMIN</Text>
              </View>
            ) : null}
          </View>
          {/* Stats */}
          <View style={[styles.statBubble, { backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.1)", borderWidth: 1 }]}>
            <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 20 }}>{myItems}</Text>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Inter_400Regular", fontSize: 10 }}>Posts</Text>
          </View>
        </View>

        <View>
          <Text style={[styles.sectionLabel, { color: "rgba(255,255,255,0.4)" }]}>MY ACTIVITY</Text>
          <View style={{ gap: 12, marginTop: 12 }}>
            <Row
              icon="edit-3"
              label="My Posts"
              description={`${myItems} item${myItems === 1 ? "" : "s"}`}
              onPress={() => router.push("/my-posts" as never)}
              iconBg="rgba(255, 171, 0, 0.15)"
              iconFg="#FFAB00"
            />
            <Row
              icon="message-square"
              label="My Claim Requests"
              description={`${myClaims} claim${myClaims === 1 ? "" : "s"}`}
              onPress={() => router.push("/claims" as never)}
              iconBg="rgba(0, 184, 217, 0.15)"
              iconFg="#00B8D9"
            />
            <Row
              icon="flag"
              label="My Reports"
              description="Issues you have raised"
              onPress={() => router.push("/reports" as never)}
              iconBg="rgba(255, 86, 48, 0.15)"
              iconFg="#FF5630"
            />
          </View>
        </View>

        <View>
          <Text style={[styles.sectionLabel, { color: "rgba(255,255,255,0.4)" }]}>EXPLORE</Text>
          <View style={{ gap: 12, marginTop: 12 }}>
            <Row
              icon="bell"
              label="Announcements"
              description={`${announcements.length} active`}
              onPress={() => router.push("/announcements" as never)}
              iconBg="rgba(101, 84, 192, 0.15)"
              iconFg="#6554C0"
            />
            <Row
              icon="grid"
              label="Categories"
              description="Browse categories"
              onPress={() => router.push("/categories" as never)}
              iconBg="rgba(54, 179, 126, 0.15)"
              iconFg="#36B37E"
            />
          </View>
        </View>

        {isAdmin ? (
          <View>
            <Text style={[styles.sectionLabel, { color: "rgba(255,255,255,0.4)" }]}>ADMINISTRATOR</Text>
            <View style={{ gap: 12, marginTop: 12 }}>
              <Row
                icon="shield"
                label="Admin Dashboard"
                description="Manage everything"
                onPress={() => router.push("/admin" as never)}
                iconBg={colors.primary}
                iconFg="#fff"
              />
              <Row
                icon="layers"
                label="Manage All Posts"
                description={`${items.length} total`}
                onPress={() => router.push("/admin/posts" as never)}
              />
              <Row
                icon="alert-octagon"
                label="Review Reports"
                description={`${reports.length} reports`}
                onPress={() => router.push("/admin/reports" as never)}
              />
            </View>
          </View>
        ) : null}

        <View>
          <Text style={[styles.sectionLabel, { color: "rgba(255,255,255,0.4)" }]}>PREFERENCES</Text>
          <View style={{ gap: 12, marginTop: 12 }}>
            <Row
              icon={mode === "dark" ? "moon" : mode === "light" ? "sun" : "smartphone"}
              label="Theme"
              description={`Currently: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`}
              onPress={() => {
                const next = mode === "light" ? "dark" : mode === "dark" ? "system" : "light";
                setMode(next);
              }}
              iconBg="rgba(255, 255, 255, 0.1)"
              iconFg="#fff"
            />
          </View>
        </View>

        <View>
          <Text style={[styles.sectionLabel, { color: "rgba(255,255,255,0.4)" }]}>ACCOUNT</Text>
          <View style={{ gap: 12, marginTop: 12 }}>
            <Row
              icon="log-out"
              label="Log out"
              onPress={onLogout}
              iconBg="rgba(255, 86, 48, 0.15)"
              iconFg="#FF5630"
              destructive
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderWidth: 1,
    backdropFilter: "blur(10px)",
  },
  rowIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 24,
    backdropFilter: "blur(20px)",
  },
  avatarRing: {
    borderRadius: 38,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    padding: 4,
  },
  statBubble: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  sectionLabel: { fontFamily: "Inter_700Bold", fontSize: 12, letterSpacing: 1.2, marginLeft: 4 },
});
