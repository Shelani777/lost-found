import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { Platform, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { ImagePickerField } from "@/components/ImagePickerField";
import { Input } from "@/components/Input";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";

export default function NewAnnouncementScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAdmin } = useAuth();
  const { createAnnouncement } = useData();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, padding: 24 }}>
        <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 18, textAlign: "center" }}>
          Admin only
        </Text>
        <Text style={{ color: colors.mutedForeground, marginTop: 6, textAlign: "center" }}>
          Only administrators can post announcements.
        </Text>
      </View>
    );
  }

  const onSubmit = async () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (description.trim().length < 10) e.description = "Add a useful description";
    setErrors(e);
    if (Object.keys(e).length > 0 || !user) return;
    setBusy(true);
    await createAnnouncement({
      title: title.trim(),
      description: description.trim(),
      image,
      postedBy: user.id,
    });
    setBusy(false);
    router.back();
  };

  const ScrollComp = Platform.OS === "web" ? ScrollView : KeyboardAwareScrollViewCompat;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: "New Announcement" }} />
      <ScrollComp
        contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 40, gap: 16 }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        <ImagePickerField value={image} onChange={setImage} label="Cover image (optional)" />
        <Input label="Title" value={title} onChangeText={setTitle} error={errors.title} />
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          error={errors.description}
        />
        <Button title="Post Announcement" onPress={onSubmit} loading={busy} />
      </ScrollComp>
    </View>
  );
}
