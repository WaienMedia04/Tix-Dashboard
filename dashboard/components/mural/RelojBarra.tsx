"use client";

import { useEffect, useState } from "react";

/** Reloj + fecha en vivo — null en el primer render para no desajustar con el HTML del servidor. */
export function RelojBarra() {
  const [ahora, setAhora] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- primer valor real solo puede conocerse en cliente
    setAhora(new Date());
    const id = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!ahora) return null;

  const hora = ahora.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" });
  const fecha = ahora.toLocaleDateString("es-DO", { weekday: "short", day: "2-digit", month: "short" });

  return (
    <div className="hidden flex-col items-end leading-tight sm:flex">
      <span className="text-xs font-semibold tabular-nums text-foreground">{hora}</span>
      <span className="text-[10px] text-muted-foreground capitalize">{fecha}</span>
    </div>
  );
}
