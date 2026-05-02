import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  label?: string;
  value?: string;
  onChange: (uri: string | undefined) => void;
  helper?: string;
  aspectRatio?: number;
}

export function ImagePickerField({
  label = "Upload Image",
  value,
  onChange,
  helper = "Tap to upload",
  aspectRatio = 16 / 10,
}: Props) {
  const colors = useColors();
  const [busy, setBusy] = useState(false);

  const pick = async () => {
    setBusy(true);
    try {
      if (Platform.OS !== "web") {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert("Permission required", "Please allow photo library access to upload.");
          setBusy(false);
          return;
        }
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!res.canceled && res.assets[0]?.uri) {
        onChange(res.assets[0].uri);
      }
    } catch {
      Alert.alert("Could not select image", "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      ) : null}
      <Pressable
        onPress={pick}
        style={({ pressed }) => [
          styles.box,
          {
            backgroundColor: colors.input,
            borderColor: colors.border,
            borderRadius: colors.radius - 2,
            opacity: busy ? 0.6 : pressed ? 0.85 : 1,
            aspectRatio,
            borderStyle: value ? "solid" : "dashed",
          },
        ]}
      >
        {value ? (
          <>
            <Image
              source={{ uri: value }}
              style={{ width: "100%", height: "100%", borderRadius: colors.radius - 2 }}
              contentFit="cover"
            />
            <Pressable
              hitSlop={10}
              onPress={() => onChange(undefined)}
              style={[
                styles.removeBtn,
                { backgroundColor: colors.destructive },
              ]}
            >
              <Feather name="x" size={14} color="#fff" />
            </Pressable>
          </>
        ) : (
          <View style={styles.placeholder}>
            <View
              style={{
                width: 44,
                height: 44,
                backgroundColor: colors.primarySoft,
                borderRadius: 22,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="map-pin" size={20} color={colors.primary} />
            </View>
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_500Medium",
                fontSize: 14,
              }}
            >
              {helper}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  box: {
    width: "100%",
    overflow: "hidden",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: { alignItems: "center", justifyContent: "center", gap: 10 },
  removeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
});
