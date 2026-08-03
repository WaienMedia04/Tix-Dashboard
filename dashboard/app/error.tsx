"use client";

import { useEffect } from "react";
import { BrandMark } from "@/components/BrandMark";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-sm rounded-lg border border-border bg-card p-8 text-center shadow-card">
        <BrandMark />
        <p className="mt-3 text-sm text-foreground">Ocurrió un error inesperado.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Intenta de nuevo — si el problema persiste, contacta a soporte.
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
