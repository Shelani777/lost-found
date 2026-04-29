import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  name: string;
  uri?: string;
  size?: number;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

export function Avatar({ name, uri, size = 40 }: Props) {
  const colors = useColors();
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
      />
    );
  }
  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary },
      ]}
    >
      <Text
        style={{
          color: colors.primaryForeground,
          fontFamily: "Inter_700Bold",
          fontSize: size * 0.4,
        }}
      >
        {initials(name).toUpperCase() || "?"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: "center", justifyContent: "center" },
});
