"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      setError("Credenciales inválidas");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className="grid min-h-screen place-items-center bg-botanical-bg p-6">
      <form
        onSubmit={handleSubmit}
        className="grid w-full max-w-md gap-4 rounded-3xl border border-botanical-line bg-white p-8 shadow-botanical"
      >
        <h1 className="font-serif text-4xl text-botanical-primary">Botanical Club</h1>
        <p className="text-sm text-botanical-muted">Inicia sesión para continuar</p>

        <label className="grid gap-2 text-sm text-botanical-text">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-2xl border border-botanical-line bg-botanical-bg px-4 py-3 text-sm outline-none focus:border-botanical-primary"
            placeholder="club@correo.com"
          />
        </label>

        <label className="grid gap-2 text-sm text-botanical-text">
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-2xl border border-botanical-line bg-botanical-bg px-4 py-3 text-sm outline-none focus:border-botanical-primary"
            placeholder="********"
          />
        </label>

        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-botanical-primary px-5 py-3 text-sm font-medium tracking-[0.06em] text-white"
        >
          {loading ? "Iniciando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
