"use client";

import { useEffect, useState } from "react";
import { Check, CloudRain, Coins, Loader2, Lock, Store } from "lucide-react";
import { actualizarPerfilMural, equiparItemTienda, fetchTiendaCatalogo, type ItemFondoTienda } from "@/lib/api";
import { esFondoAnimado, FONDOS_MURAL, type IntensidadLluvia } from "@/lib/mural-fondos";

/** No se muestran todos los fondos bloqueados a la vez (ya son más de 15) — solo una probadita, el resto vive en la Tienda. */
const LIMITE_BLOQUEADOS_VISIBLES = 5;

/** Códigos de clima WMO (Open-Meteo) que representan algún tipo de lluvia. */
function mapearClimaALluvia(codigo: number): IntensidadLluvia | null {
  if ([51, 53, 55, 56, 57, 61, 80].includes(codigo)) return "llovizna";
  if ([63, 65, 66, 67, 81].includes(codigo)) return "normal";
  if ([82, 95, 96, 99].includes(codigo)) return "tormenta";
  return null;
}

const FONDO_POR_INTENSIDAD: Record<IntensidadLluvia, string> = {
  llovizna: "lluvia_llovizna",
  normal: "lluvia_normal",
  tormenta: "lluvia_tormenta",
};

/**
 * Fondos con animación o diseño premium (lluvia + los especiales de la
 * Tienda) + botón para activar automáticamente según el clima real de donde
 * estás. Solo "lluvia_llovizna" es gratis — el resto hay que comprarlo en
 * la Tienda; acá se ven bloqueados con su precio y candado.
 */
export function SelectorFondoEspecial({
  fondoId,
  onCambiado,
  onAbrirTienda,
}: {
  fondoId: string;
  onCambiado: (fondoId: string) => void;
  /** Se llama cuando el talento toca un fondo especial que todavía no compró. */
  onAbrirTienda: () => void;
}) {
  const [guardando, setGuardando] = useState<string | null>(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [mensajeClima, setMensajeClima] = useState<string | null>(null);
  const [itemsTienda, setItemsTienda] = useState<ItemFondoTienda[] | null>(null);

  useEffect(() => {
    fetchTiendaCatalogo()
      .then((c) => setItemsTienda(c.fondos))
      .catch(() => setItemsTienda([]));
  }, []);

  const especiales = FONDOS_MURAL.filter((f) => f.especial);

  function estaComprado(id: string): boolean {
    const item = itemsTienda?.find((i) => i.id === id);
    return !item || item.comprado; // si no está en el catálogo de la tienda, es gratis
  }

  const bloqueados = especiales.filter((f) => !estaComprado(f.id));
  const bloqueadosVisiblesIds = new Set(bloqueados.slice(0, LIMITE_BLOQUEADOS_VISIBLES).map((f) => f.id));
  const visibles = especiales.filter((f) => estaComprado(f.id) || bloqueadosVisiblesIds.has(f.id));
  const hayMasEnTienda = bloqueados.length > bloqueadosVisiblesIds.size;

  async function elegir(id: string) {
    if (id === fondoId) return;
    if (!estaComprado(id)) {
      onAbrirTienda();
      return;
    }
    setGuardando(id);
    try {
      if (itemsTienda?.some((i) => i.id === id)) {
        // Fondo comprado en la Tienda: el equipado (y su validación de dueño) pasa por ahí, no por actualizarPerfilMural.
        await equiparItemTienda("fondo", id);
      } else {
        await actualizarPerfilMural({ fondoId: id });
      }
      onCambiado(id);
    } catch {
      // sin cambios visibles si falla — el swatch simplemente no cambia
    } finally {
      setGuardando(null);
    }
  }

  function sincronizarConClima() {
    if (!navigator.geolocation) {
      setMensajeClima("Tu navegador no permite compartir tu ubicación.");
      return;
    }
    setSincronizando(true);
    setMensajeClima(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=weather_code`)
          .then((res) => {
            if (!res.ok) throw new Error("clima no disponible");
            return res.json();
          })
          .then(async (datos: { current?: { weather_code?: number } }) => {
            const codigo = datos.current?.weather_code;
            const intensidad = typeof codigo === "number" ? mapearClimaALluvia(codigo) : null;
            if (!intensidad) {
              setMensajeClima("Ahorita no está lloviendo donde estás — se dejó el fondo como estaba.");
              return;
            }
            const idFondo = FONDO_POR_INTENSIDAD[intensidad];
            if (!estaComprado(idFondo)) {
              setMensajeClima("¡Está lloviendo! Pero ese fondo de lluvia todavía no lo compraste en la Tienda.");
              return;
            }
            await elegir(idFondo);
            setMensajeClima("¡Está lloviendo! Se activó el fondo de lluvia.");
          })
          .catch(() => setMensajeClima("No se pudo consultar el clima. Intenta de nuevo."))
          .finally(() => setSincronizando(false));
      },
      () => {
        setMensajeClima("Necesitamos tu ubicación para saber si está lloviendo ahí.");
        setSincronizando(false);
      },
      { timeout: 8000 },
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2.5">
        {visibles.map((f) => {
          const item = itemsTienda?.find((i) => i.id === f.id);
          const bloqueado = itemsTienda !== null && item && !item.comprado;
          return (
            <button
              key={f.id}
              onClick={() => void elegir(f.id)}
              disabled={guardando !== null}
              title={bloqueado ? `${f.label} — ${item.precio} monedas en la Tienda` : f.label}
              aria-label={f.label}
              className={`relative h-10 w-10 shrink-0 rounded-full border-2 transition-transform disabled:cursor-not-allowed ${
                esFondoAnimado(f.id) ? "fondo-mural-animado" : ""
              }`}
              style={{
                background: f.css,
                borderColor: fondoId === f.id ? "var(--primary)" : "transparent",
                transform: guardando === f.id ? "scale(0.9)" : undefined,
              }}
            >
              {fondoId === f.id && (
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

      <button
        type="button"
        onClick={sincronizarConClima}
        disabled={sincronizando}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {sincronizando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CloudRain className="h-3.5 w-3.5" />}
        {sincronizando ? "Consultando el clima..." : "Sincronizar con el clima"}
      </button>
      {mensajeClima && <p className="text-[11px] text-muted-foreground">{mensajeClima}</p>}
      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Lock className="h-3 w-3 shrink-0" />
        Los fondos bloqueados se compran en la Tienda con las monedas que ganas en el mural.
      </p>
    </div>
  );
}
