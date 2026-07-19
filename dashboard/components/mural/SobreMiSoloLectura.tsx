import { Music2, Sparkles, ThumbsDown, ThumbsUp, Wand2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { type PerfilMural } from "@/lib/api";

const CAMPOS: {
  key: keyof Pick<PerfilMural, "apodo" | "meGusta" | "noMeGusta" | "cancionFavorita" | "superpoder">;
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "apodo", label: "Apodo", icon: Sparkles },
  { key: "meGusta", label: "Le alegra el día", icon: ThumbsUp },
  { key: "noMeGusta", label: "No le gusta ni un poquito", icon: ThumbsDown },
  { key: "cancionFavorita", label: "Su canción del momento", icon: Music2 },
  { key: "superpoder", label: "Su superpoder imaginario", icon: Wand2 },
];

export function SobreMiSoloLectura({ perfil }: { perfil: PerfilMural }) {
  const campos = CAMPOS.filter((c) => perfil[c.key]);

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <Sparkles className="h-4 w-4" />
        </span>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Sobre esta persona</p>
      </div>

      {campos.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Todavía no completó su perfil divertido.</p>
      ) : (
        <dl className="mt-3 space-y-2.5">
          {campos.map((campo) => (
            <div key={campo.key} className="flex items-start gap-2 text-sm">
              <campo.icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">{campo.label}</dt>
                <dd className="text-foreground">{perfil[campo.key]}</dd>
              </div>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
