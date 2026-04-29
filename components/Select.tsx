import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export interface Option {
  label: string;
  value: string;
  description?: string;
}

interface Props {
  label?: string;
  placeholder?: string;
  value: string | null;
  options: Option[];
  onChange: (value: string) => void;
  error?: string;
}

export function Select({ label, placeholder = "Select", value, options, onChange, error }: Props) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.field,
          {
            backgroundColor: colors.input,
            borderColor: error ? colors.destructive : colors.border,
            borderRadius: colors.radius - 2,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text
          style={{
            flex: 1,
            color: selected ? colors.foreground : colors.mutedForeground,
            fontFamily: "Inter_500Medium",
            fontSize: 15,
          }}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Feather name="chevron-down" size={18} color={colors.mutedForeground} />
      </Pressable>
      {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.background, borderRadius: 22 }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheetHeader}>
              <Text style={{ color: colors.foreground, fontSize: 16, fontFamily: "Inter_700Bold" }}>
                {label ?? "Select"}
              </Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={10}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {options.map((opt) => {
                const isActive = opt.value === value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      {
                        backgroundColor: isActive
                          ? colors.primarySoft
                          : pressed
                            ? colors.muted
                            : "transparent",
                        borderRadius: colors.radius - 4,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: isActive ? colors.primary : colors.foreground,
                          fontFamily: isActive ? "Inter_600SemiBold" : "Inter_500Medium",
                          fontSize: 15,
                        }}
                      >
                        {opt.label}
                      </Text>
                      {opt.description ? (
                        <Text
                          style={{
                            color: colors.mutedForeground,
                            fontFamily: "Inter_400Regular",
                            fontSize: 12,
                            marginTop: 2,
                          }}
                        >
                          {opt.description}
                        </Text>
                      ) : null}
                    </View>
                    {isActive ? (
                      <Feather name="check" size={18} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  field: {
    height: 50,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  error: { fontSize: 12, fontFamily: "Inter_500Medium" },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 6,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingBottom: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
});
