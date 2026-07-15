import { Sparkles } from "lucide-react";

function fechaHoy(): string {
  const texto = new Date().toLocaleDateString("es-DO", { weekday: "long", day: "2-digit", month: "long" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function ResumenHoyCard({ bitacorasHoy, totalBitacoras }: { bitacorasHoy: number; totalBitacoras: number }) {
  return (
    <div className="bg-gradient-mesh-dark relative flex h-full select-none flex-col overflow-hidden rounded-xl bg-accent-dark p-4 text-accent-dark-foreground shadow-elegant">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-accent-dark-foreground/60 uppercase">Hoy</p>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-1 text-xs text-accent-dark-foreground/60">{fechaHoy()}</p>
      <p className="font-display mt-3 text-3xl font-semibold tracking-tight tabular-nums">{bitacorasHoy}</p>
      <p className="mt-1 text-xs text-accent-dark-foreground/70">
        bitácora{bitacorasHoy === 1 ? "" : "s"} enviada{bitacorasHoy === 1 ? "" : "s"} hoy
      </p>
      <p className="mt-auto pt-3 text-[11px] text-accent-dark-foreground/50">{totalBitacoras} bitácoras este mes</p>
    </div>
  );
}
