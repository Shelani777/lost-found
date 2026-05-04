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
  const bg = focused ? colors.background : colors.input;

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
            borderRadius: colors.radius,
            minHeight: multiline ? 110 : 54,
            alignItems: multiline ? "flex-start" : "center",
            paddingTop: multiline ? 14 : 0,
            shadowColor: focused ? colors.primary : "#000",
            shadowOffset: { width: 0, height: focused ? 0 : 1 },
            shadowOpacity: focused ? 0.12 : 0.04,
            shadowRadius: focused ? 4 : 2,
            elevation: focused ? 2 : 0,
          },
        ]}
      >
        {iconLeft ? (
          <View style={styles.iconWrap}>
            <Feather
              name={iconLeft}
              size={18}
              color={focused ? colors.primary : colors.mutedForeground}
            />
          </View>
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
          <Pressable hitSlop={12} onPress={() => setShow((s) => !s)} style={styles.eyeBtn}>
            <Feather name={show ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
          </Pressable>
        ) : null}
        {rightAdornment}
      </View>
      {error ? (
        <View style={styles.errorRow}>
          <Feather name="alert-circle" size={12} color={colors.destructive} />
          <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 7 },
  label: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 1,
  },
  inputWrap: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderWidth: 1.5,
  },
  iconWrap: {
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    height: 54,
  },
  eyeBtn: {
    paddingHorizontal: 8,
    justifyContent: "center",
    height: 54,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 1,
  },
  error: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
});
