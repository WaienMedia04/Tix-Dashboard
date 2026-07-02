"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNoAutorizadoError, validarTokenAdmin } from "@/lib/admin-api";
import Link from "next/link";
import { guardarTokenAdmin } from "@/lib/admin-auth";
import { BrandMark } from "@/components/BrandMark";

export default function AdminLoginPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;
    setError(null);
    setLoading(true);
    try {
      await validarTokenAdmin(token.trim());
      guardarTokenAdmin(token.trim());
      router.push("/admin/dashboard");
    } catch (err) {
      if (err instanceof AdminNoAutorizadoError) {
        setError("Clave de administrador incorrecta.");
      } else {
        setError(err instanceof Error ? err.message : "Error al conectar con el servidor.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-card">
        <div className="mb-6 text-center">
          <BrandMark />
          <div className="mt-2 inline-flex items-center rounded-md bg-primary px-2.5 py-0.5 text-xs font-semibold tracking-wider text-primary-foreground uppercase">
            Super Admin
          </div>
          <h1 className="mt-3 text-xl font-semibold text-foreground">Acceso de administrador</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ingresa la clave maestra de administración.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            autoFocus
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Clave de administrador"
            className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="w-full rounded-md bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-opacity disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Entrar al panel admin"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          ¿Eres cliente?{" "}
          <Link href="/" className="text-primary hover:underline">
            Ir al acceso de empresas
          </Link>
        </p>
      </div>
    </div>
  );
}
