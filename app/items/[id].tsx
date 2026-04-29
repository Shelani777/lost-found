import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GenericBadge, StatusBadge, TypeBadge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { ItemStatus, formatRelative } from "@/lib/storage";

const STATUS_OPTIONS: { value: ItemStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "claimed", label: "Claimed" },
  { value: "closed", label: "Closed" },
];

export default function ItemDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const { getItem, getCategory, deleteItem, setItemStatus, claims } = useData();

  const item = id ? getItem(id) : undefined;
  const category = item ? getCategory(item.categoryId) : undefined;
  const itemClaims = useMemo(
    () => (item ? claims.filter((c) => c.itemId === item.id) : []),
    [claims, item],
  );

  if (!item) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>Item not found</Text>
      </View>
    );
  }

  const isOwner = user?.id === item.userId;
  const canEdit = isOwner || isAdmin;

  const handleDelete = () => {
    const doDelete = async () => {
      await deleteItem(item.id);
      router.back();
    };
    if (Platform.OS === "web") {
      doDelete();
      return;
    }
    Alert.alert("Delete this post?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: doDelete },
    ]);
  };

  const handleStatusChange = (status: ItemStatus) => {
    setItemStatus(item.id, status);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: item.type === "lost" ? "Lost Item" : "Found Item",
          headerRight: canEdit
            ? () => (
                <View style={{ flexDirection: "row", gap: 14 }}>
                  <Pressable hitSlop={8} onPress={() => router.push(`/items/edit/${item.id}` as never)}>
                    <Feather name="edit-2" size={20} color={colors.primary} />
                  </Pressable>
                  <Pressable hitSlop={8} onPress={handleDelete}>
                    <Feather name="trash-2" size={20} color={colors.destructive} />
                  </Pressable>
                </View>
              )
            : undefined,
        }}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        <View
          style={{
            margin: 18,
            borderRadius: colors.radius + 4,
            backgroundColor: item.type === "lost" ? colors.lostSoft : colors.foundSoft,
            aspectRatio: 16 / 10,
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {item.image ? (
            <Image source={{ uri: item.image }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
          ) : (
            <Feather
              name={item.type === "lost" ? "search" : "check-circle"}
              size={56}
              color={item.type === "lost" ? colors.lost : colors.found}
            />
          )}
        </View>

        <View style={{ paddingHorizontal: 18, gap: 12 }}>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <TypeBadge type={item.type} />
            <StatusBadge status={item.status} />
            {category ? (
              <GenericBadge label={category.name} bg={colors.muted} color={colors.mutedForeground} />
            ) : null}
          </View>

          <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 22 }}>{item.title}</Text>

          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20 }}>
            {item.description}
          </Text>

          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 6 }} />

          <DetailRow icon="map-pin" label="Location" value={item.location} />
          <DetailRow icon="phone" label="Contact" value={item.contactNumber} />
          <DetailRow icon="calendar" label="Posted" value={formatRelative(item.createdAt)} />

          {canEdit ? (
            <View style={{ marginTop: 16 }}>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 14, marginBottom: 8 }}>
                Update Status
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {STATUS_OPTIONS.map((s) => {
                  const active = s.value === item.status;
                  return (
                    <Pressable
                      key={s.value}
                      onPress={() => handleStatusChange(s.value)}
                      style={({ pressed }) => [
                        {
                          flex: 1,
                          paddingVertical: 10,
                          alignItems: "center",
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
                          fontSize: 13,
                        }}
                      >
                        {s.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          {!isOwner && user ? (
            <View style={{ marginTop: 18, gap: 10 }}>
              <Button
                title={item.type === "lost" ? "I Found This Item" : "This Is Mine — Claim"}
                iconLeft={<Feather name="message-circle" size={18} color="#fff" />}
                onPress={() =>
                  router.push({ pathname: "/claims/new", params: { itemId: item.id } } as never)
                }
              />
              <Button
                title="Report this post"
                variant="ghost"
                iconLeft={<Feather name="flag" size={16} color={colors.destructive} />}
                onPress={() =>
                  router.push({ pathname: "/reports/new", params: { itemId: item.id } } as never)
                }
              />
            </View>
          ) : null}

          {(isOwner || isAdmin) && itemClaims.length > 0 ? (
            <View style={{ marginTop: 22 }}>
              <Text
                style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 16, marginBottom: 10 }}
              >
                Claim Requests ({itemClaims.length})
              </Text>
              <View style={{ gap: 10 }}>
                {itemClaims.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => router.push(`/claims/${c.id}` as never)}
                    style={({ pressed }) => [
                      styles.claimCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        borderRadius: colors.radius,
                        opacity: pressed ? 0.92 : 1,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 14 }}
                        numberOfLines={2}
                      >
                        {c.message}
                      </Text>
                      <Text
                        style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4 }}
                      >
                        {formatRelative(c.createdAt)} · {c.contactNumber}
                      </Text>
                    </View>
                    <GenericBadge
                      label={c.status}
                      bg={
                        c.status === "approved"
                          ? colors.successSoft
                          : c.status === "rejected"
                            ? colors.destructiveSoft
                            : colors.warningSoft
                      }
                      color={
                        c.status === "approved"
                          ? colors.success
                          : c.status === "rejected"
                            ? colors.destructive
                            : colors.warning
                      }
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.detailRow}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather name={icon} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 12 }}>
          {label}
        </Text>
        <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 14, marginTop: 2 }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  detailRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6 },
  claimCard: {
    flexDirection: "row",
    padding: 14,
    gap: 10,
    borderWidth: 1,
    alignItems: "center",
  },
});
