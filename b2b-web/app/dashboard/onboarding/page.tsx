"use client";

import { FormEvent, useState } from "react";
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
      // No enviamos id: Supabase usa el default de la tabla
      name: clubName.trim(),
      address: address.trim(),
      owner_id: ownerId,
      lat: 0.0,
      lng: 0.0
    });

    if (insertError) {
      setError("No se pudo crear el club. Revisa los datos e inténtalo de nuevo.");
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

        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-botanical-primary px-5 py-3 text-sm font-medium tracking-[0.06em] text-white"
        >
          {loading ? "Creando..." : "Crear Club"}
        </button>
      </form>
    </main>
  );
}
