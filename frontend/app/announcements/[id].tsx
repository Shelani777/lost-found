import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { formatRelative } from "@/lib/storage";

export default function AnnouncementDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const { announcements, deleteAnnouncement } = useData();

  const a = announcements.find((x) => x.id === id);

  if (!a) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground }}>Announcement not found</Text>
      </View>
    );
  }

  const onDelete = () => {
    const doIt = async () => {
      await deleteAnnouncement(a.id);
      router.back();
    };
    if (Platform.OS === "web") return doIt();
    Alert.alert("Delete announcement?", undefined, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: doIt },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: "Announcement",
          headerRight: isAdmin
            ? () => (
                <Pressable hitSlop={8} onPress={onDelete}>
                  <Feather name="trash-2" size={20} color={colors.destructive} />
                </Pressable>
              )
            : undefined,
        }}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}>
        {a.image ? (
          <Image source={{ uri: a.image }} style={{ width: "100%", aspectRatio: 16 / 9 }} contentFit="cover" />
        ) : (
          <View
            style={{
              width: "100%",
              aspectRatio: 16 / 9,
              backgroundColor: colors.primarySoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Feather name="bell" size={56} color={colors.primary} />
          </View>
        )}
        <View style={{ padding: 18, gap: 10 }}>
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 12 }}>
            {formatRelative(a.createdAt)}
          </Text>
          <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 24 }}>{a.title}</Text>
          <Text style={{ color: colors.foreground, fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22 }}>
            {a.description}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({});
