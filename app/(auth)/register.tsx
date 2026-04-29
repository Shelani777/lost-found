import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";

export default function RegisterScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setBusy(true);
    const res = await register(name, email, password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.replace("/(tabs)");
  };

  const ScrollComp = Platform.OS === "web" ? ScrollView : KeyboardAwareScrollViewCompat;
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollComp
        contentContainerStyle={{
          paddingTop: insets.top + webTopInset + 10,
          paddingBottom: insets.bottom + webBottomInset + 24,
          paddingHorizontal: 22,
          gap: 22,
        }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        <View style={{ alignItems: "center" }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Join your campus Lost & Found community
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Image
            source={require("@/assets/images/welcome-illustration.png")}
            style={{ width: 200, height: 200 }}
            contentFit="contain"
          />
        </View>
        <View style={{ gap: 14 }}>
          <Input
            label="Full Name"
            iconLeft="user"
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <Input
            label="Email"
            iconLeft="mail"
            placeholder="Email account"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            label="Password"
            iconLeft="lock"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={setPassword}
            isPassword
          />
          {error ? (
            <Text style={{ color: colors.destructive, fontFamily: "Inter_500Medium", fontSize: 13 }}>
              {error}
            </Text>
          ) : null}
        </View>
        <Button title="Create Account" onPress={onSubmit} loading={busy} />
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
            Already have an account?
          </Text>
          <Link href="/(auth)/login" replace>
            <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold" }}>Login</Text>
          </Link>
        </View>
        <Text
          style={{
            textAlign: "center",
            color: colors.mutedForeground,
            fontFamily: "Inter_400Regular",
            fontSize: 12,
            marginTop: -4,
          }}
        >
          The first account becomes the admin.
        </Text>
      </ScrollComp>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: "Inter_700Bold", fontSize: 26 },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
