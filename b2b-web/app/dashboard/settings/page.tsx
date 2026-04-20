"use client";

import { CSSProperties, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type ClubFormData = {
  id: string;
  name: string;
  description: string;
  address: string;
  lat: string;
  lng: string;
};

export default function ClubSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<ClubFormData>({
    id: "",
    name: "",
    description: "",
    address: "",
    lat: "",
    lng: ""
  });

  useEffect(() => {
    const loadClub = async () => {
      const session = (await supabase.auth.getSession()).data.session;
      const userId = session?.user.id;

      if (!userId) {
        router.replace("/");
        return;
      }

      const { data: club, error: selectError } = await supabase
        .from("clubs")
        .select("id, name, description, address, lat, lng")
        .eq("owner_id", userId)
        .limit(1)
        .maybeSingle();

      if (selectError || !club) {
        router.replace("/dashboard/onboarding");
        return;
      }

      setForm({
        id: club.id,
        name: club.name ?? "",
        description: club.description ?? "",
        address: club.address ?? "",
        lat: typeof club.lat === "number" ? String(club.lat) : "",
        lng: typeof club.lng === "number" ? String(club.lng) : ""
      });
      setLoading(false);
    };

    void loadClub();
  }, [router]);

  const handleChange = (field: keyof ClubFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const lat = Number(form.lat);
    const lng = Number(form.lng);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setError("Latitud y longitud deben ser números válidos.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("clubs")
      .update({
        name: form.name,
        description: form.description || null,
        address: form.address,
        lat,
        lng
      })
      .eq("id", form.id);

    if (updateError) {
      setError("No se pudo guardar la configuración del club.");
      setSaving(false);
      return;
    }

    setSuccess("Cambios guardados correctamente.");
    setSaving(false);
  };

  if (loading) {
    return <main style={styles.loading}>Cargando configuración...</main>;
  }

  return (
    <main style={styles.main}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>Configuración del Club</h1>
        <p style={styles.subtitle}>Actualiza la información pública de tu perfil.</p>

        <label style={styles.label}>
          Nombre
          <input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Descripción
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            style={styles.textarea}
            rows={4}
          />
        </label>

        <label style={styles.label}>
          Dirección
          <input
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
            required
            style={styles.input}
          />
        </label>

        <div style={styles.row}>
          <label style={styles.label}>
            Latitud
            <input
              value={form.lat}
              onChange={(e) => handleChange("lat", e.target.value)}
              required
              style={styles.input}
            />
          </label>
          <label style={styles.label}>
            Longitud
            <input
              value={form.lng}
              onChange={(e) => handleChange("lng", e.target.value)}
              required
              style={styles.input}
            />
          </label>
        </div>

        {error ? <p style={styles.error}>{error}</p> : null}
        {success ? <p style={styles.success}>{success}</p> : null}

        <button type="submit" style={styles.button} disabled={saving}>
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
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
    maxWidth: "700px",
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
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px"
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
  textarea: {
    border: "1px solid #DFE8E2",
    borderRadius: "12px",
    padding: "10px 12px",
    fontSize: "14px",
    color: "#24312C",
    resize: "vertical"
  },
  button: {
    border: "none",
    borderRadius: "12px",
    background: "#2F5D50",
    color: "#FFFFFF",
    padding: "12px 14px",
    fontWeight: 600,
    cursor: "pointer"
  },
  error: {
    margin: 0,
    color: "#C25454",
    fontSize: "14px"
  },
  success: {
    margin: 0,
    color: "#3A7D62",
    fontSize: "14px"
  }
};
