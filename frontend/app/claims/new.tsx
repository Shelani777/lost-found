import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TypeBadge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { ImagePickerField } from "@/components/ImagePickerField";
import { Input } from "@/components/Input";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";

export default function NewClaimScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { itemId, id } = useLocalSearchParams<{ itemId?: string; id?: string }>();
  const { user } = useAuth();
  const { claims, getItem, createClaim, updateClaim } = useData();
  const editingClaim = id ? claims.find((c) => c.id === id) : undefined;
  const isEditing = Boolean(id);

  const item = getItem(editingClaim?.itemId ?? itemId ?? "");
  const [message, setMessage] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [proofImage, setProofImage] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editingClaim) return;
    setMessage(editingClaim.message);
    setContactNumber(editingClaim.contactNumber);
    setProofImage(editingClaim.proofImage ?? undefined);
  }, [editingClaim]);

  if (isEditing && (!editingClaim || editingClaim.userId !== user?.id)) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Stack.Screen options={{ title: "Edit Claim Request" }} />
        <Text style={{ color: colors.foreground }}>Claim not found</Text>
      </View>
    );
  }

  if (!item || !user) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground }}>Item not found</Text>
      </View>
    );
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (message.trim().length < 10) e.message = "Add a message of at least 10 characters";
    if (contactNumber.trim().length < 6) e.contactNumber = "Enter a valid contact number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      if (editingClaim) {
        await updateClaim(editingClaim.id, {
          message: message.trim(),
          contactNumber: contactNumber.trim(),
          proofImage: proofImage ?? null,
        });
        router.back();
      } else {
        const claim = await createClaim({
          itemId: item.id,
          userId: user.id,
          message: message.trim(),
          contactNumber: contactNumber.trim(),
          proofImage: proofImage ?? null,
        });
        router.replace(`/claims/${claim.id}` as never);
      }
    } finally {
      setBusy(false);
    }
  };

  const ScrollComp = Platform.OS === "web" ? ScrollView : KeyboardAwareScrollViewCompat;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: isEditing ? "Edit Claim Request" : "New Claim Request" }} />
      <ScrollComp
        contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 40, gap: 16 }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        <View
          style={{
            padding: 14,
            borderRadius: colors.radius,
            backgroundColor: colors.primarySoft,
            gap: 6,
          }}
        >
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <TypeBadge type={item.type} />
            <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 14, flex: 1 }} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13 }}>
            Provide details that prove this item belongs to you, then the owner/finder will respond.
          </Text>
        </View>

        <Input
          label="Your Message"
          placeholder="Describe how you can prove ownership..."
          multiline
          value={message}
          onChangeText={setMessage}
          error={errors.message}
        />

        <Input
          label="Contact Number"
          iconLeft="phone"
          keyboardType="phone-pad"
          placeholder="07X XXX XXXX"
          value={contactNumber}
          onChangeText={setContactNumber}
          error={errors.contactNumber}
        />

        <ImagePickerField value={proofImage} onChange={setProofImage} label="Proof Photo (optional)" />

        <Button title={isEditing ? "Save Changes" : "Send Claim Request"} onPress={onSubmit} loading={busy} />
      </ScrollComp>
    </View>
  );
}
