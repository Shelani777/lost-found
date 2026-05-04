import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { Button } from "@/components/Button";
import { useColors } from "@/hooks/useColors";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#0B041C" }}>
      {/* Background ambient light */}
      <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
        <View style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: colors.primary, opacity: 0.15, filter: 'blur(50px)' }} />
      </View>

      {/* 3D Illustration filling top section */}
      <View style={styles.imageContainer}>
        <Image
          source={require("@/assets/images/auth.png")}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(11, 4, 28, 0.95)', '#0B041C']}
          style={StyleSheet.absoluteFill}
          locations={[0.5, 0.9, 1]}
        />
      </View>

      {/* Glassmorphic Bottom Pane */}
      <View style={[styles.glassPane, { paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.glassInner}>
          <Text style={styles.title}>
            Lost <Text style={{ color: colors.primary }}>&</Text> Found
          </Text>
          <Text style={styles.subtitle}>
            Reunite with what matters. The smart and secure way to report, find, and claim items on campus.
          </Text>

          <View style={styles.dotContainer}>
            <View style={styles.activeDot} />
            <View style={styles.inactiveDot} />
            <View style={styles.inactiveDot} />
          </View>

          <View style={styles.actionSection}>
            <Button
              title="Login to Account"
              onPress={() => router.push("/(auth)/login")}
              style={styles.button}
            />
            <Button
              title="Create an Account"
              variant="secondary"
              onPress={() => router.push("/(auth)/register")}
              style={[styles.button, { backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 0 }]}
              textStyle={{ color: "#fff" }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    width: "100%",
    height: height * 0.65,
    position: "absolute",
    top: 0,
    left: 0,
  },
  glassPane: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
  },
  glassInner: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderRadius: 32,
    padding: 32,
    alignItems: "center",
    backdropFilter: "blur(20px)",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  dotContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 32,
  },
  activeDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#B92B8A",
  },
  inactiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  actionSection: {
    width: "100%",
    gap: 14,
  },
  button: {
    borderRadius: 16,
    height: 54,
  },
});
