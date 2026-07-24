"use client";

import { useEffect, useState } from "react";
import { Ban, Check } from "lucide-react";
import { actualizarPerfilMural } from "@/lib/api";
import { MASCOTAS_MURAL } from "@/lib/mural-mascotas";

export function SelectorMascota({
  mascotaId,
  mascotaNombre,
  onCambiado,
  onCambiadoNombre,
}: {
  mascotaId: string | null;
  mascotaNombre: string | null;
  onCambiado: (mascotaId: string | null) => void;
  onCambiadoNombre: (mascotaNombre: string | null) => void;
}) {
  const [guardando, setGuardando] = useState<string | null>(null);
  const [nombre, setNombre] = useState(mascotaNombre ?? "");
  const [guardandoNombre, setGuardandoNombre] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza el input si el nombre cambia desde afuera
    setNombre(mascotaNombre ?? "");
  }, [mascotaNombre]);

  async function elegir(id: string | null) {
    if (id === mascotaId) return;
    setGuardando(id ?? "ninguna");
    try {
      await actualizarPerfilMural({ mascotaId: id });
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

        {MASCOTAS_MURAL.map((m) => {
          const activo = mascotaId === m.id;
          return (
            <button
              key={m.id}
              onClick={() => void elegir(m.id)}
              disabled={guardando !== null}
              className={`flex w-20 flex-col items-center gap-1.5 rounded-lg border-2 p-2.5 text-center transition-transform disabled:cursor-not-allowed ${
                activo ? "border-primary" : "border-border"
              }`}
              style={{ transform: guardando === m.id ? "scale(0.96)" : undefined }}
            >
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-accent">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/mascotas/${m.id}.png`} alt="" className="h-full w-full object-contain" />
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
                {m.label}
                {activo && <Check className="h-3 w-3 text-primary" />}
              </span>
            </button>
          );
        })}
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
