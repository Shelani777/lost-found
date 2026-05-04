import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";

const { height } = Dimensions.get("window");

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [identityId, setIdentityId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setBusy(true);
    const res = await login(identityId, password);
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
    <View style={{ flex: 1, backgroundColor: "#0B041C" }}>
      {/* Background Ambient Glow */}
      <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
        <View style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: colors.primary, opacity: 0.15, filter: 'blur(50px)' }} />
      </View>

      {/* Hero Image at Top */}
      <View style={styles.imageContainer}>
        <Image
          source={require("@/assets/images/auth.png")}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(11, 4, 28, 0.95)', '#0B041C']}
          style={StyleSheet.absoluteFill}
          locations={[0.4, 0.8, 1]}
        />
      </View>

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
            style={[styles.backBtn, { backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)" }]}
          >
            <Feather name="chevron-left" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1, justifyContent: "flex-end" }}>
           {/* Glass Form Card */}
           <View style={styles.glassInner}>
             <View style={styles.headerWrap}>
               <Text style={[styles.headerTitle, { color: "#fff" }]}>Welcome Back</Text>
               <Text style={[styles.headerSubtitle, { color: "rgba(255,255,255,0.7)" }]}>
                 Login to your account to continue
               </Text>
             </View>

             <View style={styles.formContainer}>
               <Input
                 label="Student ID / NIC Number"
                 iconLeft="user"
                 placeholder="Enter Student ID or NIC"
                 value={identityId}
                 onChangeText={setIdentityId}
                 autoCapitalize="characters"
                 autoCorrect={false}
               />
               <Input
                 label="Password"
                 iconLeft="lock"
                 placeholder="Enter your password"
                 value={password}
                 onChangeText={setPassword}
                 isPassword
               />
               
               {error ? (
                 <View style={[styles.errorBox, { backgroundColor: "rgba(255,51,102,0.2)" }]}>
                   <Feather name="alert-circle" size={14} color={colors.destructive} />
                   <Text style={{ color: colors.destructive, fontFamily: "Inter_500Medium", fontSize: 13, flex: 1 }}>
                     {error}
                   </Text>
                 </View>
               ) : null}
             </View>

             <View style={styles.actionContainer}>
               <Button title="Login" onPress={onSubmit} loading={busy} style={{ height: 54, borderRadius: 16 }} />

               <View style={styles.footerWrap}>
                 <Text style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Inter_400Regular" }}>
                   Don't have an account?
                 </Text>
                 <Link href="/(auth)/register" replace>
                   <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold" }}>Register</Text>
                 </Link>
               </View>
             </View>
           </View>
        </View>
      </ScrollComp>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    width: "100%",
    height: height * 0.55,
    position: "absolute",
    top: 0,
    left: 0,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    zIndex: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(10px)",
  },
  glassInner: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderRadius: 32,
    padding: 24,
    backdropFilter: "blur(20px)",
    marginTop: height * 0.15, // Push down to let image show
  },
  headerWrap: {
    marginBottom: 24,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  formContainer: {
    gap: 16,
    marginBottom: 24,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  actionContainer: {
    gap: 20,
  },
  footerWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
  },
});
