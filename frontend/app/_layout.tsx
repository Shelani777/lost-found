import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/lib/auth-context";
import { DataProvider } from "@/lib/data-context";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

import { useTheme } from "@/lib/theme-context";
import { useColors } from "@/hooks/useColors";

function RootLayoutNav() {
  const { isDark } = useTheme();
  const colors = useColors();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerBackTitle: "Back",
          headerTitleStyle: { fontFamily: "Inter_700Bold" },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="items/add" options={{ title: "Post Item", presentation: "modal" }} />
        <Stack.Screen name="items/[id]" options={{ title: "Item Details" }} />
        <Stack.Screen name="items/edit/[id]" options={{ title: "Edit Item" }} />
        <Stack.Screen name="my-posts" options={{ title: "My Posts" }} />
        <Stack.Screen name="claims/index" options={{ title: "Claim Requests" }} />
        <Stack.Screen name="claims/new" options={{ title: "Submit Claim", presentation: "modal" }} />
        <Stack.Screen name="claims/[id]" options={{ title: "Claim Details" }} />
        <Stack.Screen name="reports/index" options={{ title: "My Reports" }} />
        <Stack.Screen name="reports/new" options={{ title: "Submit Report", presentation: "modal" }} />
        <Stack.Screen name="announcements/index" options={{ title: "Announcements" }} />
        <Stack.Screen name="announcements/[id]" options={{ title: "Announcement" }} />
        <Stack.Screen name="announcements/new" options={{ title: "New Announcement", presentation: "modal" }} />
        <Stack.Screen name="categories" options={{ title: "Categories" }} />
        <Stack.Screen name="admin/index" options={{ title: "Admin Dashboard" }} />
        <Stack.Screen name="admin/posts" options={{ title: "Manage Posts" }} />
        <Stack.Screen name="admin/reports" options={{ title: "Review Reports" }} />
        <Stack.Screen name="admin/users" options={{ title: "Users" }} />
      </Stack>
    </>
  );
}

import { ThemeProvider } from "@/lib/theme-context";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <DataProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <KeyboardProvider>
                    <RootLayoutNav />
                  </KeyboardProvider>
                </GestureHandlerRootView>
              </DataProvider>
            </AuthProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
