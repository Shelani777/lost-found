import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { useColors } from "@/hooks/useColors";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "lg" | "md" | "sm";

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
  testID?: string;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "lg",
  disabled,
  loading,
  iconLeft,
  iconRight,
  style,
  fullWidth = true,
  testID,
}: Props) {
  const colors = useColors();
  const isDisabled = !!disabled || !!loading;

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync().catch(() => {});
    }
    onPress();
  };

  const bg =
    variant === "primary"
      ? colors.primary
      : variant === "destructive"
        ? colors.destructive
        : variant === "secondary"
          ? colors.primarySoft
          : "transparent";
  const fg =
    variant === "primary"
      ? colors.primaryForeground
      : variant === "destructive"
        ? colors.destructiveForeground
        : variant === "secondary"
          ? colors.primary
          : colors.primary;
  const height = size === "lg" ? 54 : size === "md" ? 46 : 38;
  const fontSize = size === "lg" ? 16 : size === "md" ? 15 : 14;

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      testID={testID}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderRadius: colors.radius,
          height,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.99 : 1 }],
          alignSelf: fullWidth ? "stretch" : "flex-start",
        },
        styles.base,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <>
            {iconLeft}
            <Text
              style={{
                color: fg,
                fontFamily: "Inter_600SemiBold",
                fontSize,
                letterSpacing: 0.2,
              }}
            >
              {title}
            </Text>
            {iconRight}
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
