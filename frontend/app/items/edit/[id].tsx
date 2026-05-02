import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { ImagePickerField } from "@/components/ImagePickerField";
import { Input } from "@/components/Input";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { Select } from "@/components/Select";
import { useColors } from "@/hooks/useColors";
import { useData } from "@/lib/data-context";

export default function EditItemScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getItem, categories, updateItem } = useData();
  const item = id ? getItem(id) : undefined;

  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(item?.categoryId ?? null);
  const [location, setLocation] = useState(item?.location ?? "");
  const [contactNumber, setContactNumber] = useState(item?.contactNumber ?? "");
  const [image, setImage] = useState<string | undefined>(item?.image);
  const [publicity, setPublicity] = useState<string>(item?.publicity ?? "everyone");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!item) return;
    setTitle(item.title);
    setDescription(item.description);
    setCategoryId(item.categoryId);
    setLocation(item.location);
    setContactNumber(item.contactNumber);
    setImage(item.image);
    setPublicity(item.publicity);
  }, [item?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ label: c.name, value: c.id })),
    [categories],
  );

  if (!item) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground }}>Item not found</Text>
      </View>
    );
  }

  const onSave = async () => {
    if (!categoryId) return;
    setBusy(true);
    await updateItem(item.id, {
      title: title.trim(),
      description: description.trim(),
      categoryId,
      location: location.trim(),
      contactNumber: contactNumber.trim(),
      image,
      publicity: publicity as "everyone" | "students_only",
    });
    setBusy(false);
    router.back();
  };

  const ScrollComp = Platform.OS === "web" ? ScrollView : KeyboardAwareScrollViewCompat;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollComp
        contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 40, gap: 16 }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        <ImagePickerField value={image} onChange={setImage} label="Photo" />
        <Input label="Title" value={title} onChangeText={setTitle} />
        <Input label="Description" value={description} onChangeText={setDescription} multiline />
        <Select label="Category" value={categoryId} options={categoryOptions} onChange={setCategoryId} />
        <Input label="Location" iconLeft="map-pin" value={location} onChangeText={setLocation} />
        <Input
          label="Contact Number"
          iconLeft="phone"
          value={contactNumber}
          onChangeText={setContactNumber}
          keyboardType="phone-pad"
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
        <Button title="Save Changes" onPress={onSave} loading={busy} />
      </ScrollComp>
    </View>
  );
}

const styles = StyleSheet.create({});
