"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Erro ao entrar");
      return;
    }
    router.push("/admin/orders");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-coffee-700 px-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-6">
        <div className="text-center">
          <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full bg-coffee-600 text-cream">
            <span className="font-display text-2xl">PQ</span>
          </div>
          <h1 className="font-display text-2xl text-coffee-800">Painel da padaria</h1>
          <p className="text-sm text-coffee-500">Entre para gerenciar pedidos e cardápio</p>
        </div>
        <div>
          <label className="label">Usuário</label>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
        </div>
        <div>
          <label className="label">Senha</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button disabled={loading} className="btn-primary w-full">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
