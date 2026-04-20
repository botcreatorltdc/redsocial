"use client";

import { CSSProperties, useEffect, useState } from "react";
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

  if (loading) {
    return <main style={styles.loading}>Cargando dashboard...</main>;
  }

  return (
    <main style={styles.main}>
      <section style={styles.header}>
        <h1 style={styles.title}>Dashboard del Club</h1>
        <p style={styles.subtitle}>Resumen rápido de tu operación diaria.</p>
      </section>

      {error ? <p style={styles.error}>{error}</p> : null}

      <section style={styles.grid}>
        <article style={styles.metricCard}>
          <p style={styles.metricLabel}>Productos Activos</p>
          <p style={styles.metricValue}>{metrics.activeProducts}</p>
        </article>

        <article style={styles.metricCard}>
          <p style={styles.metricLabel}>Reseñas Totales</p>
          <p style={styles.metricValue}>{metrics.totalReviews}</p>
        </article>

        <article style={styles.metricCard}>
          <p style={styles.metricLabel}>Puntuación Media</p>
          <p style={styles.metricValue}>{metrics.averageRating.toFixed(1)}</p>
        </article>
      </section>

      <section style={styles.reviewsSection}>
        <h2 style={styles.reviewsTitle}>Reseñas recientes</h2>

        {recentReviews.length === 0 ? (
          <article style={styles.reviewCard}>
            <p style={styles.reviewContent}>Aun no hay reseñas para este club.</p>
          </article>
        ) : (
          recentReviews.map((review) => (
            <article key={review.id} style={styles.reviewCard}>
              <div style={styles.reviewHeader}>
                <p style={styles.reviewRating}>{"★".repeat(Math.round(review.rating))}</p>
                <p style={styles.reviewDate}>{formatRelativeDate(review.created_at)}</p>
              </div>
              <p style={styles.reviewContent}>{review.content_text}</p>
            </article>
          ))
        )}
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
    padding: "24px"
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px"
  },
  metricCard: {
    background: "#FFFFFF",
    border: "1px solid #DFE8E2",
    borderRadius: "16px",
    padding: "16px"
  },
  metricLabel: {
    margin: 0,
    color: "#60706A",
    fontSize: "14px"
  },
  metricValue: {
    margin: "8px 0 0 0",
    color: "#24312C",
    fontSize: "28px",
    fontWeight: 700
  },
  reviewsSection: {
    marginTop: "18px"
  },
  reviewsTitle: {
    margin: "0 0 10px 0",
    color: "#24312C",
    fontSize: "20px"
  },
  reviewCard: {
    background: "#FFFFFF",
    border: "1px solid #DFE8E2",
    borderRadius: "14px",
    padding: "14px",
    marginBottom: "10px"
  },
  reviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px"
  },
  reviewRating: {
    margin: 0,
    color: "#C9876B",
    fontSize: "14px"
  },
  reviewDate: {
    margin: 0,
    color: "#60706A",
    fontSize: "12px"
  },
  reviewContent: {
    margin: 0,
    color: "#24312C",
    lineHeight: 1.45
  }
};
