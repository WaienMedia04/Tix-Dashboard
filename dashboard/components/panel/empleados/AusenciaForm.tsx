"use client";

import { useState } from "react";
import { CalendarOff } from "lucide-react";
import { type TipoAusencia, crearAusencia } from "@/lib/api";

const OPCIONES_TIPO: { value: TipoAusencia; label: string }[] = [
  { value: "PERMISO", label: "Permiso" },
  { value: "LICENCIA_MEDICA", label: "Licencia médica" },
  { value: "VACACIONES", label: "Vacaciones" },
];

const CAMPO_CLASES =
  "rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";

function hoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AusenciaForm({ slug, talentoId }: { slug: string; talentoId: string }) {
  const [abierto, setAbierto] = useState(false);
  const [tipo, setTipo] = useState<TipoAusencia>("VACACIONES");
  const [fechaInicio, setFechaInicio] = useState(hoyIso());
  const [fechaFin, setFechaFin] = useState(hoyIso());
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ tipo: "ok"; omitidas: string[] } | { tipo: "error" } | null>(null);

  function reiniciar() {
    setTipo("VACACIONES");
    setFechaInicio(hoyIso());
    setFechaFin(hoyIso());
    setMotivo("");
    setResultado(null);
  }

  function enviar() {
    setEnviando(true);
    setResultado(null);
    crearAusencia(slug, { talentoId, tipo, fechaInicio, fechaFin, motivo: motivo.trim() || undefined })
      .then((res) => {
        setResultado({ tipo: "ok", omitidas: res.fechasOmitidas });
      })
      .catch(() => setResultado({ tipo: "error" }))
      .finally(() => setEnviando(false));
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <CalendarOff className="h-3.5 w-3.5" />
        Registrar permiso / licencia / vacaciones
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Registrar permiso, licencia o vacaciones
        </p>
        <button
          onClick={() => {
            setAbierto(false);
            reiniciar();
          }}
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Cerrar
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-muted-foreground">Tipo</span>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoAusencia)} className={CAMPO_CLASES}>
            {OPCIONES_TIPO.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <div />
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-muted-foreground">Desde</span>
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className={CAMPO_CLASES} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-muted-foreground">Hasta</span>
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className={CAMPO_CLASES} />
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-[11px] text-muted-foreground">Motivo (opcional)</span>
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className={CAMPO_CLASES}
            maxLength={500}
          />
        </label>
      </div>

      {resultado?.tipo === "ok" && (
        <p className="mt-3 text-xs text-success">
          Registrado.{" "}
          {resultado.omitidas.length > 0 &&
            `${resultado.omitidas.length} fecha(s) ya tenían una bitácora y no se modificaron: ${resultado.omitidas.join(", ")}.`}
        </p>
      )}
      {resultado?.tipo === "error" && (
        <p className="mt-3 text-xs text-destructive">No se pudo registrar. Intenta de nuevo.</p>
      )}

      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={enviar}
          disabled={enviando || !fechaInicio || !fechaFin}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {enviando ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
