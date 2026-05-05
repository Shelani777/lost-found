import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const { user, isAdmin } = useAuth();
  const { announcements, createAnnouncement, updateAnnouncement } = useData();
  const editingAnnouncement = id ? announcements.find((a) => a.id === id) : undefined;
  const isEditing = Boolean(id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editingAnnouncement) return;
    setTitle(editingAnnouncement.title);
    setDescription(editingAnnouncement.description);
    setImage(editingAnnouncement.image ?? undefined);
  }, [editingAnnouncement]);

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

  if (isEditing && !editingAnnouncement) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, padding: 24 }}>
        <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 18, textAlign: "center" }}>
          Announcement not found
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
    try {
      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, {
          title: title.trim(),
          description: description.trim(),
          image: image ?? null,
        });
      } else {
        await createAnnouncement({
          title: title.trim(),
          description: description.trim(),
          image,
          postedBy: user.id,
        });
      }
      router.back();
    } finally {
      setBusy(false);
    }
  };

  const ScrollComp = Platform.OS === "web" ? ScrollView : KeyboardAwareScrollViewCompat;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: isEditing ? "Edit Announcement" : "New Announcement" }} />
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
        <Button title={isEditing ? "Save Changes" : "Post Announcement"} onPress={onSubmit} loading={busy} />
      </ScrollComp>
    </View>
  );
}
