"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type ProductRow = {
  id: string;
  name: string;
  category: string;
  strain_type: string;
};

type InventoryRow = {
  product_id: string;
  is_available: boolean;
};

export default function InventoryPage() {
  const router = useRouter();
  const [clubId, setClubId] = useState<string>("");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string>("");

  useEffect(() => {
    const loadInventoryData = async () => {
      setLoading(true);
      setError("");

      const session = (await supabase.auth.getSession()).data.session;
      const userId = session?.user.id;

      if (!userId) {
        router.replace("/");
        return;
      }

      const { data: club, error: clubError } = await supabase
        .from("clubs")
        .select("id")
        .eq("owner_id", userId)
        .limit(1)
        .maybeSingle();

      if (clubError || !club) {
        router.replace("/dashboard/onboarding");
        return;
      }

      const currentClubId = club.id as string;
      setClubId(currentClubId);

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, name, category, strain_type")
        .order("name", { ascending: true });

      if (productsError) {
        setError("No se pudieron cargar los productos globales.");
        setLoading(false);
        return;
      }

      const { data: inventoryData, error: inventoryError } = await supabase
        .from("club_inventory")
        .select("product_id, is_available")
        .eq("club_id", currentClubId);

      if (inventoryError) {
        setError("No se pudo cargar tu inventario del club.");
        setLoading(false);
        return;
      }

      const nextMap: Record<string, boolean> = {};
      (inventoryData as InventoryRow[] | null)?.forEach((item) => {
        nextMap[item.product_id] = Boolean(item.is_available);
      });

      setProducts((productsData as ProductRow[] | null) ?? []);
      setActiveMap(nextMap);
      setLoading(false);
    };

    void loadInventoryData();
  }, [router]);

  const activeCount = useMemo(() => {
    return Object.values(activeMap).filter(Boolean).length;
  }, [activeMap]);

  const handleToggle = async (productId: string) => {
    if (!clubId) {
      return;
    }

    setUpdatingId(productId);
    setError("");
    const nextValue = !Boolean(activeMap[productId]);

    const { error: upsertError } = await supabase.from("club_inventory").upsert(
      {
        club_id: clubId,
        product_id: productId,
        is_available: nextValue
      },
      {
        onConflict: "club_id,product_id"
      }
    );

    if (upsertError) {
      setError("No se pudo actualizar el estado del producto.");
      setUpdatingId("");
      return;
    }

    setActiveMap((prev) => ({ ...prev, [productId]: nextValue }));
    setUpdatingId("");
  };

  if (loading) {
    return <main style={styles.loading}>Cargando inventario...</main>;
  }

  return (
    <main style={styles.main}>
      <section style={styles.card}>
        <header style={styles.header}>
          <h1 style={styles.title}>Gestor de Inventario</h1>
          <p style={styles.subtitle}>Productos activos: {activeCount}</p>
        </header>

        {error ? <p style={styles.error}>{error}</p> : null}

        <div style={styles.table}>
          <div style={styles.thead}>
            <span>Producto</span>
            <span>Categoría</span>
            <span>Tipo</span>
            <span>Disponible</span>
          </div>

          {products.map((product) => {
            const isActive = Boolean(activeMap[product.id]);
            const isBusy = updatingId === product.id;

            return (
              <div key={product.id} style={styles.row}>
                <span style={styles.productName}>{product.name}</span>
                <span style={styles.cellMuted}>{product.category}</span>
                <span style={styles.cellMuted}>{product.strain_type}</span>
                <button
                  type="button"
                  onClick={() => handleToggle(product.id)}
                  disabled={isBusy}
                  style={{
                    ...styles.toggle,
                    ...(isActive ? styles.toggleOn : styles.toggleOff),
                    opacity: isBusy ? 0.7 : 1
                  }}
                >
                  {isBusy ? "..." : isActive ? "Activo" : "Inactivo"}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  loading: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#F7F6F2",
    color: "#60706A"
  },
  main: {
    minHeight: "100vh",
    background: "#F7F6F2",
    padding: "24px",
    display: "grid",
    placeItems: "start center"
  },
  card: {
    width: "100%",
    maxWidth: "1000px",
    background: "#FFFFFF",
    border: "1px solid #DFE8E2",
    borderRadius: "16px",
    padding: "20px"
  },
  header: {
    marginBottom: "14px"
  },
  title: {
    margin: 0,
    color: "#24312C"
  },
  subtitle: {
    margin: "4px 0 0 0",
    color: "#60706A"
  },
  error: {
    margin: "0 0 12px 0",
    color: "#C25454"
  },
  table: {
    display: "grid",
    gap: "8px"
  },
  thead: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr auto",
    gap: "10px",
    color: "#60706A",
    fontSize: "13px",
    padding: "0 2px"
  },
  row: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr auto",
    gap: "10px",
    alignItems: "center",
    border: "1px solid #DFE8E2",
    borderRadius: "12px",
    background: "#FFFFFF",
    padding: "10px 12px"
  },
  productName: {
    color: "#24312C",
    fontWeight: 600
  },
  cellMuted: {
    color: "#60706A"
  },
  toggle: {
    border: "none",
    borderRadius: "999px",
    padding: "7px 12px",
    fontWeight: 600,
    cursor: "pointer"
  },
  toggleOn: {
    background: "#2F5D50",
    color: "#FFFFFF"
  },
  toggleOff: {
    background: "#EEF3EF",
    color: "#2F5D50"
  }
};
