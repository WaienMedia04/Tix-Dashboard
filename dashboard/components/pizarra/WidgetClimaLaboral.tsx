"use client";

import { useState } from "react";
import { BatteryLow, ChevronDown, Frown, Meh, PartyPopper, Smile, Users } from "lucide-react";
import {
  type EmojiClima,
  type PizarraClimaEquipo,
  fetchPizarraClimaEquipo,
  responderPizarraClima,
} from "@/lib/api";
import { Avatar } from "@/components/Avatar";
import { estiloWidget, type TemaWidgets } from "@/lib/pizarra-temas";

const OPCIONES: { valor: EmojiClima; Icono: typeof Smile; label: string }[] = [
  { valor: "FELIZ", Icono: Smile, label: "Feliz" },
  { valor: "NEUTRAL", Icono: Meh, label: "Neutral" },
  { valor: "TRISTE", Icono: Frown, label: "Triste" },
  { valor: "CANSADO", Icono: BatteryLow, label: "Cansado" },
  { valor: "EMOCIONADO", Icono: PartyPopper, label: "Emocionado" },
];

function IconoClima({ valor, className }: { valor: EmojiClima; className?: string }) {
  const Icono = OPCIONES.find((o) => o.valor === valor)?.Icono ?? Meh;
  return <Icono className={className} />;
}

export function WidgetClimaLaboral({
  slug,
  climaHoy,
  esModerador,
  onRespondido,
  tema,
}: {
  slug: string;
  climaHoy: EmojiClima | null;
  esModerador: boolean;
  onRespondido: (emoji: EmojiClima) => void;
  tema: TemaWidgets;
}) {
  const [enviando, setEnviando] = useState(false);
  const [mostrarEquipo, setMostrarEquipo] = useState(false);
  const [equipo, setEquipo] = useState<PizarraClimaEquipo | null>(null);

  async function responder(emoji: EmojiClima) {
    if (enviando) return;
    setEnviando(true);
    try {
      await responderPizarraClima(slug, emoji);
      onRespondido(emoji);
    } catch {
      // el usuario puede reintentar
    } finally {
      setEnviando(false);
    }
  }

  function alternarEquipo() {
    const siguiente = !mostrarEquipo;
    setMostrarEquipo(siguiente);
    if (siguiente && equipo === null) {
      fetchPizarraClimaEquipo(slug)
        .then(setEquipo)
        .catch(() => setEquipo({ total: 0, resumen: [], respuestas: [] }));
    }
  }

  const estilo = estiloWidget(tema, "ambar");

  return (
    <div className={`rounded-xl border p-3.5 ${estilo.card}`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${estilo.badge}`}>
          <Smile className={`h-3.5 w-3.5 ${estilo.icon}`} />
        </span>
        <span className="text-xs font-semibold text-zinc-500">Clima laboral</span>
      </div>
      <p className="mt-1.5 text-sm font-medium text-zinc-900">¿Cómo te sientes hoy?</p>

      {climaHoy ? (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-zinc-600">
          Ya respondiste: <IconoClima valor={climaHoy} className="h-4 w-4 text-zinc-700" />
        </p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {OPCIONES.map((o) => (
            <button
              key={o.valor}
              onClick={() => void responder(o.valor)}
              disabled={enviando}
              title={o.label}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition-transform hover:scale-110 disabled:opacity-50"
            >
              <o.Icono className="h-4 w-4" />
            </button>
          ))}
        </div>
      )}

      {esModerador && (
        <div className="mt-2.5 border-t border-zinc-200 pt-2">
          <button
            onClick={alternarEquipo}
            className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
          >
            <Users className="h-3 w-3" />
            Ver respuestas del equipo
            <ChevronDown className={`h-3 w-3 transition-transform ${mostrarEquipo ? "rotate-180" : ""}`} />
          </button>
          {mostrarEquipo && (
            <div className="mt-2 space-y-1.5">
              {equipo === null && <p className="text-xs text-zinc-500">Cargando…</p>}
              {equipo !== null && equipo.respuestas.length === 0 && (
                <p className="text-xs text-zinc-500">Nadie ha respondido todavía hoy.</p>
              )}
              {equipo?.respuestas.map((r) => {
                return (
                  <div key={r.usuarioId} className="flex items-center gap-2 text-xs">
                    <Avatar nombreCompleto={r.nombre} fotoUrl={r.fotoUrl} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-zinc-900">{r.nombre}</span>
                    <IconoClima valor={r.emoji} className="h-3.5 w-3.5 text-zinc-500" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
