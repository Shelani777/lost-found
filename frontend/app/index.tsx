import { Redirect } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";

export default function Entry() {
  const { user, ready } = useAuth();
  const colors = useColors();

  // Ensure splash shows for at least 2.5 seconds
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const shouldShowSplash = !ready || !minTimeElapsed;

  if (shouldShowSplash) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Animated.View
          style={{
            alignItems: "center",
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
        >
          <View style={[styles.iconBg, { backgroundColor: colors.primary }]}>
            <Feather name="search" size={36} color="#fff" />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Lost & Found</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Setting things up...</Text>
        </Animated.View>
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/welcome" />;
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  iconBg: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
