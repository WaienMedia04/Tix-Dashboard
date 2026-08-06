"use client";

import { useEffect, useState } from "react";
import { Check, Coins, Lock, Store } from "lucide-react";
import { actualizarPerfilMural, equiparItemTienda, fetchTiendaCatalogo, type ItemColorNombreTienda } from "@/lib/api";
import { COLORES_NOMBRE_MURAL } from "@/lib/mural-colores-nombre";

/** No se muestran todos los colores bloqueados a la vez (ya son más de 15) — solo una probadita, el resto vive en la Tienda. */
const LIMITE_BLOQUEADOS_VISIBLES = 5;

export function SelectorColorNombre({
  colorNombreId,
  onCambiado,
  onAbrirTienda,
}: {
  colorNombreId: string;
  onCambiado: (colorNombreId: string) => void;
  /** Se llama cuando el talento toca un color que todavía no compró. */
  onAbrirTienda: () => void;
}) {
  const [guardando, setGuardando] = useState<string | null>(null);
  const [itemsTienda, setItemsTienda] = useState<ItemColorNombreTienda[] | null>(null);

  useEffect(() => {
    fetchTiendaCatalogo()
      .then((c) => setItemsTienda(c.coloresNombre))
      .catch(() => setItemsTienda([]));
  }, []);

  function estaComprado(id: string): boolean {
    const item = itemsTienda?.find((i) => i.id === id);
    return !item || item.comprado; // si no está en el catálogo de la tienda, es gratis
  }

  const bloqueados = COLORES_NOMBRE_MURAL.filter((c) => !estaComprado(c.id));
  const bloqueadosVisiblesIds = new Set(bloqueados.slice(0, LIMITE_BLOQUEADOS_VISIBLES).map((c) => c.id));
  const coloresVisibles = COLORES_NOMBRE_MURAL.filter((c) => estaComprado(c.id) || bloqueadosVisiblesIds.has(c.id));
  const hayMasEnTienda = bloqueados.length > bloqueadosVisiblesIds.size;

  async function elegir(id: string) {
    if (id === colorNombreId) return;
    if (!estaComprado(id)) {
      onAbrirTienda();
      return;
    }
    setGuardando(id);
    try {
      if (itemsTienda?.some((i) => i.id === id)) {
        // Color comprado en la Tienda: el equipado (y su validación de dueño) pasa por ahí, no por actualizarPerfilMural.
        await equiparItemTienda("colorNombre", id);
      } else {
        await actualizarPerfilMural({ colorNombreId: id });
      }
      onCambiado(id);
    } catch {
      // sin cambios visibles si falla — el swatch simplemente no cambia
    } finally {
      setGuardando(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {coloresVisibles.map((c) => {
        const item = itemsTienda?.find((i) => i.id === c.id);
        const bloqueado = itemsTienda !== null && item && !item.comprado;
        return (
          <button
            key={c.id}
            onClick={() => void elegir(c.id)}
            disabled={guardando !== null}
            title={bloqueado ? `${c.label} — ${item.precio} monedas en la Tienda` : c.label}
            aria-label={c.label}
            className="relative h-10 w-10 shrink-0 rounded-full border-2 transition-transform disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg, ${c.colors.join(", ")})`,
              borderColor: colorNombreId === c.id ? "var(--primary)" : "transparent",
              transform: guardando === c.id ? "scale(0.9)" : undefined,
            }}
          >
            {colorNombreId === c.id && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Check className="h-4 w-4 text-white drop-shadow" />
              </span>
            )}
            {bloqueado && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45">
                <Lock className="h-3.5 w-3.5 text-white/90" />
              </span>
            )}
            {bloqueado && (
              <span className="absolute -bottom-1.5 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-black/80 px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap text-amber-300">
                <Coins className="h-2.5 w-2.5" />
                {item.precio}
              </span>
            )}
          </button>
        );
      })}
      {hayMasEnTienda && (
        <button
          type="button"
          onClick={onAbrirTienda}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
        >
          <Store className="h-3 w-3" />
          Ver más en la Tienda
        </button>
      )}
    </div>
  );
}
