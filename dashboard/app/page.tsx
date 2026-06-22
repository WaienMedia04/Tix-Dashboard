"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type Empresa, listarEmpresas } from "@/lib/api";

export default function Home() {
  const [empresas, setEmpresas] = useState<Empresa[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listarEmpresas()
      .then(setEmpresas)
      .catch(() => setError("No se pudo conectar con el servidor."));
  }, []);

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center bg-background px-4 py-16">
      <p className="text-sm font-semibold tracking-wide text-accent uppercase">Talentix</p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">Selecciona una empresa</h1>
      <p className="mt-1 text-sm text-muted">Te pedirá el código de acceso la primera vez.</p>

      <div className="mt-10 w-full max-w-md space-y-3">
        {error && <p className="text-center text-sm text-danger">{error}</p>}
        {!error && !empresas && <p className="text-center text-sm text-muted">Cargando...</p>}
        {empresas?.map((empresa) => (
          <Link
            key={empresa.id}
            href={`/${empresa.slug}`}
            className="block rounded-xl border border-surface-border bg-surface px-5 py-4 transition-colors hover:border-accent"
          >
            <p className="font-medium text-foreground">{empresa.nombre}</p>
            <p className="text-sm text-muted">
              /{empresa.slug} · plan {empresa.plan}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
