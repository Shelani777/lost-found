import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { ImagePickerField } from "@/components/ImagePickerField";
import { Input } from "@/components/Input";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { Select } from "@/components/Select";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { ItemType } from "@/lib/storage";



  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (!description.trim()) e.description = "Describe the item briefly";
    if (!categoryId) e.categoryId = "Pick a category";
    if (!location.trim()) e.location = "Where was it?";
    if (!contactNumber.trim() || contactNumber.trim().length < 6)
      e.contactNumber = "Enter a valid contact number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  
  const ScrollComp = Platform.OS === "web" ? ScrollView : KeyboardAwareScrollViewCompat;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollComp
        contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 40, gap: 16 }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        <View style={[styles.toggle, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
          {(["lost", "found"] as ItemType[]).map((t) => {
            const active = type === t;
            return (
              <Pressable
                key={t}
                onPress={() => setType(t)}
                style={({ pressed }) => ({
                  flex: 1,
                  borderRadius: colors.radius - 2,
                  backgroundColor: active
                    ? t === "lost"
                      ? colors.lost
                      : colors.found
                    : "transparent",
                  paddingVertical: 12,
                  alignItems: "center",
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text
                  style={{
                    color: active ? "#fff" : colors.foreground,
                    fontFamily: "Inter_700Bold",
                    fontSize: 14,
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                  }}
                >
                  {t}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ImagePickerField value={image} onChange={setImage} label="Photo (optional)" />

        <Input
          label="Title"
          placeholder={type === "lost" ? "e.g. Black leather wallet" : "e.g. Set of keys"}
          value={title}
          onChangeText={setTitle}
          error={errors.title}
        />

        <Input
          label="Description"
          placeholder="Brand, color, distinguishing details..."
          value={description}
          onChangeText={setDescription}
          multiline
          error={errors.description}
        />

        <Select
          label="Category"
          placeholder="Choose a category"
          value={categoryId}
          options={categoryOptions}
          onChange={setCategoryId}
          error={errors.categoryId}
        />

        <Input
          label="Location"
          iconLeft="map-pin"
          placeholder={type === "lost" ? "Where you last had it" : "Where you found it"}
          value={location}
          onChangeText={setLocation}
          error={errors.location}
        />

        <Input
          label="Contact Number"
          iconLeft="phone"
          placeholder="07X XXX XXXX"
          keyboardType="phone-pad"
          value={contactNumber}
          onChangeText={setContactNumber}
          error={errors.contactNumber}
        />

        <Select
          label="Who can see this?"
          value={publicity}
          onChange={setPublicity}
          options={[
            { label: "Everyone", value: "everyone", description: "Public post visible to all users" },
            { label: "Students Only", value: "students_only", description: "Visible only to university students" },
          ]}
        />

        <Button title="Post Item" onPress={onSubmit} loading={busy} />
      </ScrollComp>
    </View>
  );
}

