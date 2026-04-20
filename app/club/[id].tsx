import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ProductCard } from "../../src/features/products/components/ProductCard";
import { supabase } from "../../src/lib/supabase";
import { colors } from "../../src/theme/colors";
import { radius } from "../../src/theme/radius";
import { typography } from "../../src/theme/typography";

type ClubData = {
  id: string;
  name: string;
  cover_image: string | null;
  is_verified: boolean;
  requirements_json: Record<string, unknown> | null;
};

type ProductData = {
  id: string;
  name: string;
  strain_type: string;
  thc_avg: number | null;
  cbd_avg: number | null;
};

type InventoryJoinRow = {
  product_id: string;
  is_available: boolean;
  products: ProductData | ProductData[] | null;
};

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

export default function ClubProfileScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const clubId = params.id ?? "";
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState<ClubData | null>(null);
  const [menuProducts, setMenuProducts] = useState<ProductData[]>([]);

  useEffect(() => {
    const loadClubData = async () => {
      if (!clubId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data: clubData } = await supabase
        .from("clubs")
        .select("id, name, cover_image, is_verified, requirements_json")
        .eq("id", clubId)
        .maybeSingle();

      const { data: inventoryData } = await supabase
        .from("club_inventory")
        .select("product_id, is_available, products(id, name, strain_type, thc_avg, cbd_avg)")
        .eq("club_id", clubId)
        .eq("is_available", true);

      const products = ((inventoryData as InventoryJoinRow[] | null) ?? [])
        .map((item) => {
          if (!item.products) {
            return null;
          }
          return Array.isArray(item.products) ? item.products[0] : item.products;
        })
        .filter((item): item is ProductData => Boolean(item));

      setClub((clubData as ClubData | null) ?? null);
      setMenuProducts(products);
      setLoading(false);
    };

    void loadClubData();
  }, [clubId]);

  const requirementsText = club?.requirements_json
    ? JSON.stringify(club.requirements_json)
    : "DNI y edad mínima +18";

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.pine} />
            <Text style={styles.loadingText}>Cargando perfil del club...</Text>
          </View>
        ) : null}

        <Image
          source={{
            uri:
              club?.cover_image ||
              "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?q=80&w=1600&auto=format&fit=crop"
          }}
          style={styles.hero}
        />

        <View style={styles.headerRow}>
          <Text style={styles.clubName}>{club?.name ?? "Club no encontrado"}</Text>
          {club?.is_verified ? (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Verificado</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.clubMeta}>ID: {clubId}</Text>

        <View style={styles.requirementsCard}>
          <Text style={styles.requirementsTitle}>Requisitos de acceso</Text>
          <Text style={styles.requirementsText}>{requirementsText}</Text>
        </View>

        <Text style={styles.sectionTitle}>Menú disponible</Text>
        {menuProducts.map((item) => (
          <ProductCard
            key={item.id}
            name={item.name}
            type={normalizeStrainType(item.strain_type)}
            thcPercent={typeof item.thc_avg === "number" ? item.thc_avg : 0}
            cbdPercent={typeof item.cbd_avg === "number" ? item.cbd_avg : 0}
          />
        ))}
      </ScrollView>
      {clubId ? (
        <Pressable
          style={styles.floatingButton}
          onPress={() => router.push({ pathname: "/modals/create-post", params: { club_id: clubId } })}
        >
          <Text style={styles.floatingButtonText}>Escribir reseña</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    paddingBottom: 28
  },
  hero: {
    width: "100%",
    height: 220,
    backgroundColor: colors.border
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 14
  },
  clubName: {
    color: colors.textPrimary,
    ...typography.title,
    fontSize: 22
  },
  verifiedBadge: {
    backgroundColor: colors.eucalyptus,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  verifiedText: {
    color: colors.surface,
    ...typography.caption
  },
  clubMeta: {
    color: colors.textSecondary,
    ...typography.caption,
    paddingHorizontal: 16,
    marginTop: 4
  },
  requirementsCard: {
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 12
  },
  requirementsTitle: {
    color: colors.textPrimary,
    ...typography.subtitle
  },
  requirementsText: {
    color: colors.textSecondary,
    ...typography.body,
    marginTop: 4
  },
  sectionTitle: {
    color: colors.textPrimary,
    ...typography.subtitle,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginVertical: 10,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  loadingText: {
    marginLeft: 8,
    color: colors.textSecondary,
    ...typography.caption
  },
  floatingButton: {
    position: "absolute",
    right: 16,
    bottom: 22,
    backgroundColor: colors.pine,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  floatingButtonText: {
    color: colors.surface,
    ...typography.subtitle
  }
});
