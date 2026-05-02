import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  iconLeft?: keyof typeof Feather.glyphMap;
  containerStyle?: ViewStyle;
  multiline?: boolean;
  rightAdornment?: React.ReactNode;
  isPassword?: boolean;
}

export function Input({
  label,
  error,
  iconLeft,
  containerStyle,
  multiline,
  rightAdornment,
  isPassword,
  ...props
}: Props) {
  const colors = useColors();
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const borderColor = error
    ? colors.destructive
    : focused
      ? colors.primary
      : colors.border;
  const bg = colors.input;

  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      ) : null}
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: bg,
            borderColor,
            borderRadius: colors.radius - 2,
            minHeight: multiline ? 110 : 50,
            alignItems: multiline ? "flex-start" : "center",
            paddingTop: multiline ? 12 : 0,
          },
        ]}
      >
        {iconLeft ? (
          <Feather name={iconLeft} size={18} color={colors.mutedForeground} style={{ marginRight: 10 }} />
        ) : null}
        <TextInput
          {...props}
          multiline={multiline}
          secureTextEntry={isPassword && !show}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          placeholderTextColor={colors.mutedForeground}
          style={{
            flex: 1,
            color: colors.foreground,
            fontSize: 15,
            fontFamily: "Inter_400Regular",
            paddingVertical: 0,
            textAlignVertical: multiline ? "top" : "center",
            minHeight: multiline ? 90 : undefined,
          }}
        />
        {isPassword ? (
          <Pressable hitSlop={10} onPress={() => setShow((s) => !s)} style={{ paddingHorizontal: 6 }}>
            <Feather name={show ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
          </Pressable>
        ) : null}
        {rightAdornment}
      </View>
      {error ? (
        <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  inputWrap: {
    flexDirection: "row",
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  error: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
});
