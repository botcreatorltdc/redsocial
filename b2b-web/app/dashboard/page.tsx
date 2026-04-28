"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Metrics = {
  activeProducts: number;
  totalReviews: number;
  averageRating: number;
  openSpotReports: number;
};

type RecentReview = {
  id: string;
  content_text: string;
  rating: number;
  created_at: string;
};

type ReplyRow = {
  review_id: string;
  reply_text: string;
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
    averageRating: 0,
    openSpotReports: 0
  });
  const [clubId, setClubId] = useState("");
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});
  const [savingReplyId, setSavingReplyId] = useState("");
  const [interactionsCount, setInteractionsCount] = useState(0);

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

      if (clubError) {
        setError("No se pudo validar el club asociado a tu usuario.");
        setLoading(false);
        return;
      }

      if (!club) {
        router.replace("/dashboard/onboarding");
        return;
      }
      setClubId(club.id);

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

      const { data: repliesData } = await (supabase as any)
        .from("review_replies")
        .select("review_id, reply_text")
        .eq("club_id", club.id);
      const nextReplyMap: Record<string, string> = {};
      ((repliesData as ReplyRow[] | null) ?? []).forEach((reply) => {
        nextReplyMap[reply.review_id] = reply.reply_text;
      });
      setReplyMap(nextReplyMap);

      const { count: interactions } = await (supabase as any)
        .from("club_interactions")
        .select("*", { count: "exact", head: true })
        .eq("club_id", club.id);
      setInteractionsCount(interactions ?? 0);

      const { count: openReports } = await (supabase as any)
        .from("smoke_spot_reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "open");

      const reviewRows = (reviewsData as RecentReview[]) ?? [];
      const totalReviews = reviewRows.length;
      const averageRating =
        totalReviews > 0
          ? reviewRows.reduce((sum, review) => sum + review.rating, 0) / totalReviews
          : 0;

      setMetrics({
        activeProducts: count ?? 0,
        totalReviews,
        averageRating,
        openSpotReports: openReports ?? 0
      });
      setRecentReviews(reviewRows.slice(0, 5));
      setLoading(false);
    };

    void loadMetrics();
  }, [router]);

  const profileVisits = useMemo(() => interactionsCount, [interactionsCount]);
  const newReviews = recentReviews.length;

  const saveReply = async (reviewId: string) => {
    if (!clubId) return;
    setSavingReplyId(reviewId);
    const session = (await supabase.auth.getSession()).data.session;
    const ownerId = session?.user.id;
    if (!ownerId) {
      setSavingReplyId("");
      return;
    }
    const replyText = (replyMap[reviewId] || "").trim();
    if (!replyText) {
      setSavingReplyId("");
      return;
    }
    await (supabase as any).from("review_replies").upsert(
      {
        review_id: reviewId,
        club_id: clubId,
        author_id: ownerId,
        reply_text: replyText
      },
      { onConflict: "review_id,club_id" }
    );
    setSavingReplyId("");
  };

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
        <article className="rounded-3xl border border-botanical-line bg-white p-6">
          <p className="text-xs uppercase tracking-[0.12em] text-botanical-muted">Reportes Spots (abiertos)</p>
          <p className="mt-3 font-serif text-4xl text-botanical-primary">{metrics.openSpotReports}</p>
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
              <div className="mt-3 space-y-2">
                <textarea
                  value={replyMap[review.id] ?? ""}
                  onChange={(e) => setReplyMap((prev) => ({ ...prev, [review.id]: e.target.value }))}
                  placeholder="Responder reseña..."
                  className="w-full rounded-2xl border border-botanical-line bg-white px-3 py-2 text-sm outline-none"
                  rows={2}
                />
                <button
                  type="button"
                  onClick={() => void saveReply(review.id)}
                  className="rounded-full border border-botanical-primary px-4 py-2 text-xs text-botanical-primary"
                >
                  {savingReplyId === review.id ? "Guardando..." : "Guardar respuesta"}
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
