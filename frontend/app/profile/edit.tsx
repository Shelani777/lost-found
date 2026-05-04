import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";

const { height } = Dimensions.get("window");

export default function EditProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSave = async () => {
    if (!name.trim()) return Alert.alert("Error", "Name is required");
    if (!email.trim()) return Alert.alert("Error", "Email is required");
    if (!phone.trim()) return Alert.alert("Error", "Phone is required");

    setBusy(true);
    try {
      const patch: any = { name: name.trim(), email: email.trim(), phone: phone.trim(), avatar: avatar.trim() };
      if (password.length >= 6) {
        patch.password = password;
      } else if (password.length > 0) {
        setBusy(false);
        return Alert.alert("Error", "Password must be at least 6 characters");
      }

      await updateProfile(patch);
      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setBusy(false);
    }
  };

  const ScrollComp = Platform.OS === "web" ? ScrollView : KeyboardAwareScrollViewCompat;

  return (
    <View style={{ flex: 1, backgroundColor: "#0B041C" }}>
      {/* Background Ambient Glow */}
      <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
        <View style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: colors.primary, opacity: 0.15, filter: 'blur(50px)' }} />
      </View>

      <ScrollComp
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={[styles.avatar, { backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" }]}>
                <Feather name="user" size={40} color="rgba(255,255,255,0.4)" />
              </View>
            )}
            <TouchableOpacity style={styles.editIconWrap} onPress={() => {
              // In a real app, this would open an image picker. 
              // Here we just prompt for a URL for simplicity.
              if (Platform.OS === "web") {
                const url = window.prompt("Enter image URL:", avatar);
                if (url !== null) setAvatar(url);
              } else {
                Alert.prompt("Avatar URL", "Enter image URL:", (url) => setAvatar(url), "plain-text", avatar);
              }
            }}>
              <Feather name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.glassCard}>
          <View style={styles.form}>
            <Input
              label="ID / NIC (Read-only)"
              value={user?.identityId}
              editable={false}
              iconLeft="shield"
              style={{ opacity: 0.6 }}
            />
            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              iconLeft="user"
              placeholder="Your name"
            />
            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              iconLeft="mail"
              placeholder="example@mail.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Input
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              iconLeft="phone"
              placeholder="0XXXXXXXXX"
              keyboardType="phone-pad"
            />
            <Input
              label="New Password (optional)"
              value={password}
              onChangeText={setPassword}
              iconLeft="lock"
              placeholder="At least 6 characters"
              isPassword
            />
            
            <View style={{ marginTop: 10 }}>
              <Button title="Save Changes" onPress={onSave} loading={busy} style={{ height: 56, borderRadius: 16 }} />
            </View>
          </View>
        </View>
      </ScrollComp>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#fff",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
  },
  editIconWrap: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#B92B8A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0B041C",
  },
  glassCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderRadius: 32,
    padding: 24,
    backdropFilter: "blur(20px)",
  },
  form: {
    gap: 16,
  },
});
