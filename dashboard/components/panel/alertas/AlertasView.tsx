"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CircleAlert, PartyPopper } from "lucide-react";
import { type AlertaItem, type AlertasResponse, type SeveridadAlerta, fetchAlertas } from "@/lib/api";
import { usePanel } from "../PanelContext";
import { FiltroDepartamento } from "../FiltroDepartamento";
import { Avatar } from "@/components/Avatar";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { SkeletonStatCards, SkeletonTableRows } from "@/components/motion/Skeleton";

const ESTILO_SEVERIDAD: Record<
  SeveridadAlerta,
  { icon: typeof AlertTriangle; texto: string; borde: string; fondo: string }
> = {
  critica: { icon: AlertTriangle, texto: "text-destructive", borde: "border-l-destructive", fondo: "bg-destructive/10" },
  advertencia: { icon: CircleAlert, texto: "text-warning", borde: "border-l-warning", fondo: "bg-warning/10" },
  positiva: { icon: PartyPopper, texto: "text-success", borde: "border-l-success", fondo: "bg-success/10" },
};

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" });
}

function TarjetaAlerta({ alerta, slug }: { alerta: AlertaItem; slug: string }) {
  const estilo = ESTILO_SEVERIDAD[alerta.severidad];
  return (
    <div className={`flex items-start gap-3 border-l-4 ${estilo.borde} rounded-r-lg border border-border bg-card p-3.5 shadow-card`}>
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${estilo.fondo}`}>
        <estilo.icon className={`h-4 w-4 ${estilo.texto}`} />
      </span>
      <Avatar nombreCompleto={alerta.nombreCompleto} fotoUrl={alerta.fotoUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link href={`/${slug}/empleados/${alerta.talentoId}`} className="text-sm font-semibold text-foreground hover:text-primary">
            {alerta.nombreCompleto}
          </Link>
          <span className="text-[11px] text-muted-foreground">{formatearFecha(alerta.fecha)}</span>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{alerta.mensaje}</p>
      </div>
    </div>
  );
}

type Estado = { tipo: "cargando" } | { tipo: "error" } | { tipo: "listo"; datos: AlertasResponse };

export function AlertasView() {
  const { slug } = usePanel();
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [departamento, setDepartamento] = useState("");

  useEffect(() => {
    let cancelado = false;
    fetchAlertas(slug, departamento || undefined)
      .then((datos) => {
        if (!cancelado) setEstado({ tipo: "listo", datos });
      })
      .catch(() => {
        if (!cancelado) setEstado({ tipo: "error" });
      });
    return () => {
      cancelado = true;
    };
  }, [slug, departamento]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-lg font-semibold text-foreground">Alertas</h1>
          <p className="text-sm text-muted-foreground">Detección automática de riesgos y reconocimientos — calculada en vivo sobre el mes en curso</p>
        </div>
        <FiltroDepartamento value={departamento} onChange={setDepartamento} />
      </div>

      {estado.tipo === "cargando" && (
        <div className="space-y-4">
          <SkeletonStatCards count={3} />
          <div className="rounded-lg border border-border bg-card">
            <table className="w-full">
              <tbody>
                <SkeletonTableRows rows={5} cols={1} />
              </tbody>
            </table>
          </div>
        </div>
      )}

      {estado.tipo === "error" && <p className="text-sm text-destructive">No se pudieron cargar las alertas.</p>}

      {estado.tipo === "listo" && (
        <>
          <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StaggerItem>
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Críticas</p>
                </div>
                <p className="font-display mt-2 text-2xl font-semibold text-foreground tabular-nums">
                  {estado.datos.resumen.criticas}
                </p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <div className="flex items-center gap-2">
                  <CircleAlert className="h-4 w-4 text-warning" />
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Advertencias</p>
                </div>
                <p className="font-display mt-2 text-2xl font-semibold text-foreground tabular-nums">
                  {estado.datos.resumen.advertencias}
                </p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <div className="flex items-center gap-2">
                  <PartyPopper className="h-4 w-4 text-success" />
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Positivas</p>
                </div>
                <p className="font-display mt-2 text-2xl font-semibold text-foreground tabular-nums">
                  {estado.datos.resumen.positivas}
                </p>
              </div>
            </StaggerItem>
          </StaggerGroup>

          {estado.datos.alertas.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-card">
              Todo en orden — no hay alertas activas.
            </div>
          ) : (
            <StaggerGroup className="space-y-2">
              {estado.datos.alertas.map((alerta) => (
                <StaggerItem key={alerta.id}>
                  <TarjetaAlerta alerta={alerta} slug={slug} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </>
      )}
    </div>
  );
}
