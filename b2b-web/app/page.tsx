"use client";

import { CSSProperties, FormEvent, useState } from "react";
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
    <main style={styles.main}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>Portal B2B</h1>
        <p style={styles.subtitle}>Inicia sesión para continuar</p>

        <label style={styles.label}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            placeholder="club@correo.com"
          />
        </label>

        <label style={styles.label}>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="********"
          />
        </label>

        {error ? <p style={styles.error}>{error}</p> : null}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Iniciando..." : "Entrar"}
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
  form: {
    width: "100%",
    maxWidth: "420px",
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
    fontSize: "14px"
  },
  error: {
    margin: 0,
    color: "#D14343",
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
