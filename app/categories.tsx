import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/Input";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { Category } from "@/lib/storage";


// Screen component for managing categories
export default function CategoriesScreen() {

  // Hooks for theme, navigation, auth, and data
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAuth();
  const { categories, items, createCategory, updateCategory, deleteCategory } = useData();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | undefined>();

  const openNew = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setError(undefined);
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description ?? "");
    setError(undefined);
    setModalOpen(true);
  };

  const onSave = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (editing) {
      await updateCategory(editing.id, { name: name.trim(), description: description.trim() });
    } else {
      await createCategory({ name: name.trim(), description: description.trim(), icon: "tag" });
    }
    setModalOpen(false);
  };

  const onDelete = (cat: Category) => {
    const used = items.some((i) => i.categoryId === cat.id);
    if (used) {
      const msg = "Cannot delete a category that is used by posts.";
      // @ts-ignore
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Cannot delete", msg);
      return;
    }
    const doIt = () => deleteCategory(cat.id);
    if (Platform.OS === "web") return doIt();
    Alert.alert(`Delete "${cat.name}"?`, undefined, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: doIt },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: "Categories",
          headerRight: isAdmin
            ? () => (
              <Pressable hitSlop={8} onPress={openNew}>
                <Feather name="plus" size={22} color={colors.primary} />
              </Pressable>
            )
            : undefined,
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: insets.bottom + 30 }}>
        {categories.length === 0 ? (
          <EmptyState icon="grid" title="No categories yet" description="Add some to organize posts." />
        ) : (
          categories.map((c) => {
            const count = items.filter((i) => i.categoryId === c.id).length;
            return (
              <View
                key={c.id}
                style={[
                  styles.row,
                  { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
                ]}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: colors.primarySoft,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather name={(c.icon as keyof typeof Feather.glyphMap) ?? "tag"} size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 15 }}>{c.name}</Text>
                  {c.description ? (
                    <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }}>
                      {c.description}
                    </Text>
                  ) : null}
                  <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 12, marginTop: 4 }}>
                    {count} post{count === 1 ? "" : "s"}
                  </Text>
                </View>
                {isAdmin ? (
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <Pressable hitSlop={8} onPress={() => openEdit(c)}>
                      <Feather name="edit-2" size={18} color={colors.primary} />
                    </Pressable>
                    <Pressable hitSlop={8} onPress={() => onDelete(c)}>
                      <Feather name="trash-2" size={18} color={colors.destructive} />
                    </Pressable>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setModalOpen(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.background, borderRadius: colors.radius + 4 }]}>
            <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 18, marginBottom: 14 }}>
              {editing ? "Edit Category" : "New Category"}
            </Text>
            <View style={{ gap: 12 }}>
              <Input label="Name" value={name} onChangeText={setName} error={error} />
              <Input label="Description (optional)" value={description} onChangeText={setDescription} multiline />
            </View>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" variant="ghost" onPress={() => setModalOpen(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title={editing ? "Save" : "Create"} onPress={onSave} />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 24,
  },
  modalSheet: {
    padding: 20,
  },
});
