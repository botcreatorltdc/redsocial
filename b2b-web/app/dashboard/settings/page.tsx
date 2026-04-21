"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { geocodeAddress } from "../../../lib/geocode";
import { uploadClubImage } from "../../../lib/mediaUpload";
import { supabase } from "../../../lib/supabase";

type ClubFormData = {
  id: string;
  name: string;
  description: string;
  address: string;
  cover_image: string;
  logo_url: string;
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
    cover_image: "",
    logo_url: "",
    lat: "",
    lng: ""
  });
  const [isLocating, setIsLocating] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

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
        .select("id, name, description, address, cover_image, amenities_json, lat, lng")
        .eq("owner_id", userId)
        .limit(1)
        .maybeSingle();

      if (selectError) {
        setError("No se pudo validar el club asociado a tu usuario.");
        setLoading(false);
        return;
      }

      if (!club) {
        router.replace("/dashboard/onboarding");
        return;
      }

      setForm({
        id: club.id,
        name: club.name ?? "",
        description: club.description ?? "",
        address: club.address ?? "",
        cover_image: club.cover_image ?? "",
        logo_url:
          typeof (club as any).amenities_json === "object" && (club as any).amenities_json
            ? String((club as any).amenities_json.logo_url ?? "")
            : "",
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

    let lat = Number(form.lat);
    let lng = Number(form.lng);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setIsLocating(true);
      const coords = await geocodeAddress(form.address);
      setIsLocating(false);
      if (!coords) {
        setError("Latitud/longitud inválidas y no pudimos geocodificar la dirección.");
        setSaving(false);
        return;
      }
      lat = coords.lat;
      lng = coords.lng;
    }

    const session = (await supabase.auth.getSession()).data.session;
    const ownerId = session?.user.id;
    if (!ownerId) {
      setError("Tu sesión expiró. Vuelve a iniciar sesión.");
      setSaving(false);
      return;
    }

    let nextCover = form.cover_image || null;
    let nextLogo = form.logo_url || null;
    if (coverFile) {
      const upload = await uploadClubImage(coverFile, ownerId, "cover");
      if (upload.error || !upload.url) {
        setError("No se pudo subir la portada. Revisa bucket 'club-media'.");
        setSaving(false);
        return;
      }
      nextCover = upload.url;
    }
    if (logoFile) {
      const upload = await uploadClubImage(logoFile, ownerId, "logo");
      if (upload.error || !upload.url) {
        setError("No se pudo subir el logo. Revisa bucket 'club-media'.");
        setSaving(false);
        return;
      }
      nextLogo = upload.url;
    }

    const { error: updateError } = await supabase
      .from("clubs")
      .update({
        name: form.name,
        description: form.description || null,
        address: form.address,
        cover_image: nextCover,
        amenities_json: {
          logo_url: nextLogo
        },
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

  if (loading) return <main className="grid min-h-[70vh] place-items-center text-botanical-muted">Cargando configuración...</main>;

  return (
    <main>
      <form
        onSubmit={handleSubmit}
        className="grid w-full max-w-3xl gap-4 rounded-3xl border border-botanical-line bg-white p-8 shadow-botanical"
      >
        <h1 className="font-serif text-4xl text-botanical-primary">Configuración del Club</h1>
        <p className="text-sm text-botanical-muted">Actualiza la información pública de tu perfil.</p>

        <label className="grid gap-2 text-sm text-botanical-text">
          Nombre
          <input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
            className="rounded-2xl border border-botanical-line bg-botanical-bg px-4 py-3 outline-none focus:border-botanical-primary"
          />
        </label>

        <label className="grid gap-2 text-sm text-botanical-text">
          Descripción
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="rounded-2xl border border-botanical-line bg-botanical-bg px-4 py-3 outline-none focus:border-botanical-primary"
            rows={4}
          />
        </label>

        <label className="grid gap-2 text-sm text-botanical-text">
          Dirección
          <input
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
            required
            className="rounded-2xl border border-botanical-line bg-botanical-bg px-4 py-3 outline-none focus:border-botanical-primary"
          />
        </label>

        <label className="grid gap-2 text-sm text-botanical-text">
          Imagen portada (URL)
          <input
            value={form.cover_image}
            onChange={(e) => handleChange("cover_image", e.target.value)}
            className="rounded-2xl border border-botanical-line bg-botanical-bg px-4 py-3 outline-none focus:border-botanical-primary"
          />
        </label>
        <label className="grid gap-2 text-sm text-botanical-text">
          o subir portada
          <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} />
        </label>

        <label className="grid gap-2 text-sm text-botanical-text">
          Logo (URL)
          <input
            value={form.logo_url}
            onChange={(e) => handleChange("logo_url", e.target.value)}
            className="rounded-2xl border border-botanical-line bg-botanical-bg px-4 py-3 outline-none focus:border-botanical-primary"
          />
        </label>
        <label className="grid gap-2 text-sm text-botanical-text">
          o subir logo
          <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-sm text-botanical-text">
            Latitud
            <input
              value={form.lat}
              onChange={(e) => handleChange("lat", e.target.value)}
              required
              className="rounded-2xl border border-botanical-line bg-botanical-bg px-4 py-3 outline-none focus:border-botanical-primary"
            />
          </label>
          <label className="grid gap-2 text-sm text-botanical-text">
            Longitud
            <input
              value={form.lng}
              onChange={(e) => handleChange("lng", e.target.value)}
              required
              className="rounded-2xl border border-botanical-line bg-botanical-bg px-4 py-3 outline-none focus:border-botanical-primary"
            />
          </label>
        </div>

        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}

        <button
          type="submit"
          disabled={saving || isLocating}
          className="w-fit rounded-full bg-botanical-primary px-6 py-3 text-sm font-medium tracking-[0.06em] text-white"
        >
          {isLocating ? "Geocodificando..." : saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </main>
  );
}
