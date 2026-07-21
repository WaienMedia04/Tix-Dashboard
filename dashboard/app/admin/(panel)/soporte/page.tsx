"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Lightbulb } from "lucide-react";
import {
  type SolicitudSoporteAdmin,
  AdminNoAutorizadoError,
  fetchSolicitudesSoporteAdmin,
  marcarSolicitudSoporteLeidaAdmin,
} from "@/lib/admin-api";
import { leerTokenAdmin, borrarTokenAdmin } from "@/lib/admin-auth";
import { LoadingScreen } from "@/components/LoadingScreen";

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleString("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminSoportePage() {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<SolicitudSoporteAdmin[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [marcandoId, setMarcandoId] = useState<string | null>(null);

  useEffect(() => {
    const token = leerTokenAdmin();
    if (!token) {
      router.replace("/admin");
      return;
    }
    fetchSolicitudesSoporteAdmin(token)
      .then(setSolicitudes)
      .catch((err) => {
        if (err instanceof AdminNoAutorizadoError) {
          borrarTokenAdmin();
          router.replace("/admin");
        } else {
          setError("No se pudo cargar las solicitudes de soporte.");
        }
      });
  }, [router]);

  async function marcarLeida(id: string) {
    const token = leerTokenAdmin();
    if (!token) return;
    setMarcandoId(id);
    try {
      await marcarSolicitudSoporteLeidaAdmin(token, id);
      setSolicitudes((prev) => prev?.map((s) => (s.id === id ? { ...s, leida: true } : s)) ?? prev);
    } finally {
      setMarcandoId(null);
    }
  }

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!solicitudes) return <LoadingScreen />;

  return (
    <div className="max-w-3xl space-y-4">
      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-display text-base font-semibold text-foreground">
            Solicitudes de soporte ({solicitudes.length})
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Averías y sugerencias enviadas desde el Dock del panel de cada empresa.
          </p>
        </div>

        <div className="divide-y divide-border">
          {solicitudes.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">No hay solicitudes todavía.</p>
          ) : (
            solicitudes.map((s) => {
              const Icon = s.tipo === "AVERIA" ? AlertTriangle : Lightbulb;
              return (
                <div key={s.id} className={`flex items-start gap-3 px-5 py-4 ${s.leida ? "opacity-60" : ""}`}>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                      s.tipo === "AVERIA" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {s.empresa.nombre} <span className="text-muted-foreground">— {s.usuario.nombre}</span>
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">{formatearFecha(s.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm whitespace-pre-wrap text-foreground">{s.mensaje}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{s.usuario.email}</span>
                      {!s.leida && (
                        <button
                          onClick={() => void marcarLeida(s.id)}
                          disabled={marcandoId === s.id}
                          className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                        >
                          {marcandoId === s.id ? "Marcando..." : "Marcar como leída"}
                        </button>
                      )}
                      {s.leida && <span className="text-xs text-success">Leída</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
