import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { ImagePickerField } from "@/components/ImagePickerField";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";

export default function RegisterScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [identityId, setIdentityId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setBusy(true);
    const numAge = parseInt(age, 10);
    if (!numAge || numAge < 1) {
      setError("Please enter a valid age");
      setBusy(false);
      return;
    }
    if (!gender) {
      setError("Please select a gender");
      setBusy(false);
      return;
    }
    const res = await register({
      identityId,
      name,
      email,
      age: numAge,
      gender,
      phone,
      password,
      avatar,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.replace("/(tabs)");
  };

  const ScrollComp = Platform.OS === "web" ? ScrollView : KeyboardAwareScrollViewCompat;
  const webTopInset = Platform.OS === "web" ? 20 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollComp
        contentContainerStyle={{
          paddingTop: insets.top + webTopInset + 16,
          paddingBottom: insets.bottom + webBottomInset + 24,
          paddingHorizontal: 24,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        {/* Top Header & Back Button */}
        <View style={styles.topBar}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="chevron-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerWrap}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Create Account</Text>
          <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
            Join your campus Lost & Found community
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Avatar picker card */}
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Profile Picture
            </Text>
            <ImagePickerField
              label=""
              value={avatar}
              onChange={setAvatar}
              helper="Tap to upload profile pic"
              aspectRatio={1}
            />
          </View>

          {/* Personal info card */}
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Personal Information
            </Text>
            <View style={{ gap: 14 }}>
              <Input
                label="ID / NIC Number"
                iconLeft="credit-card"
                placeholder="Student IT Number or NIC"
                value={identityId}
                onChangeText={setIdentityId}
                autoCapitalize="characters"
              />
              <Input
                label="Full Name"
                iconLeft="user"
                placeholder="Your full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              <Input
                label="Email Address"
                iconLeft="mail"
                placeholder="your@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Age"
                    iconLeft="calendar"
                    placeholder="Age"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Select
                    label="Gender"
                    value={gender}
                    onChange={setGender}
                    options={[
                      { label: "Male", value: "Male" },
                      { label: "Female", value: "Female" },
                      { label: "Other", value: "Other" },
                    ]}
                  />
                </View>
              </View>
              <Input
                label="Phone Number"
                iconLeft="phone"
                placeholder="Contact number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Security card */}
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Security</Text>
            <Input
              label="Password"
              iconLeft="lock"
              placeholder="At least 6 characters"
              value={password}
              onChangeText={setPassword}
              isPassword
            />
          </View>
        </View>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: colors.destructiveSoft }]}>
            <Feather name="alert-circle" size={14} color={colors.destructive} />
            <Text style={{ color: colors.destructive, fontFamily: "Inter_500Medium", fontSize: 13, flex: 1 }}>
              {error}
            </Text>
          </View>
        ) : null}

        <View style={styles.actionContainer}>
          <Button title="Create Account" onPress={onSubmit} loading={busy} />

          <View style={styles.footerWrap}>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
              Already have an account?
            </Text>
            <Link href="/(auth)/login" replace>
              <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold" }}>Login</Text>
            </Link>
          </View>
        </View>

        <Text
          style={{
            textAlign: "center",
            color: colors.mutedForeground,
            fontFamily: "Inter_400Regular",
            fontSize: 12,
            marginTop: 10,
          }}
        >
          The first account registered becomes the admin.
        </Text>
      </ScrollComp>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerWrap: {
    marginBottom: 30,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
  },
  formContainer: {
    gap: 20,
    marginBottom: 30,
  },
  formCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    marginBottom: 2,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  actionContainer: {
    marginTop: "auto",
    gap: 20,
  },
  footerWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 10,
  },
});
