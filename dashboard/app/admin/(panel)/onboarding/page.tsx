"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import {
  type EstadoSolicitudImplementacion,
  type SolicitudImplementacionResumen,
  AdminNoAutorizadoError,
  fetchSolicitudesImplementacionAdmin,
} from "@/lib/admin-api";
import { leerTokenAdmin, borrarTokenAdmin } from "@/lib/admin-auth";
import { LoadingScreen } from "@/components/LoadingScreen";

const ESTADO_ESTILO: Record<EstadoSolicitudImplementacion, string> = {
  NUEVA: "bg-primary/10 text-primary",
  EN_PROCESO: "bg-warning/10 text-warning",
  COMPLETADA: "bg-success/10 text-success",
};

const ESTADO_LABEL: Record<EstadoSolicitudImplementacion, string> = {
  NUEVA: "Nueva",
  EN_PROCESO: "En proceso",
  COMPLETADA: "Completada",
};

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleString("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminOnboardingPage() {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<SolicitudImplementacionResumen[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = leerTokenAdmin();
    if (!token) {
      router.replace("/admin");
      return;
    }
    fetchSolicitudesImplementacionAdmin(token)
      .then(setSolicitudes)
      .catch((err) => {
        if (err instanceof AdminNoAutorizadoError) {
          borrarTokenAdmin();
          router.replace("/admin");
        } else {
          setError("No se pudieron cargar las solicitudes de implementación.");
        }
      });
  }, [router]);

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!solicitudes) return <LoadingScreen />;

  return (
    <div className="max-w-4xl space-y-4">
      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-display text-base font-semibold text-foreground">
            Solicitudes de implementación ({solicitudes.length})
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Formularios de onboarding enviados por clientes prospecto — úsalos para crear la empresa y moldear su
            agente TIX.
          </p>
        </div>

        <div className="divide-y divide-border">
          {solicitudes.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              <ClipboardList className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
              Todavía no hay solicitudes.
            </div>
          ) : (
            solicitudes.map((s) => (
              <Link
                key={s.id}
                href={`/admin/onboarding/${s.id}`}
                className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-accent/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{s.empresaNombre}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.contactoNombre} · {s.contactoCorreo}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-muted-foreground">{formatearFecha(s.createdAt)}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTADO_ESTILO[s.estado]}`}>
                    {ESTADO_LABEL[s.estado]}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
