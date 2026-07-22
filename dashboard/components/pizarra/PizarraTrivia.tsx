"use client";

import { useEffect, useState } from "react";
import { Brain, Trophy } from "lucide-react";
import {
  type PizarraTriviaHoy,
  type PizarraTriviaRankingItem,
  fetchPizarraTriviaHoy,
  fetchPizarraTriviaRanking,
  responderPizarraTrivia,
} from "@/lib/api";
import { Avatar } from "@/components/Avatar";

export function PizarraTrivia({ slug }: { slug: string }) {
  const [trivia, setTrivia] = useState<PizarraTriviaHoy | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [mostrarRanking, setMostrarRanking] = useState(false);
  const [ranking, setRanking] = useState<PizarraTriviaRankingItem[] | null>(null);

  useEffect(() => {
    fetchPizarraTriviaHoy(slug)
      .then(setTrivia)
      .catch(() => setTrivia(null));
  }, [slug]);

  async function responder(opcionIndex: number) {
    if (!trivia || trivia.yaRespondida || enviando) return;
    setEnviando(true);
    try {
      const actualizada = await responderPizarraTrivia(slug, opcionIndex);
      setTrivia(actualizada);
    } catch {
      // el usuario puede reintentar
    } finally {
      setEnviando(false);
    }
  }

  function alternarRanking() {
    const siguiente = !mostrarRanking;
    setMostrarRanking(siguiente);
    if (siguiente && ranking === null) {
      fetchPizarraTriviaRanking(slug)
        .then(setRanking)
        .catch(() => setRanking([]));
    }
  }

  if (!trivia) return null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
          <Brain className="h-3.5 w-3.5" />
          Trivia del día
        </span>
        <button onClick={alternarRanking} className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
          <Trophy className="h-3 w-3" />
          Ranking
        </button>
      </div>

      <p className="mt-2 text-sm font-medium text-zinc-900">{trivia.pregunta}</p>

      <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {trivia.opciones.map((opcion, i) => {
          const esCorrecta = trivia.correctaIndex === i;
          const mostrarResultado = trivia.yaRespondida;
          return (
            <button
              key={i}
              onClick={() => void responder(i)}
              disabled={trivia.yaRespondida || enviando}
              className={`rounded-md border bg-white px-2.5 py-1.5 text-left text-xs transition-colors ${
                mostrarResultado
                  ? esCorrecta
                    ? "border-success bg-success/10 text-success"
                    : "border-zinc-200 text-zinc-400"
                  : "border-zinc-200 text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              {opcion}
            </button>
          );
        })}
      </div>

      {trivia.yaRespondida && (
        <p className={`mt-2 text-xs font-medium ${trivia.correcta ? "text-success" : "text-destructive"}`}>
          {trivia.correcta ? "¡Correcto! 🎉" : "No era esa — ¡mañana hay otra!"}
        </p>
      )}

      {mostrarRanking && (
        <div className="mt-3 space-y-1.5 border-t border-zinc-200 pt-2.5">
          {ranking === null && <p className="text-xs text-zinc-500">Cargando…</p>}
          {ranking !== null && ranking.length === 0 && (
            <p className="text-xs text-zinc-500">Todavía nadie ha respondido.</p>
          )}
          {ranking?.map((r, i) => (
            <div key={r.usuarioId} className="flex items-center gap-2 text-xs">
              <span className="w-4 text-zinc-500">{i + 1}.</span>
              <Avatar nombreCompleto={r.nombre} fotoUrl={r.fotoUrl} size="sm" />
              <span className="flex-1 text-zinc-900">{r.nombre}</span>
              <span className="text-zinc-500">{r.aciertos} aciertos</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
