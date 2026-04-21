"use client";

import { useEffect, useMemo, useState } from "react";
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

      if (clubError) {
        setError("No se pudo validar el club asociado a tu usuario.");
        setLoading(false);
        return;
      }

      if (!club) {
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

  if (loading) return <main className="grid min-h-[70vh] place-items-center text-botanical-muted">Cargando inventario...</main>;

  const badgeStyles: Record<string, string> = {
    sativa: "bg-emerald-100 text-emerald-700",
    indica: "bg-violet-100 text-violet-700",
    cbd: "bg-amber-100 text-amber-700"
  };

  return (
    <main className="space-y-5">
      <section className="rounded-3xl border border-botanical-line bg-white p-6 shadow-botanical">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-4xl text-botanical-primary">Inventory Management</h1>
            <p className="mt-2 text-sm text-botanical-muted">Productos activos: {activeCount}</p>
          </div>
        </header>

        {error ? <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.1em] text-botanical-muted">
                <th className="px-3">Producto</th>
                <th className="px-3">Categoría</th>
                <th className="px-3">Tipo</th>
                <th className="px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isActive = Boolean(activeMap[product.id]);
                const isBusy = updatingId === product.id;
                const strainKey = (product.strain_type || "").toLowerCase();

                return (
                  <tr key={product.id} className="rounded-2xl bg-botanical-bg">
                    <td className="rounded-l-2xl px-3 py-4 font-medium text-botanical-text">{product.name}</td>
                    <td className="px-3 py-4 text-botanical-muted">{product.category}</td>
                    <td className="px-3 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.08em] ${
                          badgeStyles[strainKey] ?? "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {product.strain_type}
                      </span>
                    </td>
                    <td className="rounded-r-2xl px-3 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggle(product.id)}
                        disabled={isBusy}
                        className={`relative inline-flex h-8 w-16 items-center rounded-full border transition ${
                          isActive
                            ? "border-botanical-primary bg-botanical-primary/20"
                            : "border-botanical-line bg-white"
                        } ${isBusy ? "opacity-70" : ""}`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-botanical-primary transition ${
                            isActive ? "translate-x-8" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
