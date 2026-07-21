import { Fingerprint, Music2, Sparkles, ThumbsDown, ThumbsUp, Wand2 } from "lucide-react";
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
  const tienePersonalidades = perfil.personalidades.length > 0;

  if (campos.length === 0 && !tienePersonalidades) {
    return <p className="text-sm text-muted-foreground">Todavía no completó su perfil divertido.</p>;
  }

  return (
    <dl className="space-y-2.5">
      {tienePersonalidades && (
        <div className="flex items-start gap-2 text-sm">
          <Fingerprint className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <div>
            <dt className="text-xs text-muted-foreground">Personalidad</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {perfil.personalidades.map((p, i) => (
                <span key={i} className="rounded-full bg-accent px-2 py-0.5 text-xs text-foreground">
                  {p}
                </span>
              ))}
            </dd>
          </div>
        </div>
      )}
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
  );
}
