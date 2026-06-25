"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";

export function CodigoAccesoCard({ codigoAcceso }: { codigoAcceso: string }) {
  const [revelado, setRevelado] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <KeyRound className="h-4 w-4" />
        </span>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Código de acceso</p>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <p className="font-display text-lg font-semibold tracking-wide text-foreground">
          {revelado ? codigoAcceso : "•".repeat(Math.max(codigoAcceso.length, 8))}
        </p>
        <button
          onClick={() => setRevelado((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          {revelado ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {revelado ? "Ocultar" : "Revelar"}
        </button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Este código es la llave de acceso al panel de tu empresa. No lo compartas fuera de tu equipo.
      </p>
    </div>
  );
}
