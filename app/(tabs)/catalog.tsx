import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { InlineError, PrimaryEmptyAction, SectionHeader } from "../../src/components/AppUi";
import { SkeletonList, StateCard } from "../../src/components/StateCard";
import { ProductCard } from "../../src/features/products/components/ProductCard";
import { supabase } from "../../src/lib/supabase";
import { colors } from "../../src/theme/colors";
import { radius } from "../../src/theme/radius";
import { typography } from "../../src/theme/typography";

type WellnessCategory = "Dormir" | "Creatividad" | "Energía" | "Alivio";

type ProductItem = {
  id: string;
  name: string;
  strainType: string;
  thcPercent: number;
  cbdPercent: number;
  effects: string[];
};

const categories: WellnessCategory[] = [
  "Dormir",
  "Creatividad",
  "Energía",
  "Alivio"
];

function normalizeStrainType(value: string): "Índica" | "Sativa" | "CBD" | "Híbrida" {
  const strain = value.toLowerCase();
  if (strain.includes("indica")) {
    return "Índica";
  }
  if (strain.includes("sativa")) {
    return "Sativa";
  }
  if (strain.includes("cbd")) {
    return "CBD";
  }
  return "Híbrida";
}

function matchesCategory(product: ProductItem, category: WellnessCategory) {
  const effectsText = product.effects.join(" ").toLowerCase();

  if (category === "Dormir") {
    return (
      product.strainType.toLowerCase().includes("indica") ||
      effectsText.includes("dorm") ||
      effectsText.includes("sleep")
    );
  }
  if (category === "Creatividad") {
    return effectsText.includes("creativ");
  }
  if (category === "Energía") {
    return (
      product.strainType.toLowerCase().includes("sativa") ||
      effectsText.includes("energ")
    );
  }
  return effectsText.includes("alivio") || effectsText.includes("relief") || effectsText.includes("pain");
}

export default function CatalogScreen() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<WellnessCategory>("Dormir");
  const [error, setError] = useState("");

  const loadProducts = async () => {
      if (!refreshing) setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("id, name, strain_type, thc_avg, cbd_avg, effects_json")
        .order("name", { ascending: true });

      if (error || !data) {
        setError("No se pudo cargar el catálogo.");
        setProducts([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      setError("");

      const rows = (data as any[]) ?? [];
      const mapped: ProductItem[] = rows.map((product) => ({
        id: product.id,
        name: product.name,
        strainType: product.strain_type,
        thcPercent: typeof product.thc_avg === "number" ? product.thc_avg : 0,
        cbdPercent: typeof product.cbd_avg === "number" ? product.cbd_avg : 0,
        effects: Array.isArray(product.effects_json)
          ? product.effects_json.map((effect: unknown) => String(effect))
          : []
      }));

      setProducts(mapped);
      setLoading(false);
      setRefreshing(false);
    };

  useEffect(() => {
    void loadProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    void loadProducts();
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const categoryMatch = matchesCategory(product, activeCategory);
      const matchesSearch =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        normalizeStrainType(product.strainType).toLowerCase().includes(query);
      return categoryMatch && matchesSearch;
    });
  }, [products, search, activeCategory]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.pine} />}
      >
        <SectionHeader title="Biblioteca Botánica" subtitle="Explora variedades por efecto y tipo." />
        {error ? <InlineError message={error} /> : null}
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.pine} />
            <Text style={styles.loadingText}>Cargando catálogo...</Text>
          </View>
        ) : null}

        <TextInput
          placeholder="Buscar variedad o tipo..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {categories.map((category) => {
            const selected = category === activeCategory;
            return (
              <Pressable
                key={category}
                style={[styles.categoryButton, selected && styles.categoryButtonActive]}
                onPress={() => setActiveCategory(category)}
              >
                <Text style={[styles.categoryText, selected && styles.categoryTextActive]}>{category}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.list}>
          {loading ? (
            <SkeletonList count={2} height={96} />
          ) : filteredProducts.length === 0 ? (
            <View>
              <StateCard title="Sin resultados" description="Prueba otro término o cambia la categoría." variant="empty" />
              <PrimaryEmptyAction label="Limpiar búsqueda" onPress={() => setSearch("")} />
            </View>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                type={normalizeStrainType(product.strainType)}
                thcPercent={product.thcPercent}
                cbdPercent={product.cbdPercent}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    paddingTop: 16,
    paddingBottom: 28,
    paddingHorizontal: 16
  },
  search: {
    marginTop: 12,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    ...typography.body
  },
  categories: {
    paddingVertical: 12
  },
  categoryButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8
  },
  categoryButtonActive: {
    backgroundColor: colors.sage,
    borderColor: colors.sage
  },
  categoryText: {
    color: colors.textPrimary,
    ...typography.caption
  },
  categoryTextActive: {
    color: colors.surface
  },
  list: {
    marginTop: 2
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10
  },
  loadingText: {
    marginLeft: 8,
    color: colors.textSecondary,
    ...typography.caption
  }
});
