"use client";

import { useEffect, useState } from "react";
import { Ban, Check, Coins, Lock, Store } from "lucide-react";
import { actualizarPerfilMural, equiparItemTienda, fetchTiendaCatalogo, type ItemMascotaTienda } from "@/lib/api";
import { MASCOTAS_MURAL } from "@/lib/mural-mascotas";

/** No se muestran todas las mascotas bloqueadas a la vez — solo una probadita, el resto vive en la Tienda. */
const LIMITE_BLOQUEADAS_VISIBLES = 5;

export function SelectorMascota({
  mascotaId,
  mascotaNombre,
  onCambiado,
  onCambiadoNombre,
  onAbrirTienda,
}: {
  mascotaId: string | null;
  mascotaNombre: string | null;
  onCambiado: (mascotaId: string | null) => void;
  onCambiadoNombre: (mascotaNombre: string | null) => void;
  /** Se llama cuando el talento toca una mascota que todavía no compró. */
  onAbrirTienda: () => void;
}) {
  const [guardando, setGuardando] = useState<string | null>(null);
  const [nombre, setNombre] = useState(mascotaNombre ?? "");
  const [guardandoNombre, setGuardandoNombre] = useState(false);
  const [itemsTienda, setItemsTienda] = useState<ItemMascotaTienda[] | null>(null);

  useEffect(() => {
    fetchTiendaCatalogo()
      .then((c) => setItemsTienda(c.mascotas))
      .catch(() => setItemsTienda([]));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza el input si el nombre cambia desde afuera
    setNombre(mascotaNombre ?? "");
  }, [mascotaNombre]);

  function estaComprada(id: string): boolean {
    const item = itemsTienda?.find((i) => i.id === id);
    return !item || item.comprado; // si no está en el catálogo de la tienda, es gratis
  }

  const bloqueadas = MASCOTAS_MURAL.filter((m) => !estaComprada(m.id));
  const bloqueadasVisiblesIds = new Set(bloqueadas.slice(0, LIMITE_BLOQUEADAS_VISIBLES).map((m) => m.id));
  const mascotasVisibles = MASCOTAS_MURAL.filter((m) => estaComprada(m.id) || bloqueadasVisiblesIds.has(m.id));
  const hayMasEnTienda = bloqueadas.length > bloqueadasVisiblesIds.size;

  async function elegir(id: string | null) {
    if (id === mascotaId) return;
    if (id !== null && !estaComprada(id)) {
      onAbrirTienda();
      return;
    }
    setGuardando(id ?? "ninguna");
    try {
      if (id !== null && itemsTienda?.some((i) => i.id === id)) {
        // Mascota comprada en la Tienda: el equipado (y su validación de dueño) pasa por ahí, no por actualizarPerfilMural.
        await equiparItemTienda("mascota", id);
      } else {
        await actualizarPerfilMural({ mascotaId: id });
      }
      onCambiado(id);
    } catch {
      // sin cambios visibles si falla — la opción simplemente no cambia
    } finally {
      setGuardando(null);
    }
  }

  async function guardarNombre() {
    const limpio = nombre.trim();
    if (limpio === (mascotaNombre ?? "")) return;
    setGuardandoNombre(true);
    try {
      await actualizarPerfilMural({ mascotaNombre: limpio || null });
      onCambiadoNombre(limpio || null);
    } catch {
      setNombre(mascotaNombre ?? "");
    } finally {
      setGuardandoNombre(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => void elegir(null)}
          disabled={guardando !== null}
          className={`flex w-20 flex-col items-center gap-1.5 rounded-lg border-2 p-2.5 text-center transition-transform disabled:cursor-not-allowed ${
            mascotaId === null ? "border-primary" : "border-border"
          }`}
          style={{ transform: guardando === "ninguna" ? "scale(0.96)" : undefined }}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Ban className="h-4 w-4" />
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
            Ninguna
            {mascotaId === null && <Check className="h-3 w-3 text-primary" />}
          </span>
        </button>

        {mascotasVisibles.map((m) => {
          const activo = mascotaId === m.id;
          const item = itemsTienda?.find((i) => i.id === m.id);
          const bloqueada = itemsTienda !== null && item && !item.comprado;
          return (
            <button
              key={m.id}
              onClick={() => void elegir(m.id)}
              disabled={guardando !== null}
              title={bloqueada ? `${m.label} — ${item.precio} monedas en la Tienda` : m.label}
              className={`relative flex w-20 flex-col items-center gap-1.5 rounded-lg border-2 p-2.5 text-center transition-transform disabled:cursor-not-allowed ${
                activo ? "border-primary" : "border-border"
              }`}
              style={{ transform: guardando === m.id ? "scale(0.96)" : undefined }}
            >
              <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-accent">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/mascotas/${m.id}.png`} alt="" className="h-full w-full object-contain" />
                {bloqueada && (
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45">
                    <Lock className="h-3.5 w-3.5 text-white/90" />
                  </span>
                )}
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
                {m.label}
                {activo && <Check className="h-3 w-3 text-primary" />}
              </span>
              {bloqueada && (
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
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
            className="flex w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border p-2.5 text-center text-[11px] font-semibold text-primary hover:underline"
          >
            <Store className="h-4 w-4" />
            Ver más en la Tienda
          </button>
        )}
      </div>

      {mascotaId && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Ponle un nombre a tu mascota
          </label>
          <div className="flex items-center gap-2">
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void guardarNombre();
              }}
              onBlur={() => void guardarNombre()}
              placeholder="Ej. Mishi"
              maxLength={30}
              disabled={guardandoNombre}
              className="w-40 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
            />
            {guardandoNombre && <span className="text-xs text-muted-foreground">Guardando...</span>}
          </div>
          <p className="text-[11px] text-muted-foreground">Así se presentará cuando la abras.</p>
        </div>
      )}
    </div>
  );
}
