"use client";

import { useEffect, useState } from "react";
import { Lock, Mail, Plus, Rocket } from "lucide-react";
import { type PizarraTimeCapsula, crearPizarraTimeCapsula, fetchPizarraTimeCapsulas } from "@/lib/api";

const CAMPO_CLASES =
  "w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none focus:border-primary";

function fechaMinima(): string {
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  return manana.toISOString().slice(0, 10);
}

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-DO", { day: "2-digit", month: "long", year: "numeric" });
}

export function WidgetTimeCapsule({ slug }: { slug: string }) {
  const [capsulas, setCapsulas] = useState<PizarraTimeCapsula[] | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [fechaApertura, setFechaApertura] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPizarraTimeCapsulas(slug)
      .then(setCapsulas)
      .catch(() => setCapsulas([]));
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!mensaje.trim() || !fechaApertura) return;
    setEnviando(true);
    setError(null);
    try {
      const nueva = await crearPizarraTimeCapsula(slug, { mensaje: mensaje.trim(), fechaApertura });
      setCapsulas((prev) => [...(prev ?? []), nueva].sort((a, b) => a.fechaApertura.localeCompare(b.fechaApertura)));
      setMensaje("");
      setFechaApertura("");
      setAbierto(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cápsula");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
          <Rocket className="h-3.5 w-3.5 text-indigo-500" />
          Time Capsule
        </span>
        <button
          onClick={() => setAbierto((v) => !v)}
          className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
        >
          <Plus className="h-3 w-3" />
          Escribir
        </button>
      </div>
      <p className="mt-1 text-xs text-zinc-500">Escribe una nota para tu yo futuro — se sella hasta la fecha que elijas.</p>

      {abierto && (
        <form onSubmit={(e) => void handleSubmit(e)} className="mt-2 space-y-2 rounded-md border border-zinc-200 bg-white p-2.5">
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Querido yo del futuro..."
            className={CAMPO_CLASES}
            required
          />
          <input
            type="date"
            value={fechaApertura}
            onChange={(e) => setFechaApertura(e.target.value)}
            min={fechaMinima()}
            className={CAMPO_CLASES}
            required
          />
          {error && <p className="text-[11px] text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={enviando}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
          >
            {enviando ? "Guardando..." : "Sellar cápsula"}
          </button>
        </form>
      )}

      {capsulas && capsulas.length > 0 && (
        <div className="mt-2.5 space-y-1.5 border-t border-zinc-200 pt-2">
          {capsulas.map((c) => (
            <div key={c.id} className="flex items-start gap-2 text-xs">
              {c.abierta ? (
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
              ) : (
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
              )}
              <div className="min-w-0 flex-1">
                {c.abierta ? (
                  <p className="whitespace-pre-wrap text-zinc-900">{c.mensaje}</p>
                ) : (
                  <p className="text-zinc-500">Sellada hasta el {formatearFecha(c.fechaApertura)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
