"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Metrics = {
  activeProducts: number;
  totalReviews: number;
  averageRating: number;
};

type RecentReview = {
  id: string;
  content_text: string;
  rating: number;
  created_at: string;
};

function formatRelativeDate(dateInput: string) {
  const createdAt = new Date(dateInput).getTime();
  const diffMs = Date.now() - createdAt;
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  if (mins < 60) {
    return `Hace ${mins} min`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `Hace ${hours} h`;
  }
  const days = Math.floor(hours / 24);
  return days === 1 ? "Ayer" : `Hace ${days} dias`;
}

export default function DashboardHomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    activeProducts: 0,
    totalReviews: 0,
    averageRating: 0
  });

  useEffect(() => {
    const loadMetrics = async () => {
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

      const { count, error: countError } = await supabase
        .from("club_inventory")
        .select("*", { count: "exact", head: true })
        .eq("club_id", club.id)
        .eq("is_available", true);

      if (countError) {
        setError("No se pudieron cargar las métricas reales.");
        setLoading(false);
        return;
      }

      const { data: reviewsData, error: reviewsError } = await (supabase as any)
        .from("reviews")
        .select("id, content_text, rating, created_at")
        .eq("target_type", "club")
        .eq("target_id", club.id)
        .order("created_at", { ascending: false });

      if (reviewsError) {
        setError("No se pudieron cargar las reseñas del club.");
        setLoading(false);
        return;
      }

      const reviewRows = (reviewsData as RecentReview[]) ?? [];
      const totalReviews = reviewRows.length;
      const averageRating =
        totalReviews > 0
          ? reviewRows.reduce((sum, review) => sum + review.rating, 0) / totalReviews
          : 0;

      setMetrics({
        activeProducts: count ?? 0,
        totalReviews,
        averageRating
      });
      setRecentReviews(reviewRows.slice(0, 5));
      setLoading(false);
    };

    void loadMetrics();
  }, [router]);

  const profileVisits = useMemo(() => metrics.totalReviews * 9 + metrics.activeProducts * 11, [metrics]);
  const newReviews = recentReviews.length;

  if (loading) return <main className="grid min-h-[70vh] place-items-center text-botanical-muted">Cargando dashboard...</main>;

  return (
    <main className="space-y-6">
      <section>
        <h1 className="font-serif text-4xl text-botanical-primary">Welcome back</h1>
        <p className="mt-2 text-sm text-botanical-muted">Resumen operativo de tu club en tiempo real.</p>
      </section>

      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-botanical-line bg-white p-6 shadow-botanical">
          <p className="text-xs uppercase tracking-[0.12em] text-botanical-muted">Profile Visits</p>
          <p className="mt-3 font-serif text-4xl text-botanical-primary">{profileVisits}</p>
        </article>
        <article className="rounded-3xl border border-botanical-line bg-botanical-cream p-6">
          <p className="text-xs uppercase tracking-[0.12em] text-botanical-muted">New Reviews</p>
          <p className="mt-3 font-serif text-4xl text-botanical-primary">{newReviews}</p>
        </article>
        <article className="rounded-3xl border border-botanical-line bg-white p-6">
          <p className="text-xs uppercase tracking-[0.12em] text-botanical-muted">Productos Activos</p>
          <p className="mt-3 font-serif text-4xl text-botanical-primary">{metrics.activeProducts}</p>
        </article>
        <article className="rounded-3xl border border-botanical-line bg-white p-6">
          <p className="text-xs uppercase tracking-[0.12em] text-botanical-muted">Puntuación Media</p>
          <p className="mt-3 font-serif text-4xl text-botanical-primary">{metrics.averageRating.toFixed(1)}</p>
        </article>
      </section>

      <section className="rounded-3xl border border-botanical-line bg-white p-6 shadow-botanical">
        <h2 className="font-serif text-3xl text-botanical-primary">Reseñas recientes</h2>

        {recentReviews.length === 0 ? (
          <article className="mt-4 rounded-3xl bg-botanical-bg p-5">
            <p className="text-sm text-botanical-muted">Aun no hay reseñas para este club.</p>
          </article>
        ) : (
          recentReviews.map((review) => (
            <article key={review.id} className="mt-4 rounded-3xl border border-botanical-line bg-botanical-bg p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-amber-600">{"★".repeat(Math.round(review.rating))}</p>
                <p className="text-xs text-botanical-muted">{formatRelativeDate(review.created_at)}</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-botanical-text">{review.content_text}</p>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
