"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type SpotReport = {
  id: string;
  reason: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  created_at: string;
  spot_id: string;
};

type SpotRow = {
  id: string;
  name: string;
};

export default function ModerationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reports, setReports] = useState<SpotReport[]>([]);
  const [spotNames, setSpotNames] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState("");

  const loadReports = async () => {
    setLoading(true);
    setError("");
    const session = (await supabase.auth.getSession()).data.session;
    const userId = session?.user.id;
    if (!userId) {
      router.replace("/");
      return;
    }

    const { data: reportData, error: reportsError } = await (supabase as any)
      .from("smoke_spot_reports")
      .select("id, reason, status, created_at, spot_id")
      .order("created_at", { ascending: false })
      .limit(100);
    if (reportsError) {
      setError("No se pudieron cargar los reportes.");
      setLoading(false);
      return;
    }
    const rows = (reportData as SpotReport[] | null) ?? [];
    const uniqueSpotIds = [...new Set(rows.map((row) => row.spot_id))];
    if (uniqueSpotIds.length > 0) {
      const { data: spotsData } = await (supabase as any)
        .from("smoke_spots")
        .select("id, name")
        .in("id", uniqueSpotIds);
      const map: Record<string, string> = {};
      ((spotsData as SpotRow[] | null) ?? []).forEach((spot) => {
        map[spot.id] = spot.name;
      });
      setSpotNames(map);
    } else {
      setSpotNames({});
    }
    setReports(rows);
    setLoading(false);
  };

  useEffect(() => {
    void loadReports();
  }, []);

  const updateStatus = async (id: string, status: SpotReport["status"]) => {
    setUpdatingId(id);
    const { error: updateError } = await (supabase as any).from("smoke_spot_reports").update({ status }).eq("id", id);
    if (updateError) {
      setError("No se pudo actualizar el estado del reporte.");
      setUpdatingId("");
      return;
    }
    setReports((prev) => prev.map((report) => (report.id === id ? { ...report, status } : report)));
    setUpdatingId("");
  };

  if (loading) return <main className="grid min-h-[70vh] place-items-center text-botanical-muted">Cargando moderación...</main>;

  return (
    <main className="space-y-5">
      <section className="rounded-3xl border border-botanical-line bg-white p-6 shadow-botanical">
        <h1 className="font-serif text-4xl text-botanical-primary">Moderación de Spots</h1>
        <p className="mt-2 text-sm text-botanical-muted">Revisa reportes de la comunidad y cambia su estado.</p>
        {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      </section>

      <section className="rounded-3xl border border-botanical-line bg-white p-6">
        {reports.length === 0 ? (
          <p className="text-sm text-botanical-muted">No hay reportes pendientes.</p>
        ) : (
          <ul className="space-y-3">
            {reports.map((report) => (
              <li key={report.id} className="rounded-2xl bg-botanical-bg p-4">
                <p className="text-sm font-medium text-botanical-text">
                  Spot: {spotNames[report.spot_id] ?? report.spot_id}
                </p>
                <p className="mt-1 text-sm text-botanical-muted">{report.reason}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {(["open", "reviewing", "resolved", "dismissed"] as SpotReport["status"][]).map((statusOption) => (
                    <button
                      key={statusOption}
                      type="button"
                      disabled={updatingId === report.id}
                      onClick={() => void updateStatus(report.id, statusOption)}
                      className={`rounded-full px-3 py-1 text-xs ${
                        report.status === statusOption
                          ? "bg-botanical-primary text-white"
                          : "border border-botanical-line bg-white text-botanical-muted"
                      }`}
                    >
                      {statusOption}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
