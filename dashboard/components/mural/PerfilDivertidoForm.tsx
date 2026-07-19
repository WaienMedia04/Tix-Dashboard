"use client";

import { useState } from "react";
import { Music2, Sparkles, ThumbsDown, ThumbsUp, Wand2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { type PerfilMural, actualizarPerfilMural } from "@/lib/api";

const CAMPO_CLASES =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";

const CAMPOS: {
  key: keyof Pick<PerfilMural, "apodo" | "meGusta" | "noMeGusta" | "cancionFavorita" | "superpoder">;
  label: string;
  placeholder: string;
  icon: LucideIcon;
}[] = [
  { key: "apodo", label: "Apodo", placeholder: "¿Cómo te dicen tus compañeros?", icon: Sparkles },
  { key: "meGusta", label: "Algo que me alegra el día", placeholder: "El café, el reggaetón, los memes...", icon: ThumbsUp },
  { key: "noMeGusta", label: "Algo que no me gusta ni un poquito", placeholder: "Las reuniones sin agenda...", icon: ThumbsDown },
  { key: "cancionFavorita", label: "Mi canción del momento", placeholder: "Título — Artista", icon: Music2 },
  { key: "superpoder", label: "Mi superpoder imaginario", placeholder: "Teletransportación, leer mentes...", icon: Wand2 },
];

export function PerfilDivertidoForm({
  perfil,
  onActualizado,
}: {
  perfil: PerfilMural;
  onActualizado: (perfil: PerfilMural) => void;
}) {
  const [form, setForm] = useState({
    apodo: perfil.apodo ?? "",
    meGusta: perfil.meGusta ?? "",
    noMeGusta: perfil.noMeGusta ?? "",
    cancionFavorita: perfil.cancionFavorita ?? "",
    superpoder: perfil.superpoder ?? "",
  });
  const [guardando, setGuardando] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardadoOk(false);
    setGuardando(true);
    try {
      const actualizado = await actualizarPerfilMural(form);
      onActualizado(actualizado);
      setGuardadoOk(true);
    } catch {
      setError("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
      {CAMPOS.map((campo) => (
        <label key={campo.key} className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <campo.icon className="h-3.5 w-3.5" />
            {campo.label}
          </span>
          <input
            value={form[campo.key]}
            onChange={(e) => setForm((f) => ({ ...f, [campo.key]: e.target.value }))}
            placeholder={campo.placeholder}
            maxLength={120}
            className={CAMPO_CLASES}
          />
        </label>
      ))}

      {error && <p className="text-xs text-destructive">{error}</p>}
      {guardadoOk && <p className="text-xs text-success">¡Guardado!</p>}

      <button
        type="submit"
        disabled={guardando}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        {guardando ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
