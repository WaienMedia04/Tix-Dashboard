"use client";

import { Building2 } from "lucide-react";
import { usePanel } from "../PanelContext";
import { ListaEmpleados } from "./ListaEmpleados";

export function ConfiguracionView() {
  const { slug, empresa } = usePanel();

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4 shadow-card">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Building2 className="h-4 w-4" />
          </span>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Datos de la empresa</p>
        </div>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Nombre</dt>
            <dd className="font-medium text-foreground">{empresa.nombre}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Identificador</dt>
            <dd className="font-medium text-foreground">/{empresa.slug}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Plan</dt>
            <dd className="font-medium text-foreground capitalize">{empresa.plan}</dd>
          </div>
        </dl>
      </div>

      <ListaEmpleados slug={slug} />
    </div>
  );
}
