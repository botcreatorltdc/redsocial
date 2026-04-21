"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    if (mode === "signin") {
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
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    });
    if (signUpError) {
      setError(signUpError.message || "No se pudo crear la cuenta.");
      setLoading(false);
      return;
    }

    // No insertamos perfil aquí porque puede fallar con RLS (403) si aún no hay sesión confirmada.
    // La creación del profile debe resolverse vía trigger en Supabase o al primer login autenticado.
    setInfo("Cuenta creada. Revisa tu email si pide confirmación y luego inicia sesión.");
    setMode("signin");
    setLoading(false);
  };

  return (
    <main className="grid min-h-screen place-items-center bg-botanical-bg p-6">
      <form
        onSubmit={handleSubmit}
        className="grid w-full max-w-md gap-4 rounded-3xl border border-botanical-line bg-white p-8 shadow-botanical"
      >
        <h1 className="font-serif text-4xl text-botanical-primary">Botanical Club</h1>
        <p className="text-sm text-botanical-muted">
          {mode === "signin" ? "Inicia sesión para continuar" : "Crea tu cuenta de club"}
        </p>

        <div className="grid grid-cols-2 rounded-full bg-botanical-bg p-1">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError("");
              setInfo("");
            }}
            className={`rounded-full px-3 py-2 text-xs tracking-[0.08em] ${
              mode === "signin" ? "bg-botanical-primary text-white" : "text-botanical-muted"
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
              setInfo("");
            }}
            className={`rounded-full px-3 py-2 text-xs tracking-[0.08em] ${
              mode === "signup" ? "bg-botanical-primary text-white" : "text-botanical-muted"
            }`}
          >
            Registrarse
          </button>
        </div>

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

        {info ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{info}</p> : null}
        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-botanical-primary px-5 py-3 text-sm font-medium tracking-[0.06em] text-white"
        >
          {loading ? "Procesando..." : mode === "signin" ? "Entrar" : "Crear cuenta"}
        </button>
      </form>
    </main>
  );
}
