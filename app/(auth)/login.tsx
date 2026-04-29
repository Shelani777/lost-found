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

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setBusy(true);
    const res = await login(email, password);
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
        <View style={{ alignItems: "center", marginTop: 4 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Welcome Back!</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Login to your account</Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Image
            source={require("@/assets/images/welcome-illustration.png")}
            style={{ width: 240, height: 240 }}
            contentFit="contain"
          />
        </View>
        <View style={{ gap: 14 }}>
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
            placeholder="Enter password"
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
        <Button title="Login" onPress={onSubmit} loading={busy} />
        <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}>
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
            Don't have an account?
          </Text>
          <Link href="/(auth)/register" replace>
            <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold" }}>Register</Text>
          </Link>
        </View>
      </ScrollComp>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: "Inter_700Bold", fontSize: 26 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 15, marginTop: 6 },
});
