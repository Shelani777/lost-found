import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { ImagePickerField } from "@/components/ImagePickerField";
import { Input } from "@/components/Input";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { Select } from "@/components/Select";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { REPORT_REASONS } from "@/lib/storage";

export default function NewReportScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { itemId, id } = useLocalSearchParams<{ itemId?: string; id?: string }>();
  const { user } = useAuth();
  const { items, reports, getItem, createReport, updateReport } = useData();
  const editingReport = id ? reports.find((r) => r.id === id) : undefined;
  const isEditing = Boolean(id);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(itemId ?? null);
  const [reason, setReason] = useState<string | null>(REPORT_REASONS[0]);
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editingReport) return;
    setSelectedItemId(editingReport.itemId);
    setReason(editingReport.reason);
    setDescription(editingReport.description);
    setScreenshot(editingReport.screenshot ?? undefined);
  }, [editingReport]);

  const itemOptions = useMemo(
    () =>
      items
        .slice()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((i) => ({
          label: `${i.type === "lost" ? "Lost" : "Found"} · ${i.title}`,
          value: i.id,
          description: i.location,
        })),
    [items],
  );

  const reasonOptions = REPORT_REASONS.map((r) => ({ label: r, value: r }));

  const item = selectedItemId ? getItem(selectedItemId) : undefined;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedItemId) e.itemId = "Pick a post to report";
    if (!reason) e.reason = "Pick a reason";
    if (description.trim().length < 10) e.description = "Add at least 10 characters of context";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async () => {
    if (!validate() || !user || !selectedItemId || !reason) return;
    setBusy(true);
    try {
      if (editingReport) {
        await updateReport(editingReport.id, {
          reason,
          description: description.trim(),
          screenshot: screenshot ?? null,
        });
        router.back();
      } else {
        await createReport({
          itemId: selectedItemId,
          userId: user.id,
          reason,
          description: description.trim(),
          screenshot: screenshot ?? null,
        });
        router.replace("/reports" as never);
      }
    } finally {
      setBusy(false);
    }
  };

  const ScrollComp = Platform.OS === "web" ? ScrollView : KeyboardAwareScrollViewCompat;

  if (isEditing && (!editingReport || editingReport.userId !== user?.id)) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, padding: 24 }}>
        <Stack.Screen options={{ title: "Edit Report" }} />
        <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 18, textAlign: "center" }}>
          Report not found
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: isEditing ? "Edit Report" : "Report a Post" }} />
      <ScrollComp
        contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 40, gap: 16 }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        {item ? (
          <View style={{ padding: 14, borderRadius: colors.radius, backgroundColor: colors.destructiveSoft }}>
            <Text style={{ color: colors.destructive, fontFamily: "Inter_700Bold", fontSize: 13, letterSpacing: 0.4 }}>
              REPORTING
            </Text>
            <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 15, marginTop: 4 }}>
              {item.title}
            </Text>
          </View>
        ) : (
          <Select
            label="Post"
            placeholder="Choose a post"
            value={selectedItemId}
            options={itemOptions}
            onChange={setSelectedItemId}
            error={errors.itemId}
          />
        )}

        <Select
          label="Reason"
          value={reason}
          options={reasonOptions}
          onChange={setReason}
          error={errors.reason}
        />

        <Input
          label="Details"
          placeholder="Describe what is wrong with this post..."
          multiline
          value={description}
          onChangeText={setDescription}
          error={errors.description}
        />

        <ImagePickerField value={screenshot} onChange={setScreenshot} label="Screenshot (optional)" />

        <Button title={isEditing ? "Save Changes" : "Submit Report"} onPress={onSubmit} loading={busy} variant="destructive" />
      </ScrollComp>
    </View>
  );
}
