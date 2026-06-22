"use client";

import { useState } from "react";
import { CodigoInvalidoError, EmpresaNoEncontradaError, fetchDashboard } from "@/lib/api";
import { guardarCodigo } from "@/lib/auth";
import { BrandMark } from "./BrandMark";

export function AccessGate({
  slug,
  initialError,
  onUnlock,
}: {
  slug: string;
  initialError?: string | null;
  onUnlock: () => void;
}) {
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!codigo.trim()) return;
    setError(null);
    setLoading(true);
    try {
      await fetchDashboard(slug, codigo.trim());
      guardarCodigo(slug, codigo.trim());
      onUnlock();
    } catch (err) {
      if (err instanceof CodigoInvalidoError) {
        setError("Código de acceso incorrecto.");
      } else if (err instanceof EmpresaNoEncontradaError) {
        setError(`No existe una empresa con el identificador "${slug}".`);
      } else {
        setError("No se pudo conectar con el servidor. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-md border border-surface-border bg-background p-8 shadow-sm">
        <div className="mb-6 text-center">
          <BrandMark />
          <h1 className="mt-4 text-xl font-semibold text-foreground">Acceso al panel</h1>
          <p className="mt-1 text-sm text-muted">Ingresa el código de acceso de tu empresa.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            autoFocus
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Código de acceso"
            className="w-full rounded-md border border-surface-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={loading || !codigo.trim()}
            className="w-full rounded-md bg-accent px-4 py-2.5 font-medium text-accent-foreground transition-opacity disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
