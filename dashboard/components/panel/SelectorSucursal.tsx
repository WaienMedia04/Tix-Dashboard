"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, ChevronDown } from "lucide-react";
import { usePanel } from "./PanelContext";

/** Botón arriba a la derecha del panel para cambiar entre las empresas/sucursales vinculadas — solo CEO/RRHH, y solo si hay más de una. */
export function SelectorSucursal() {
  const { slug, rol, empresa, empresasDisponibles } = usePanel();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickFuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", onClickFuera);
    return () => document.removeEventListener("mousedown", onClickFuera);
  }, []);

  if ((rol !== "CEO" && rol !== "RRHH") || empresasDisponibles.length <= 1) {
    return null;
  }

  return (
    <div ref={contenedorRef} className="relative">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Building2 className="h-3.5 w-3.5" />
        <span className="hidden max-w-[10rem] truncate sm:inline">{empresa.nombre}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {abierto && (
        <div className="absolute top-full right-0 z-30 mt-1.5 w-56 overflow-hidden rounded-md border border-border bg-popover py-1 shadow-elegant">
          <p className="px-3 py-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Cambiar de empresa
          </p>
          {empresasDisponibles.map((e) => (
            <button
              key={e.slug}
              onClick={() => {
                setAbierto(false);
                if (e.slug !== slug) router.push(`/${e.slug}/dashboard`);
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
            >
              <span className="truncate">{e.nombre}</span>
              {e.slug === slug && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
