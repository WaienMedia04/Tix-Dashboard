"use client";

import { useState } from "react";
import { Building2, ShieldCheck } from "lucide-react";
import { UserProfile } from "@clerk/nextjs";
import { usePanel } from "../PanelContext";
import { ListaEmpleados } from "./ListaEmpleados";
import { Modal } from "@/components/Modal";

export function ConfiguracionView() {
  const { slug, empresa } = usePanel();
  const [seguridadAbierta, setSeguridadAbierta] = useState(false);

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

      <div className="rounded-lg border border-border bg-card p-4 shadow-card">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Seguridad</p>
              <p className="mt-0.5 text-sm text-foreground">Contraseña, verificación en dos pasos y sesiones activas</p>
            </div>
          </div>
          <button
            onClick={() => setSeguridadAbierta(true)}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Gestionar
          </button>
        </div>
      </div>

      <ListaEmpleados slug={slug} />

      <Modal open={seguridadAbierta} onClose={() => setSeguridadAbierta(false)} title="Seguridad" size="xl">
        <UserProfile routing="hash" />
      </Modal>
    </div>
  );
}
