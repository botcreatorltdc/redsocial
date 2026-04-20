"use client";

import { CSSProperties, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function DashboardOnboardingPage() {
  const router = useRouter();
  const [clubName, setClubName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const session = (await supabase.auth.getSession()).data.session;
    const ownerId = session?.user.id;

    if (!ownerId) {
      router.replace("/");
      return;
    }

    const { error: insertError } = await supabase.from("clubs").insert({
      name: clubName,
      address,
      owner_id: ownerId,
      lat: 0,
      lng: 0
    });

    if (insertError) {
      setError("No se pudo crear el club. Revisa los datos e inténtalo de nuevo.");
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
  };

  return (
    <main style={styles.main}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>Crear Club</h1>
        <p style={styles.subtitle}>Completa los datos iniciales de tu espacio.</p>

        <label style={styles.label}>
          Nombre del Club
          <input
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            required
            style={styles.input}
            placeholder="Ej. Club Verde Centro"
          />
        </label>

        <label style={styles.label}>
          Dirección
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            style={styles.input}
            placeholder="Ej. Carrer de Mallorca 123"
          />
        </label>

        {error ? <p style={styles.error}>{error}</p> : null}

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Creando..." : "Crear Club"}
        </button>
      </form>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#F7F6F2",
    padding: "24px"
  },
  card: {
    width: "100%",
    maxWidth: "520px",
    background: "#FFFFFF",
    border: "1px solid #DFE8E2",
    borderRadius: "16px",
    padding: "24px",
    display: "grid",
    gap: "14px"
  },
  title: {
    margin: 0,
    color: "#24312C"
  },
  subtitle: {
    margin: 0,
    color: "#60706A"
  },
  label: {
    display: "grid",
    gap: "6px",
    color: "#24312C",
    fontSize: "14px"
  },
  input: {
    border: "1px solid #DFE8E2",
    borderRadius: "12px",
    padding: "10px 12px",
    fontSize: "14px",
    color: "#24312C"
  },
  error: {
    margin: 0,
    color: "#C25454",
    fontSize: "14px"
  },
  button: {
    border: "none",
    borderRadius: "12px",
    background: "#2F5D50",
    color: "#FFFFFF",
    padding: "12px 14px",
    fontWeight: 600,
    cursor: "pointer"
  }
};
