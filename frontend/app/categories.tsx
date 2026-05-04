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

export default function CategoriesScreen() {
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
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setError(undefined);
    setSaving(false);
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description ?? "");
    setError(undefined);
    setSaving(false);
    setModalOpen(true);
  };

  const onSave = async () => {
    if (saving) return;
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      if (editing) {
        await updateCategory(editing.id, { name: name.trim(), description: description.trim() });
      } else {
        await createCategory({ name: name.trim(), description: description.trim(), icon: "tag" });
      }
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save category");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = (cat: Category) => {
    const used = items.some((i) => i.categoryId === cat.id);
    if (used) {
      const msg = "Cannot delete a category that is used by posts.";
      // @ts-ignore
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Cannot delete", msg);
      return;
    }
    const doIt = async () => {
      try {
        await deleteCategory(cat.id);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Could not delete category";
        // @ts-ignore
        Platform.OS === "web" ? window.alert(msg) : Alert.alert("Delete failed", msg);
      }
    };
    if (Platform.OS === "web") {
      // @ts-ignore
      if (window.confirm(`Delete "${cat.name}"?`)) void doIt();
      return;
    }
    Alert.alert(`Delete "${cat.name}"?`, undefined, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: doIt },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0B041C" }}>
      {/* Background Ambient Gradients */}
      <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
        <View style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: colors.primary, opacity: 0.15, filter: 'blur(50px)' }} />
      </View>

      <Stack.Screen
        options={{
          title: "Categories",
          headerTitleStyle: { color: "#fff", fontFamily: "Inter_700Bold" },
          headerStyle: { backgroundColor: "#0B041C" },
          headerTintColor: "#fff",
          headerRight: isAdmin
            ? () => (
              <Pressable hitSlop={8} onPress={openNew}>
                <Feather name="plus" size={24} color={colors.primary} />
              </Pressable>
            )
            : undefined,
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 18, gap: 14, paddingBottom: insets.bottom + 30 }}>
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
                  { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)", borderRadius: 20 },
                ]}
              >
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    backgroundColor: "rgba(255,255,255,0.08)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather name={(c.icon as keyof typeof Feather.glyphMap) ?? "tag"} size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 }}>{c.name}</Text>
                  {c.description ? (
                    <Text style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 }}>
                      {c.description}
                    </Text>
                  ) : null}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />
                    <Text style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Inter_600SemiBold", fontSize: 12 }}>
                      {count} post{count === 1 ? "" : "s"}
                    </Text>
                  </View>
                </View>
                {isAdmin ? (
                  <View style={{ flexDirection: "row", gap: 16 }}>
                    <Pressable hitSlop={8} onPress={() => openEdit(c)}>
                      <Feather name="edit-2" size={18} color="rgba(255,255,255,0.6)" />
                    </Pressable>
                    <Pressable hitSlop={8} onPress={() => onDelete(c)}>
                      <Feather name="trash-2" size={18} color="rgba(255,51,102,0.6)" />
                    </Pressable>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setModalOpen(false)} />
          <View style={[styles.modalSheet, { backgroundColor: "#1A0F2E", borderColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderRadius: 28 }]}>
            <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 20, marginBottom: 18 }}>
              {editing ? "Edit Category" : "New Category"}
            </Text>
            <View style={{ gap: 16 }}>
              <Input label="Name" value={name} onChangeText={setName} error={error} />
              <Input label="Description (optional)" value={description} onChangeText={setDescription} multiline />
            </View>
            <View style={{ flexDirection: "row", gap: 12, marginTop: 24 }}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" variant="ghost" onPress={() => setModalOpen(false)} style={{ borderColor: "rgba(255,255,255,0.1)", borderWidth: 1 }} textStyle={{ color: "rgba(255,255,255,0.6)" }} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title={editing ? "Save" : "Create"} onPress={onSave} loading={saving} disabled={saving} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderWidth: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 24,
  },
  modalSheet: {
    padding: 24,
  },
});
