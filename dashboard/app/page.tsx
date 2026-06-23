"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type Empresa, listarEmpresas } from "@/lib/api";
import { BrandMark } from "@/components/BrandMark";

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
      <BrandMark />
      <h1 className="mt-3 text-2xl font-semibold text-foreground">Selecciona una empresa</h1>
      <p className="mt-1 text-sm text-muted-foreground">Te pedirá el código de acceso la primera vez.</p>

      <div className="mt-10 w-full max-w-md space-y-3">
        {error && <p className="text-center text-sm text-destructive">{error}</p>}
        {!error && !empresas && <p className="text-center text-sm text-muted-foreground">Cargando...</p>}
        {empresas?.map((empresa) => (
          <Link
            key={empresa.id}
            href={`/${empresa.slug}`}
            className="block rounded-lg border border-border bg-card px-5 py-4 shadow-card transition-colors hover:border-primary"
          >
            <p className="font-medium text-foreground">{empresa.nombre}</p>
            <p className="text-sm text-muted-foreground">
              /{empresa.slug} · plan {empresa.plan}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
