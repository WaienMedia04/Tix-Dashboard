"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

function construirPaginas(pagina: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const candidatas = new Set<number>([1, total, pagina - 1, pagina, pagina + 1]);
  const ordenadas = [...candidatas].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const resultado: (number | "...")[] = [];
  ordenadas.forEach((p, i) => {
    if (i > 0 && p - ordenadas[i - 1] > 1) resultado.push("...");
    resultado.push(p);
  });
  return resultado;
}

export function PizarraPaginacion({
  pagina,
  totalPaginas,
  onCambiar,
}: {
  pagina: number;
  totalPaginas: number;
  onCambiar: (pagina: number) => void;
}) {
  if (totalPaginas <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-1 pt-1" aria-label="Paginación de la pizarra">
      <button
        onClick={() => onCambiar(pagina - 1)}
        disabled={pagina <= 1}
        aria-label="Página anterior"
        className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {construirPaginas(pagina, totalPaginas).map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-1 text-xs text-zinc-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onCambiar(p)}
            aria-current={p === pagina ? "page" : undefined}
            className={`flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-xs font-medium transition-colors ${
              p === pagina ? "bg-primary text-white" : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onCambiar(pagina + 1)}
        disabled={pagina >= totalPaginas}
        aria-label="Página siguiente"
        className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
