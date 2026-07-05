"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Turnstile from "@/components/Turnstile";

export default function LoginForm({
  nonce,
  turnstileSiteKey,
}: {
  nonce: string;
  turnstileSiteKey: string;
}) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      setError("Merci de valider le captcha.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, captchaToken }),
      });
      if (!res.ok) {
        setError("Identifiant ou mot de passe incorrect.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Un souci est survenu, réessaie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="loginForm" onSubmit={handleSubmit}>
      <label className="loginLabel">
        Identifiant
        <input
          className="loginInput"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
      </label>
      <label className="loginLabel">
        Mot de passe
        <input
          className="loginInput"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </label>
      {turnstileSiteKey && (
        <Turnstile
          siteKey={turnstileSiteKey}
          nonce={nonce}
          onVerify={setCaptchaToken}
          onExpire={() => setCaptchaToken(null)}
        />
      )}
      {error && <p className="loginError">{error}</p>}
      <button type="submit" className="loginButton" disabled={loading}>
        {loading ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
