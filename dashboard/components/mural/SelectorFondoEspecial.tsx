"use client";

import { useState } from "react";
import { Check, CloudRain, Loader2 } from "lucide-react";
import { actualizarPerfilMural } from "@/lib/api";
import { FONDOS_MURAL, type IntensidadLluvia } from "@/lib/mural-fondos";

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

/** Fondos con animación (por ahora, las 3 variantes de lluvia) + botón para activar automáticamente según el clima real de donde estás. */
export function SelectorFondoEspecial({
  fondoId,
  onCambiado,
}: {
  fondoId: string;
  onCambiado: (fondoId: string) => void;
}) {
  const [guardando, setGuardando] = useState<string | null>(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [mensajeClima, setMensajeClima] = useState<string | null>(null);

  const especiales = FONDOS_MURAL.filter((f) => f.especial);

  async function elegir(id: string) {
    if (id === fondoId) return;
    setGuardando(id);
    try {
      await actualizarPerfilMural({ fondoId: id });
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
            await elegir(FONDO_POR_INTENSIDAD[intensidad]);
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
      <div className="flex flex-wrap gap-2.5">
        {especiales.map((f) => (
          <button
            key={f.id}
            onClick={() => void elegir(f.id)}
            disabled={guardando !== null}
            title={f.label}
            aria-label={f.label}
            className="relative h-10 w-10 shrink-0 rounded-full border-2 transition-transform disabled:cursor-not-allowed"
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
          </button>
        ))}
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
    </div>
  );
}
