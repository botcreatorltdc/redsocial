import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { supabase } from "../../src/lib/supabase";
import { colors } from "../../src/theme/colors";
import { radius } from "../../src/theme/radius";
import { typography } from "../../src/theme/typography";

type ProductOption = {
  id: string;
  name: string;
};

export default function CreatePostModal() {
  const params = useLocalSearchParams<{ club_id?: string; clubId?: string }>();
  const clubId = params.club_id ?? params.clubId ?? "";
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      const { data, error } = await supabase
        .from("products")
        .select("id, name")
        .order("name", { ascending: true });

      if (error || !data) {
        setProducts([]);
        setLoadingProducts(false);
        return;
      }

      const nextProducts = data as ProductOption[];
      setProducts(nextProducts);
      if (nextProducts.length > 0) {
        setSelectedProductId(nextProducts[0].id);
      }
      setLoadingProducts(false);
    };

    void loadProducts();
  }, []);

  const canSubmit = useMemo(() => {
    return content.trim().length >= 5 && Boolean(selectedProductId) && !submitting;
  }, [content, selectedProductId, submitting]);

  const handleCreateReview = async () => {
    setErrorMessage("");
    const { data: userData } = await supabase.auth.getUser();
    const author = userData.user;

    if (!author) {
      router.replace("/(auth)/sign-in");
      return;
    }

    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    const basePayload = {
      author_id: author.id,
      target_type: "product" as const,
      target_id: selectedProductId,
      rating,
      content_text: content.trim(),
      images_array: []
    };

    const payload = clubId
      ? {
          ...basePayload,
          content_text: `[Club:${clubId}] ${basePayload.content_text}`
        }
      : basePayload;

    const { error } = await (supabase as any).from("reviews").insert(payload);

    if (error) {
      setErrorMessage("No se pudo publicar la reseña.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Escribir reseña</Text>
        <Text style={styles.subtitle}>Comparte tu experiencia wellness con la comunidad</Text>

        <Text style={styles.label}>Tu reseña</Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Describe tu experiencia..."
          placeholderTextColor={colors.textSecondary}
          multiline
          style={styles.textArea}
        />

        <Text style={styles.label}>Puntuación</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable
              key={star}
              onPress={() => setRating(star)}
              style={[styles.starButton, rating === star && styles.starButtonActive]}
            >
              <Text style={[styles.starText, rating === star && styles.starTextActive]}>{star}★</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Variedad</Text>
        {loadingProducts ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.pine} />
            <Text style={styles.loadingText}>Cargando productos...</Text>
          </View>
        ) : (
          <View style={styles.productsList}>
            {products.map((product) => {
              const selected = product.id === selectedProductId;
              return (
                <Pressable
                  key={product.id}
                  onPress={() => setSelectedProductId(product.id)}
                  style={[styles.productItem, selected && styles.productItemActive]}
                >
                  <Text style={[styles.productText, selected && styles.productTextActive]}>
                    {product.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Pressable style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]} onPress={handleCreateReview} disabled={!canSubmit}>
          <Text style={styles.submitButtonText}>{submitting ? "Publicando..." : "Publicar reseña"}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 16,
    paddingBottom: 36
  },
  title: {
    color: colors.textPrimary,
    ...typography.title
  },
  subtitle: {
    color: colors.textSecondary,
    ...typography.body,
    marginTop: 4
  },
  label: {
    color: colors.textPrimary,
    ...typography.subtitle,
    marginTop: 14,
    marginBottom: 8
  },
  textArea: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    minHeight: 120,
    textAlignVertical: "top",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    ...typography.body
  },
  starsRow: {
    flexDirection: "row"
  },
  starButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 8
  },
  starButtonActive: {
    backgroundColor: colors.sage,
    borderColor: colors.sage
  },
  starText: {
    color: colors.textPrimary
  },
  starTextActive: {
    color: colors.surface
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  loadingText: {
    marginLeft: 8,
    color: colors.textSecondary
  },
  productsList: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8
  },
  productItem: {
    borderRadius: radius.md,
    paddingVertical: 9,
    paddingHorizontal: 10
  },
  productItemActive: {
    backgroundColor: colors.sage
  },
  productText: {
    color: colors.textPrimary,
    ...typography.body
  },
  productTextActive: {
    color: colors.surface
  },
  errorText: {
    marginTop: 10,
    color: "#C25454",
    ...typography.caption
  },
  submitButton: {
    marginTop: 18,
    backgroundColor: colors.pine,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: "center"
  },
  submitButtonDisabled: {
    opacity: 0.6
  },
  submitButtonText: {
    color: colors.surface,
    ...typography.subtitle
  }
});
