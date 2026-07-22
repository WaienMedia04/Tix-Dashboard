"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, History } from "lucide-react";
import { type PizarraEventoTimeline, fetchPizarraTimeline } from "@/lib/api";
import { Avatar } from "@/components/Avatar";

const ICONO_POR_TIPO: Record<PizarraEventoTimeline["tipo"], string> = {
  estampa: "🏅",
  nuevo: "👋",
  cumple: "🎂",
};

function tiempoRelativo(iso: string): string {
  const segundos = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (segundos < 60) return "ahora";
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `hace ${dias} d`;
}

export function PizarraTimeline({ slug }: { slug: string }) {
  const [eventos, setEventos] = useState<PizarraEventoTimeline[] | null>(null);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    fetchPizarraTimeline(slug)
      .then(setEventos)
      .catch(() => setEventos([]));
  }, [slug]);

  if (eventos !== null && eventos.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/70 bg-background p-3.5">
      <button onClick={() => setAbierto((v) => !v)} className="flex w-full items-center justify-between gap-2 text-left">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <History className="h-3.5 w-3.5" />
          Actividad reciente
        </span>
        {abierto ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
      {abierto && (
        <ul className="mt-2.5 space-y-2">
          {eventos?.map((e) => (
            <li key={e.id} className="flex items-center gap-2 text-xs">
              <Avatar nombreCompleto={e.talento.nombreCompleto} fotoUrl={e.talento.fotoUrl} size="sm" />
              <span className="flex-1 text-foreground">
                <span className="font-medium">{e.talento.nombreCompleto}</span> {e.texto} {ICONO_POR_TIPO[e.tipo]}
              </span>
              <span className="shrink-0 text-[10px] text-muted-foreground/70">{tiempoRelativo(e.fecha)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
