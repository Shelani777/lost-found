import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

interface CurvedHeaderLayoutProps {
  title: string;
  children: React.ReactNode;
  illustration?: any;
  onBack?: () => void;
}

export function CurvedHeaderLayout({
  title,
  children,
  illustration,
  onBack,
}: CurvedHeaderLayoutProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Curved Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => (onBack ? onBack() : router.back())}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={{ width: 40 }} /> {/* Spacer for centering */}
          </View>
        </SafeAreaView>
        
        {/* The Curve */}
        <View style={[styles.curve, { backgroundColor: colors.primary }]} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Illustration Area */}
        {illustration && (
          <View style={styles.illustrationContainer}>
            <Image
              source={illustration}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Form Content */}
        <View style={styles.contentCard}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 140,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 10,
    position: 'relative',
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    textAlign: "center",
    flex: 1,
  },
  curve: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  scrollView: {
    flex: 1,
    marginTop: 0,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  illustrationContainer: {
    height: 200,
    width: width,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  illustration: {
    width: width * 0.8,
    height: "100%",
  },
  contentCard: {
    paddingHorizontal: 20,
  },
});
