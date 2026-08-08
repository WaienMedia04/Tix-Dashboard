"use client";

import { useEffect, useState } from "react";
import { Check, Coins, IdCard, Image as ImageIcon, Lock, Store } from "lucide-react";
import { actualizarPerfilMural, equiparItemTienda, fetchTiendaCatalogo, type ItemMarcoCuadroTienda } from "@/lib/api";
import { MARCOS_CUADRO } from "@/lib/mural-marco-cuadro";

const TAMANOS = [
  { id: "pequeno", label: "Pequeño" },
  { id: "mediano", label: "Mediano" },
  { id: "grande", label: "Grande" },
];

/**
 * Elegir entre el lanyard (carnet colgante, por defecto) o una foto
 * enmarcada en el centro del encabezado — y si es foto, su tamaño y marco.
 * Cuando el modo es "lanyard" se bloquea (oculta) la elección de marco,
 * porque no aplica.
 */
export function SelectorEncabezado({
  modoEncabezado,
  cuadroTamano,
  cuadroMarcoId,
  onCambiado,
  onAbrirTienda,
}: {
  modoEncabezado: string;
  cuadroTamano: string;
  cuadroMarcoId: string | null;
  onCambiado: (cambios: Partial<{ modoEncabezado: string; cuadroTamano: string; cuadroMarcoId: string | null }>) => void;
  /** Se llama cuando el talento toca un marco que todavía no compró. */
  onAbrirTienda: () => void;
}) {
  const [guardando, setGuardando] = useState(false);
  const [itemsTienda, setItemsTienda] = useState<ItemMarcoCuadroTienda[] | null>(null);

  useEffect(() => {
    fetchTiendaCatalogo()
      .then((c) => setItemsTienda(c.marcosCuadro))
      .catch(() => setItemsTienda([]));
  }, []);

  async function elegirModo(modo: string) {
    if (modo === modoEncabezado || guardando) return;
    setGuardando(true);
    try {
      await actualizarPerfilMural({ modoEncabezado: modo });
      onCambiado({ modoEncabezado: modo });
    } catch {
      // sin cambios visibles si falla
    } finally {
      setGuardando(false);
    }
  }

  async function elegirTamano(tamano: string) {
    if (tamano === cuadroTamano || guardando) return;
    setGuardando(true);
    try {
      await actualizarPerfilMural({ cuadroTamano: tamano });
      onCambiado({ cuadroTamano: tamano });
    } catch {
      // sin cambios visibles si falla
    } finally {
      setGuardando(false);
    }
  }

  function estaComprado(id: string): boolean {
    const item = itemsTienda?.find((i) => i.id === id);
    return !item || item.comprado; // si no está en el catálogo de la tienda, es gratis (de fábrica)
  }

  async function elegirMarco(id: string) {
    if (id === cuadroMarcoId || guardando) return;
    if (!estaComprado(id)) {
      onAbrirTienda();
      return;
    }
    setGuardando(true);
    try {
      if (itemsTienda?.some((i) => i.id === id)) {
        // Marco comprado en la Tienda: el equipado (y su validación de dueño) pasa por ahí, no por actualizarPerfilMural.
        await equiparItemTienda("marcoCuadro", id);
      } else {
        await actualizarPerfilMural({ cuadroMarcoId: id });
      }
      onCambiado({ cuadroMarcoId: id });
    } catch {
      // sin cambios visibles si falla
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => void elegirModo("lanyard")}
          disabled={guardando}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed ${
            modoEncabezado === "lanyard" ? "border-primary text-primary" : "border-border text-muted-foreground"
          }`}
        >
          <IdCard className="h-4 w-4" />
          Carnet colgante
        </button>
        <button
          type="button"
          onClick={() => void elegirModo("cuadro")}
          disabled={guardando}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed ${
            modoEncabezado === "cuadro" ? "border-primary text-primary" : "border-border text-muted-foreground"
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          Foto enmarcada
        </button>
      </div>

      {modoEncabezado === "cuadro" && (
        <>
          <div>
            <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Tamaño</p>
            <div className="flex gap-1.5">
              {TAMANOS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => void elegirTamano(t.id)}
                  disabled={guardando}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed ${
                    cuadroTamano === t.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Marco</p>
            <div className="flex flex-wrap items-center gap-2">
              {MARCOS_CUADRO.map((m) => {
                const item = itemsTienda?.find((i) => i.id === m.id);
                const bloqueado = itemsTienda !== null && item && !item.comprado;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => void elegirMarco(m.id)}
                    disabled={guardando}
                    title={bloqueado ? `${m.label} — ${item.precio} monedas en la Tienda` : m.label}
                    className="relative h-11 w-11 shrink-0 rounded-lg border-2 transition-transform disabled:cursor-not-allowed"
                    style={{ borderColor: cuadroMarcoId === m.id ? "var(--primary)" : "transparent" }}
                  >
                    <span className={`flex h-full w-full items-center justify-center rounded-md ${m.clases}`} style={{ padding: 3 }}>
                      <span className="h-full w-full rounded bg-white/25" />
                    </span>
                    {cuadroMarcoId === m.id && (
                      <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/30">
                        <Check className="h-4 w-4 text-white drop-shadow" />
                      </span>
                    )}
                    {bloqueado && (
                      <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/45">
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
            </div>
            <button
              type="button"
              onClick={onAbrirTienda}
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
            >
              <Store className="h-3 w-3" />
              Ver más en la Tienda
            </button>
          </div>
        </>
      )}
    </div>
  );
}
