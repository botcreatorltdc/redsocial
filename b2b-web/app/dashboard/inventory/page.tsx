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

type AuditRow = {
  id: string;
  action: string;
  created_at: string;
};

export default function InventoryPage() {
  const router = useRouter();
  const [clubId, setClubId] = useState<string>("");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [strainFilter, setStrainFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [auditRows, setAuditRows] = useState<AuditRow[]>([]);
  const pageSize = 8;

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

      const { data: auditData } = await supabase
        .from("inventory_audit_logs")
        .select("id, action, created_at")
        .eq("club_id", currentClubId)
        .order("created_at", { ascending: false })
        .limit(12);

      setProducts((productsData as ProductRow[] | null) ?? []);
      setActiveMap(nextMap);
      setAuditRows((auditData as AuditRow[] | null) ?? []);
      setLoading(false);
    };

    void loadInventoryData();
  }, [router]);

  const activeCount = useMemo(() => {
    return Object.values(activeMap).filter(Boolean).length;
  }, [activeMap]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const bySearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);
      const byStrain =
        strainFilter === "all" ||
        (product.strain_type || "").toLowerCase() === strainFilter.toLowerCase();
      const active = Boolean(activeMap[product.id]);
      const byStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && active) ||
        (statusFilter === "inactive" && !active);
      return bySearch && byStrain && byStatus;
    });
  }, [products, search, strainFilter, statusFilter, activeMap]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const visibleProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, page]);

  const pushAudit = async (action: string, productId?: string, details?: Record<string, unknown>) => {
    if (!clubId) return;
    const session = (await supabase.auth.getSession()).data.session;
    const actorId = session?.user.id;
    if (!actorId) return;

    const payload = {
      club_id: clubId,
      actor_id: actorId,
      product_id: productId ?? null,
      action,
      details: details ?? {}
    };
    await supabase.from("inventory_audit_logs").insert(payload);

    const { data: auditData } = await supabase
      .from("inventory_audit_logs")
      .select("id, action, created_at")
      .eq("club_id", clubId)
      .order("created_at", { ascending: false })
      .limit(12);
    setAuditRows((auditData as AuditRow[] | null) ?? []);
  };

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
    await pushAudit(
      `${nextValue ? "Activado" : "Desactivado"}: ${products.find((p) => p.id === productId)?.name || productId}`,
      productId,
      { is_available: nextValue }
    );
    setUpdatingId("");
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
  };

  const handleBulkUpdate = async (nextValue: boolean) => {
    if (!clubId || selectedIds.length === 0) return;
    setError("");
    const payload = selectedIds.map((productId) => ({
      club_id: clubId,
      product_id: productId,
      is_available: nextValue
    }));
    const { error: upsertError } = await supabase
      .from("club_inventory")
      .upsert(payload, { onConflict: "club_id,product_id" });
    if (upsertError) {
      setError("No se pudo completar la edición en lote.");
      return;
    }
    setActiveMap((prev) => {
      const next = { ...prev };
      selectedIds.forEach((id) => {
        next[id] = nextValue;
      });
      return next;
    });
    await pushAudit(`Lote ${nextValue ? "activado" : "desactivado"} (${selectedIds.length} productos)`, undefined, {
      product_ids: selectedIds,
      is_available: nextValue
    });
    setSelectedIds([]);
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

        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar producto..."
            className="rounded-2xl border border-botanical-line bg-botanical-bg px-4 py-3 text-sm outline-none"
          />
          <select
            value={strainFilter}
            onChange={(e) => {
              setStrainFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-2xl border border-botanical-line bg-botanical-bg px-4 py-3 text-sm outline-none"
          >
            <option value="all">Tipo: todos</option>
            <option value="sativa">Sativa</option>
            <option value="indica">Indica</option>
            <option value="cbd">CBD</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-2xl border border-botanical-line bg-botanical-bg px-4 py-3 text-sm outline-none"
          >
            <option value="all">Estado: todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-full border border-botanical-primary px-4 py-2 text-xs text-botanical-primary"
              onClick={() => void handleBulkUpdate(true)}
              disabled={selectedIds.length === 0}
            >
              Activar lote
            </button>
            <button
              type="button"
              className="rounded-full border border-botanical-line px-4 py-2 text-xs text-botanical-muted"
              onClick={() => void handleBulkUpdate(false)}
              disabled={selectedIds.length === 0}
            >
              Desactivar lote
            </button>
          </div>
        </div>

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
              {visibleProducts.map((product) => {
                const isActive = Boolean(activeMap[product.id]);
                const isBusy = updatingId === product.id;
                const strainKey = (product.strain_type || "").toLowerCase();

                return (
                  <tr key={product.id} className="rounded-2xl bg-botanical-bg">
                    <td className="rounded-l-2xl px-3 py-4 font-medium text-botanical-text">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={() => toggleSelection(product.id)}
                        />
                        <span>{product.name}</span>
                      </label>
                    </td>
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

        <div className="mt-4 flex items-center justify-between text-xs text-botanical-muted">
          <span>
            Página {page} de {totalPages} - {filteredProducts.length} resultados
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="rounded-full border border-botanical-line px-3 py-1"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              className="rounded-full border border-botanical-line px-3 py-1"
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-botanical-line bg-white p-6">
        <h2 className="font-serif text-2xl text-botanical-primary">Historial de cambios</h2>
        {auditRows.length === 0 ? (
          <p className="mt-3 text-sm text-botanical-muted">Aún no hay cambios registrados.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-botanical-text">
            {auditRows.map((item) => (
              <li key={item.id} className="rounded-2xl bg-botanical-bg px-3 py-2">
                {item.action} -{" "}
                <span className="text-botanical-muted">
                  {new Date(item.created_at).toLocaleString("es-ES")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
