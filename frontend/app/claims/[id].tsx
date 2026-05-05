import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GenericBadge, TypeBadge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { ClaimStatus, formatRelative } from "@/lib/storage";

export default function ClaimDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const { claims, getItem, deleteClaim, setClaimStatus, setItemStatus } = useData();

  const claim = claims.find((c) => c.id === id);
  const item = claim ? getItem(claim.itemId) : undefined;

  if (!claim) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground }}>Claim not found</Text>
      </View>
    );
  }

  const isClaimer = user?.id === claim.userId;
  const isItemOwner = user && item && item.userId === user.id;
  const canModerate = isItemOwner || isAdmin;

  const updateStatus = async (next: ClaimStatus) => {
    await setClaimStatus(claim.id, next);
    if (next === "approved" && item) {
      await setItemStatus(item.id, "claimed");
    }
  };

  const onDelete = () => {
    const doIt = async () => {
      await deleteClaim(claim.id);
      router.back();
    };
    if (Platform.OS === "web") return doIt();
    Alert.alert("Delete claim?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: doIt },
    ]);
  };

  const statusBg =
    claim.status === "approved"
      ? colors.successSoft
      : claim.status === "rejected"
        ? colors.destructiveSoft
        : colors.warningSoft;
  const statusFg =
    claim.status === "approved"
      ? colors.success
      : claim.status === "rejected"
        ? colors.destructive
        : colors.warning;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: "Claim Request",
          headerRight:
            isClaimer || isAdmin
              ? () => (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                    {isClaimer ? (
                      <Pressable hitSlop={8} onPress={() => router.push(`/claims/new?id=${claim.id}` as never)}>
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
      <ScrollView contentContainerStyle={{ padding: 18, gap: 16, paddingBottom: insets.bottom + 30 }}>
        {item ? (
          <Pressable
            onPress={() => router.push(`/items/${item.id}` as never)}
            style={({ pressed }) => [
              styles.itemCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
                opacity: pressed ? 0.92 : 1,
              },
            ]}
          >
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <TypeBadge type={item.type} />
              <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 15, flex: 1 }} numberOfLines={1}>
                {item.title}
              </Text>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </View>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 6 }}>
              {item.location}
            </Text>
          </Pressable>
        ) : null}

        <View style={[styles.statusBar, { backgroundColor: statusBg, borderRadius: colors.radius }]}>
          <Feather
            name={
              claim.status === "approved"
                ? "check-circle"
                : claim.status === "rejected"
                  ? "x-circle"
                  : "clock"
            }
            size={18}
            color={statusFg}
          />
          <Text style={{ color: statusFg, fontFamily: "Inter_700Bold", fontSize: 14, textTransform: "uppercase", letterSpacing: 0.4 }}>
            {claim.status}
          </Text>
        </View>

        <View>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>MESSAGE</Text>
          <Text style={{ color: colors.foreground, fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, marginTop: 6 }}>
            {claim.message}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CONTACT</Text>
            <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 14, marginTop: 4 }}>
              {claim.contactNumber}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SENT</Text>
            <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 14, marginTop: 4 }}>
              {formatRelative(claim.createdAt)}
            </Text>
          </View>
        </View>

        {claim.proofImage ? (
          <View>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginBottom: 6 }]}>PROOF</Text>
            <Image
              source={{ uri: claim.proofImage }}
              style={{ width: "100%", aspectRatio: 16 / 10, borderRadius: colors.radius, backgroundColor: colors.muted }}
              contentFit="cover"
            />
          </View>
        ) : null}

        {canModerate && claim.status === "pending" ? (
          <View style={{ gap: 10 }}>
            <Button
              title="Approve & Mark Claimed"
              iconLeft={<Feather name="check" size={18} color="#fff" />}
              onPress={() => updateStatus("approved")}
            />
            <Button
              title="Reject"
              variant="ghost"
              iconLeft={<Feather name="x" size={18} color={colors.destructive} />}
              onPress={() => updateStatus("rejected")}
            />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  itemCard: { padding: 14, borderWidth: 1 },
  statusBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
  },
  sectionLabel: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 0.6 },
  metaRow: { flexDirection: "row", gap: 16 },
});
