"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { geocodeAddress } from "../../../lib/geocode";
import { uploadClubImage } from "../../../lib/mediaUpload";
import { supabase } from "../../../lib/supabase";

export default function DashboardOnboardingPage() {
  const router = useRouter();
  const [clubName, setClubName] = useState("");
  const [address, setAddress] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

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

    // Si el owner ya tiene club (unique owner_id), evitamos conflicto 409.
    const { data: existingClub } = await supabase
      .from("clubs")
      .select("id")
      .eq("owner_id", ownerId)
      .limit(1)
      .maybeSingle();
    if (existingClub) {
      setInfo("Ya tenías un club creado. Te redirigimos al dashboard...");
      setTimeout(() => router.replace("/dashboard"), 900);
      return;
    }

    setIsLocating(true);
    const coords = await geocodeAddress(address);
    setIsLocating(false);
    if (!coords) {
      setError("No pudimos validar la dirección. Escribe una dirección más completa.");
      setLoading(false);
      return;
    }

    let nextCoverImage = coverImage.trim() || null;
    let nextLogoUrl = logoUrl.trim() || null;

    if (coverFile) {
      const upload = await uploadClubImage(coverFile, ownerId, "cover");
      if (upload.error || !upload.url) {
        setError("No se pudo subir la portada. Verifica bucket 'club-media' en Supabase.");
        setLoading(false);
        return;
      }
      nextCoverImage = upload.url;
    }
    if (logoFile) {
      const upload = await uploadClubImage(logoFile, ownerId, "logo");
      if (upload.error || !upload.url) {
        setError("No se pudo subir el logo. Verifica bucket 'club-media' en Supabase.");
        setLoading(false);
        return;
      }
      nextLogoUrl = upload.url;
    }

    const payload = {
      name: clubName.trim(),
      address: address.trim(),
      owner_id: ownerId,
      lat: coords.lat,
      lng: coords.lng,
      cover_image: nextCoverImage,
      amenities_json: {
        logo_url: nextLogoUrl
      }
    };

    const { error: insertError } = await supabase.from("clubs").insert(payload);
    if (insertError) {
      // Si existe restricción de unicidad por owner_id, actualizamos en lugar de fallar.
      if (insertError.code === "23505") {
        const { error: updateError } = await supabase
          .from("clubs")
          .update({
            name: payload.name,
            address: payload.address,
            lat: payload.lat,
            lng: payload.lng,
            cover_image: payload.cover_image,
            amenities_json: payload.amenities_json
          })
          .eq("owner_id", ownerId);

        if (updateError) {
          setError(
            `No se pudo actualizar el club (${updateError.code ?? "sin-codigo"}). Revisa constraints/policies en Supabase.`
          );
          setLoading(false);
          return;
        }

        setInfo("Tu usuario ya tenía un club. Lo actualizamos y te redirigimos al dashboard...");
        setTimeout(() => router.replace("/dashboard"), 900);
        return;
      }

      setError(
        `No se pudo crear el club (${insertError.code ?? "sin-codigo"}). Revisa constraints/policies en Supabase.`
      );
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
  };

  return (
    <main className="grid min-h-[70vh] place-items-center">
      <form
        onSubmit={handleSubmit}
        className="grid w-full max-w-xl gap-4 rounded-3xl border border-botanical-line bg-white p-8 shadow-botanical"
      >
        <h1 className="font-serif text-4xl text-botanical-primary">Crear Club</h1>
        <p className="text-sm text-botanical-muted">Completa los datos iniciales de tu espacio.</p>

        <label className="grid gap-2 text-sm text-botanical-text">
          Nombre del Club
          <input
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            required
            className="rounded-2xl border border-botanical-line bg-botanical-bg px-4 py-3 outline-none focus:border-botanical-primary"
            placeholder="Ej. Club Verde Centro"
          />
        </label>

        <label className="grid gap-2 text-sm text-botanical-text">
          Dirección
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="rounded-2xl border border-botanical-line bg-botanical-bg px-4 py-3 outline-none focus:border-botanical-primary"
            placeholder="Ej. Carrer de Mallorca 123"
          />
        </label>

        <label className="grid gap-2 text-sm text-botanical-text">
          URL portada (opcional)
          <input
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="rounded-2xl border border-botanical-line bg-botanical-bg px-4 py-3 outline-none focus:border-botanical-primary"
            placeholder="https://..."
          />
        </label>
        <label className="grid gap-2 text-sm text-botanical-text">
          o subir portada
          <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} />
        </label>

        <label className="grid gap-2 text-sm text-botanical-text">
          URL logo (opcional)
          <input
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="rounded-2xl border border-botanical-line bg-botanical-bg px-4 py-3 outline-none focus:border-botanical-primary"
            placeholder="https://..."
          />
        </label>
        <label className="grid gap-2 text-sm text-botanical-text">
          o subir logo
          <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
        </label>

        {info ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{info}</p> : null}
        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={loading || isLocating}
          className="rounded-full bg-botanical-primary px-5 py-3 text-sm font-medium tracking-[0.06em] text-white"
        >
          {isLocating ? "Validando dirección..." : loading ? "Creando..." : "Crear Club"}
        </button>
      </form>
    </main>
  );
}
