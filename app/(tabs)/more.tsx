import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";

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
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.rowIcon,
          {
            backgroundColor: iconBg ?? colors.primarySoft,
            borderRadius: 10,
          },
        ]}
      >
        <Feather name={icon} size={18} color={iconFg ?? colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: destructive ? colors.destructive : colors.foreground,
            fontFamily: "Inter_600SemiBold",
            fontSize: 15,
          }}
        >
          {label}
        </Text>
        {description ? (
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }}>
            {description}
          </Text>
        ) : null}
      </View>
      {badge !== undefined ? (
        <View
          style={{
            backgroundColor: colors.primarySoft,
            paddingHorizontal: 10,
            paddingVertical: 3,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 12 }}>{badge}</Text>
        </View>
      ) : (
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerTopPadding,
          paddingHorizontal: 18,
          paddingBottom: tabBarSpace + 16,
          gap: 18,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 24 }}>More</Text>

        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.primary, borderRadius: colors.radius + 4 },
          ]}
        >
          <Avatar name={user?.name ?? "?"} uri={user?.avatar} size={56} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 18 }}>{user?.name}</Text>
            <Text style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 }}>
              {user?.email}
            </Text>
            {isAdmin ? (
              <View
                style={{
                  marginTop: 6,
                  alignSelf: "flex-start",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 0.4 }}>ADMIN</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>MY ACTIVITY</Text>
          <View style={{ gap: 10, marginTop: 8 }}>
            <Row
              icon="edit-3"
              label="My Posts"
              description={`${myItems} item${myItems === 1 ? "" : "s"}`}
              onPress={() => router.push("/my-posts" as never)}
              iconBg={colors.warningSoft}
              iconFg={colors.warning}
            />
            <Row
              icon="message-square"
              label="My Claim Requests"
              description={`${myClaims} claim${myClaims === 1 ? "" : "s"}`}
              onPress={() => router.push("/claims" as never)}
              iconBg={colors.foundSoft}
              iconFg={colors.found}
            />
            <Row
              icon="flag"
              label="My Reports"
              description="Issues you have raised"
              onPress={() => router.push("/reports" as never)}
              iconBg="#fdecee"
              iconFg={colors.destructive}
            />
          </View>
        </View>

        <View>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>EXPLORE</Text>
          <View style={{ gap: 10, marginTop: 8 }}>
            <Row
              icon="bell"
              label="Announcements"
              description={`${announcements.length} active`}
              onPress={() => router.push("/announcements" as never)}
              iconBg={colors.primarySoft}
              iconFg={colors.primary}
            />
            <Row
              icon="grid"
              label="Categories"
              description="Browse categories"
              onPress={() => router.push("/categories" as never)}
              iconBg="#f3eafc"
              iconFg="#8b5cf6"
            />
          </View>
        </View>

        {isAdmin ? (
          <View>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ADMINISTRATOR</Text>
            <View style={{ gap: 10, marginTop: 8 }}>
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
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACCOUNT</Text>
          <View style={{ gap: 10, marginTop: 8 }}>
            <Row
              icon="log-out"
              label="Log out"
              onPress={onLogout}
              iconBg={colors.destructiveSoft}
              iconFg={colors.destructive}
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
    gap: 14,
    padding: 14,
    borderWidth: 1,
  },
  rowIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  sectionLabel: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 0.6 },
});
