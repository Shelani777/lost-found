import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";
import { ItemStatus, ItemType } from "@/lib/storage";

export function TypeBadge({ type, style }: { type: ItemType; style?: ViewStyle }) {
  const colors = useColors();
  const isLost = type === "lost";
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: isLost ? colors.lostSoft : colors.foundSoft,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: isLost ? colors.lost : colors.found },
        ]}
      >
        {isLost ? "Lost" : "Found"}
      </Text>
    </View>
  );
}

export function StatusBadge({ status, style }: { status: ItemStatus; style?: ViewStyle }) {
  const colors = useColors();
  const map = {
    open: { bg: colors.primarySoft, fg: colors.statusOpen, label: "Open" },
    claimed: { bg: colors.warningSoft, fg: colors.statusClaimed, label: "Claimed" },
    closed: { bg: colors.muted, fg: colors.statusClosed, label: "Closed" },
  } as const;
  const v = map[status];
  return (
    <View style={[styles.base, { backgroundColor: v.bg }, style]}>
      <Text style={[styles.text, { color: v.fg }]}>{v.label}</Text>
    </View>
  );
}

export function GenericBadge({
  label,
  color,
  bg,
  style,
}: {
  label: string;
  color: string;
  bg: string;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.base, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  text: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});
